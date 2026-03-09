'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft, ChevronRight, Home, Plus, Settings, CalendarDays,
  DollarSign, TrendingDown, TrendingUp, X, AlertTriangle, Wallet,
  Loader2, CheckCircle, PlusCircle, Trash2, Pencil, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchBills, getUserPreferences, setUserPreferences, markBillFullyPaid,
  addIncomeEntry, getIncomeForMonth, updateIncomeEntry, deleteIncomeEntry,
  Bill, PaydaySchedule, IncomeEntry,
} from '../lib/firebase';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toYMD(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getPaydaysInMonth(schedule: PaydaySchedule, year: number, month: number): Date[] {
  const anchor = new Date(schedule.nextPayday + 'T12:00:00');
  const result: Date[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd   = new Date(year, month + 1, 0);

  if (schedule.type === 'monthly') {
    const d = new Date(year, month, anchor.getDate());
    if (d <= monthEnd) result.push(d);
  } else if (schedule.type === 'semimonthly') {
    result.push(new Date(year, month, 1));
    result.push(new Date(year, month, 15));
  } else {
    const stepMs = (schedule.type === 'weekly' ? 7 : 14) * 86400000;
    let cur = new Date(anchor);
    while (cur > monthStart) cur = new Date(cur.getTime() - stepMs);
    while (cur <= monthEnd) {
      if (cur >= monthStart) result.push(new Date(cur));
      cur = new Date(cur.getTime() + stepMs);
    }
  }
  return result;
}

function groupBillsByDay(bills: Bill[], year: number, month: number): Map<number, Bill[]> {
  const map = new Map<number, Bill[]>();
  for (const bill of bills) {
    const d = new Date(bill.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(bill);
    }
  }
  return map;
}

function groupIncomeByDay(entries: IncomeEntry[]): Map<number, IncomeEntry[]> {
  const map = new Map<number, IncomeEntry[]>();
  for (const e of entries) {
    const day = parseInt(e.date.split('-')[2], 10);
    if (!map.has(day)) map.set(day, []);
    map.get(day)!.push(e);
  }
  return map;
}

export default function CalendarPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const today = useMemo(() => new Date(), []);

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  const [bills,    setBills]    = useState<Bill[]>([]);
  const [incomes,  setIncomes]  = useState<IncomeEntry[]>([]);
  const [loading,  setLoading]  = useState(true);

  const [selectedDay,    setSelectedDay]    = useState<number | null>(null);
  const [paydaySchedule, setPaydaySchedule] = useState<PaydaySchedule | null>(null);
  const [showIncomeSetup, setShowIncomeSetup] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ type: 'biweekly', amount: '', nextPayday: '' });
  const [savingIncome,  setSavingIncome]  = useState(false);
  const [markingPaid,   setMarkingPaid]   = useState<Set<string>>(new Set());

  // Add Income inline form (within day popup)
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [addIncomeForm, setAddIncomeForm] = useState({ amount: '', description: '', frequency: 'once' as IncomeEntry['frequency'] });
  const [savingEntry,   setSavingEntry]   = useState(false);
  const [deletingEntry, setDeletingEntry] = useState<Set<string>>(new Set());
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', description: '', frequency: 'once' as IncomeEntry['frequency'] });
  const [savingEdit, setSavingEdit] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  // Load payday schedule
  useEffect(() => {
    if (!user) return;
    getUserPreferences(user.uid).then(prefs => {
      if (prefs.paydaySchedule) {
        setPaydaySchedule(prefs.paydaySchedule);
        setIncomeForm({
          type: prefs.paydaySchedule.type,
          amount: String(prefs.paydaySchedule.amount),
          nextPayday: prefs.paydaySchedule.nextPayday,
        });
      }
    });
  }, [user]);

  // Load bills + income entries for current month
  const loadMonthData = useCallback(async (year: number, month: number) => {
    if (!user) return;
    setLoading(true);
    try {
      // Run independently so an income Firestore error never blocks bill display
      const allBills = await fetchBills(user.uid);
      console.log('[calendar] bills fetched:', allBills.length, allBills.map(b => ({ id: b.id, due: b.dueDate, status: b.status })));
      setBills(allBills);

      getIncomeForMonth(user.uid, year, month)
        .then(entries => setIncomes(entries))
        .catch(e => console.warn('[calendar] income fetch failed (check Firestore rules):', e));
    } catch (e) {
      console.error('[calendar] bill load error:', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadMonthData(currentYear, currentMonth);
  }, [loadMonthData, currentYear, currentMonth]);

  const prevMonth = () => {
    const [y, m] = currentMonth === 0
      ? [currentYear - 1, 11]
      : [currentYear, currentMonth - 1];
    setCurrentYear(y); setCurrentMonth(m); setSelectedDay(null);
  };
  const nextMonth = () => {
    const [y, m] = currentMonth === 11
      ? [currentYear + 1, 0]
      : [currentYear, currentMonth + 1];
    setCurrentYear(y); setCurrentMonth(m); setSelectedDay(null);
  };

  const { calendarDays, billsByDay, overdueBills, paydaysInMonth, incomeByDay } = useMemo(() => {
    const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const monthStart  = new Date(currentYear, currentMonth, 1);
    const activeBills = bills.filter(b => b.status !== 'paid');
    const billsByDay  = groupBillsByDay(activeBills, currentYear, currentMonth);
    const overdueBills = activeBills.filter(b => new Date(b.dueDate) < monthStart);
    const paydaysInMonth = paydaySchedule
      ? getPaydaysInMonth(paydaySchedule, currentYear, currentMonth)
      : [];
    const incomeByDay = groupIncomeByDay(incomes);

    return { calendarDays, billsByDay, overdueBills, paydaysInMonth, incomeByDay };
  }, [currentYear, currentMonth, bills, paydaySchedule, incomes]);

  const paydayDaySet = useMemo(
    () => new Set(paydaysInMonth.map(d => d.getDate())),
    [paydaysInMonth]
  );

  const monthlyScheduleIncome  = paydaySchedule ? paydaysInMonth.length * paydaySchedule.amount : 0;
  const monthlyEntryIncome     = incomes.reduce((s, e) => s + e.amount, 0);
  const monthlyIncome          = monthlyScheduleIncome + monthlyEntryIncome;
  const monthlyBills = useMemo(
    () => Array.from(billsByDay.values()).flat().reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0),
    [billsByDay]
  );
  const monthlyNet = monthlyIncome - monthlyBills;

  const hasLowFundsAlert = useMemo(() => {
    if (!paydaySchedule && incomes.length === 0) return false;
    let balance = 0;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      if (paydayDaySet.has(d)) balance += paydaySchedule!.amount;
      for (const e of incomeByDay.get(d) ?? []) balance += e.amount;
      for (const b of billsByDay.get(d) ?? []) balance -= (b.totalAmount - b.paidAmount);
      if (balance < 0) return true;
    }
    return false;
  }, [paydayDaySet, incomeByDay, billsByDay, paydaySchedule, incomes, currentYear, currentMonth]);

  const getDayStyle = (day: number) => {
    const hasBills  = billsByDay.has(day);
    const isPayday  = paydayDaySet.has(day);
    const hasIncome = incomeByDay.has(day);
    const hasAnyIncome = isPayday || hasIncome;
    if (!hasBills && !hasAnyIncome) return '';
    if (hasAnyIncome && !hasBills) return 'bg-emerald-500/15';
    if (!hasAnyIncome && hasBills) return 'bg-red-500/10';
    const scheduleIncome = isPayday && paydaySchedule ? paydaySchedule.amount : 0;
    const entryIncome    = (incomeByDay.get(day) ?? []).reduce((s, e) => s + e.amount, 0);
    const totalIncome    = scheduleIncome + entryIncome;
    const due            = (billsByDay.get(day) ?? []).reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
    return totalIncome >= due ? 'bg-emerald-500/15' : 'bg-red-500/10';
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  // Selected day data
  const selectedBills     = selectedDay ? (billsByDay.get(selectedDay) ?? []) : [];
  const selectedIncomes   = selectedDay ? (incomeByDay.get(selectedDay) ?? []) : [];
  const selectedIsPayday  = selectedDay ? paydayDaySet.has(selectedDay) : false;
  const selectedScheduleIncome = (selectedIsPayday && paydaySchedule) ? paydaySchedule.amount : 0;
  const selectedEntryIncome    = selectedIncomes.reduce((s, e) => s + e.amount, 0);
  const selectedTotalIncome    = selectedScheduleIncome + selectedEntryIncome;
  const selectedBillsTotal     = selectedBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

  // --- Handlers ---

  const handleMarkAsPaid = async (bill: Bill) => {
    if (!user || !bill.id || markingPaid.has(bill.id)) return;
    const billId = bill.id;
    setMarkingPaid(prev => new Set(prev).add(billId));
    try {
      await markBillFullyPaid(billId, user.uid);
      setBills(prev => prev.map(b =>
        b.id === billId ? { ...b, status: 'paid' as const, paidAmount: b.totalAmount } : b
      ));
      toast.success(`${bill.companyName ?? 'Bill'} marked as paid`);
      const remaining = billsByDay.get(selectedDay!)?.filter(b => b.id !== billId && b.status !== 'paid') ?? [];
      if (remaining.length === 0 && selectedIncomes.length === 0 && !selectedIsPayday) {
        setSelectedDay(null);
      }
    } catch (e) {
      console.error('[calendar] mark paid error:', e);
      toast.error('Failed to update bill');
    } finally {
      setMarkingPaid(prev => { const s = new Set(prev); s.delete(billId); return s; });
    }
  };

  const handleAddIncome = async () => {
    if (!user || !selectedDay || !addIncomeForm.amount) return;
    setSavingEntry(true);
    try {
      const id = await addIncomeEntry(user.uid, {
        amount: parseFloat(addIncomeForm.amount),
        date: toYMD(currentYear, currentMonth, selectedDay),
        description: addIncomeForm.description,
        frequency: addIncomeForm.frequency,
      });
      const newEntry: IncomeEntry = {
        id,
        userId: user.uid,
        amount: parseFloat(addIncomeForm.amount),
        date: toYMD(currentYear, currentMonth, selectedDay),
        description: addIncomeForm.description,
        frequency: addIncomeForm.frequency,
      };
      setIncomes(prev => [...prev, newEntry]);
      setAddIncomeForm({ amount: '', description: '', frequency: 'once' });
      setShowAddIncome(false);
      toast.success('Income added');
    } catch (e) {
      console.error('[calendar] add income error:', e);
      toast.error('Failed to add income');
    } finally {
      setSavingEntry(false);
    }
  };

  const startEditIncome = (entry: IncomeEntry) => {
    setEditingEntryId(entry.id ?? null);
    setEditForm({
      amount: String(entry.amount),
      description: entry.description ?? '',
      frequency: entry.frequency,
    });
  };

  const handleUpdateIncome = async (entry: IncomeEntry) => {
    if (!user || !entry.id || savingEdit) return;
    const amount = parseFloat(editForm.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    setSavingEdit(true);
    try {
      await updateIncomeEntry(user.uid, entry.id, {
        amount,
        description: editForm.description,
        frequency: editForm.frequency,
      });
      setIncomes(prev => prev.map(e =>
        e.id === entry.id
          ? { ...e, amount, description: editForm.description, frequency: editForm.frequency }
          : e
      ));
      setEditingEntryId(null);
      toast.success('Income updated');
    } catch (e) {
      console.error('[calendar] update income error:', e);
      toast.error('Failed to update income');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteIncome = async (entry: IncomeEntry) => {
    if (!user || !entry.id || deletingEntry.has(entry.id)) return;
    const entryId = entry.id;
    setDeletingEntry(prev => new Set(prev).add(entryId));
    try {
      await deleteIncomeEntry(user.uid, entryId);
      setIncomes(prev => prev.filter(e => e.id !== entryId));
      toast.success('Income removed');
    } catch (e) {
      console.error('[calendar] delete income error:', e);
      toast.error('Failed to remove income');
    } finally {
      setDeletingEntry(prev => { const s = new Set(prev); s.delete(entryId); return s; });
    }
  };

  const handleSaveSchedule = async () => {
    if (!user || !incomeForm.amount || !incomeForm.nextPayday) return;
    setSavingIncome(true);
    const schedule: PaydaySchedule = {
      type: incomeForm.type as PaydaySchedule['type'],
      amount: parseFloat(incomeForm.amount),
      nextPayday: incomeForm.nextPayday,
    };
    try {
      const prefs = await getUserPreferences(user.uid);
      await setUserPreferences(user.uid, { ...prefs, paydaySchedule: schedule });
      setPaydaySchedule(schedule);
      setShowIncomeSetup(false);
      toast.success('Income schedule saved');
    } catch (e) {
      console.error('[calendar] save schedule error:', e);
      toast.error('Failed to save schedule');
    } finally {
      setSavingIncome(false);
    }
  };

  // Auth loading screen
  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-24">

      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-400" />
            <h1 className="text-lg font-bold text-white">Cash Flow Calendar</h1>
          </div>
          <button
            onClick={() => setShowIncomeSetup(true)}
            className="flex items-center gap-1.5 text-xs bg-teal-500/20 text-teal-400 px-3 py-1.5 rounded-full border border-teal-500/30 hover:bg-teal-500/30 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            {paydaySchedule ? 'Edit Schedule' : 'Set Schedule'}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold text-lg">{MONTHS[currentMonth]} {currentYear}</h2>
          <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-slate-500 py-1 font-medium">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-teal-400" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const hasBills   = billsByDay.has(day);
              const isPayday   = paydayDaySet.has(day);
              const hasIncome  = incomeByDay.has(day);
              const billCount  = billsByDay.get(day)?.length ?? 0;
              const isSelected = selectedDay === day;
              const tappable   = true; // every day is tappable to add income

              return (
                <button
                  key={day}
                  onClick={() => {
                    setSelectedDay(isSelected ? null : day);
                    setShowAddIncome(false);
                    setEditingEntryId(null);
                    setAddIncomeForm({ amount: '', description: '', frequency: 'once' });
                  }}
                  className={`
                    relative flex flex-col items-center pt-1.5 pb-2 rounded-xl min-h-[54px]
                    transition-all duration-100
                    ${getDayStyle(day)}
                    ${isToday(day) ? 'ring-2 ring-teal-500' : ''}
                    ${isSelected ? 'ring-2 ring-white/40 scale-95' : ''}
                    cursor-pointer active:scale-90
                  `}
                >
                  <span className={`text-sm font-semibold ${
                    isToday(day)  ? 'text-teal-400'    :
                    hasBills      ? 'text-slate-200'    :
                    isPayday || hasIncome ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                    {(isPayday || hasIncome) && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                    {hasBills && billCount <= 2
                      ? Array.from({ length: billCount }).map((_, idx) => (
                          <div key={idx} className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        ))
                      : hasBills
                        ? <span className="text-[9px] bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold">{billCount}</span>
                        : null
                    }
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 px-1">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />Income
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-red-400" />Bill due
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <div className="w-3 h-3 rounded border-2 border-teal-500" />Today
          </div>
        </div>

        {/* Low funds alert */}
        {hasLowFundsAlert && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">Projected cash shortfall this month. Review your bill timing.</p>
          </div>
        )}

        {/* Monthly summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Summary</h3>
          <div className="space-y-2.5">
            {(paydaySchedule || incomes.length > 0) && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Money In
                  {paydaySchedule && paydaysInMonth.length > 0 && (
                    <span className="text-xs text-slate-500">({paydaysInMonth.length} payday{paydaysInMonth.length !== 1 ? 's' : ''}{incomes.length > 0 ? ` + ${incomes.length} entry` : ''})</span>
                  )}
                </div>
                <span className="text-emerald-400 font-semibold text-sm">+${monthlyIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <TrendingDown className="w-4 h-4 text-red-400" />
                Bills Due ({billsByDay.size} day{billsByDay.size !== 1 ? 's' : ''})
              </div>
              <span className="text-red-400 font-semibold text-sm">−${monthlyBills.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
            </div>
            {(paydaySchedule || incomes.length > 0) && (
              <>
                <div className="border-t border-slate-700" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-200">Net</span>
                  <span className={`font-bold text-sm ${monthlyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {monthlyNet >= 0 ? '+' : ''}${monthlyNet.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </>
            )}
            {!paydaySchedule && incomes.length === 0 && (
              <button
                onClick={() => setShowIncomeSetup(true)}
                className="w-full text-xs text-teal-400 border border-teal-500/30 rounded-lg py-2 hover:bg-teal-500/10 transition-colors mt-1"
              >
                + Set recurring income or tap any day to add one-time income
              </button>
            )}
          </div>
        </div>

        {!loading && billsByDay.size === 0 && overdueBills.length === 0 && (
          <p className="text-center text-slate-500 text-sm py-2">No unpaid bills this month. Tap any day to add income.</p>
        )}

        {/* Overdue bills from previous months */}
        {!loading && overdueBills.length > 0 && (
          <div className="mt-4 px-1">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <span>⚠</span> Overdue Bills
            </h3>
            <div className="space-y-2">
              {overdueBills.map(bill => (
                <div key={bill.id} className="flex items-center justify-between bg-slate-800/60 border border-red-500/20 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{bill.companyName}</p>
                    <p className="text-xs text-red-400">
                      Due {new Date(bill.dueDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      {bill.paidAmount > 0 ? ` · Paid $${bill.paidAmount.toFixed(2)} of` : ' ·'} ${bill.totalAmount.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkAsPaid(bill)}
                    disabled={markingPaid.has(bill.id!)}
                    className="text-xs bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
                  >
                    {markingPaid.has(bill.id!) ? '…' : 'Mark Paid'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Day detail bottom sheet ── */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => { setSelectedDay(null); setShowAddIncome(false); setEditingEntryId(null); }}>
          <div
            className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-t-3xl p-5 pb-10 shadow-2xl max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">{MONTHS[currentMonth]} {selectedDay}</h3>
              <button onClick={() => { setSelectedDay(null); setShowAddIncome(false); setEditingEntryId(null); }} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recurring payday banner */}
            {selectedIsPayday && paydaySchedule && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">
                  Payday — ${paydaySchedule.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Individual income entries */}
            {selectedIncomes.length > 0 && (
              <div className="space-y-2 mb-3">
                {selectedIncomes.map(entry => {
                  const isEditing = editingEntryId === entry.id;
                  const isDeleting = entry.id ? deletingEntry.has(entry.id) : false;

                  if (isEditing) {
                    return (
                      <div key={entry.id} className="bg-teal-500/10 border border-teal-500/30 rounded-xl p-3 space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="number" min="0.01" step="0.01"
                            value={editForm.amount}
                            onChange={e => setEditForm(f => ({ ...f, amount: e.target.value }))}
                            className="flex-1 bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                            placeholder="Amount ($)"
                            autoFocus
                          />
                          <select
                            value={editForm.frequency}
                            onChange={e => setEditForm(f => ({ ...f, frequency: e.target.value as IncomeEntry['frequency'] }))}
                            className="bg-slate-700 border border-slate-600 text-white rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="once">Once</option>
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                          className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Description (optional)"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateIncome(entry)}
                            disabled={savingEdit || !editForm.amount}
                            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold bg-teal-500/20 text-teal-400 border border-teal-500/40 rounded-lg py-2 hover:bg-teal-500/30 disabled:opacity-50 transition-colors"
                          >
                            {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            {savingEdit ? 'Saving…' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingEntryId(null)}
                            className="px-3 py-2 text-xs text-slate-400 bg-slate-700/60 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={entry.id} className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-emerald-300 text-sm font-medium">
                          +${entry.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                          {entry.frequency !== 'once' && (
                            <span className="text-xs text-emerald-500 ml-2 capitalize">({entry.frequency})</span>
                          )}
                        </p>
                        {entry.description && (
                          <p className="text-xs text-slate-400 truncate">{entry.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-2 shrink-0">
                        <button
                          onClick={() => startEditIncome(entry)}
                          className="p-1.5 text-slate-500 hover:text-teal-400 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteIncome(entry)}
                          disabled={isDeleting}
                          className="p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-40 transition-colors"
                          title="Delete"
                        >
                          {isDeleting
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bills list */}
            {selectedBills.length > 0 && (
              <div className="space-y-2 mb-4">
                {selectedBills.map(bill => {
                  const isPending = bill.id ? markingPaid.has(bill.id) : false;
                  const remaining = bill.totalAmount - bill.paidAmount;
                  return (
                    <div key={bill.id} className="bg-slate-700/60 rounded-xl px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-white text-sm font-medium truncate">{bill.companyName}</p>
                          <p className="text-xs text-slate-400 capitalize">{bill.status}</p>
                        </div>
                        <span className="text-white font-semibold text-sm shrink-0">
                          ${remaining.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <button
                        onClick={() => handleMarkAsPaid(bill)}
                        disabled={isPending}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/40 rounded-lg py-1.5 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
                      >
                        {isPending
                          ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</>
                          : <><CheckCircle className="w-3.5 h-3.5" />Mark as Paid</>
                        }
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Totals */}
            {(selectedBills.length > 0 || selectedTotalIncome > 0) && (
              <div className="border-t border-slate-700 pt-3 space-y-1.5 mb-4">
                {selectedBills.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Total bills due</span>
                    <span className="font-bold text-white text-sm">${selectedBillsTotal.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {selectedTotalIncome > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Income this day</span>
                    <span className="text-emerald-400 font-semibold text-sm">+${selectedTotalIncome.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {selectedTotalIncome > 0 && selectedBills.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Balance after bills</span>
                    <span className={`font-bold text-sm ${selectedTotalIncome - selectedBillsTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(selectedTotalIncome - selectedBillsTotal).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Add Income section */}
            {!showAddIncome ? (
              <button
                onClick={() => setShowAddIncome(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-teal-400 border border-teal-500/30 rounded-xl py-2.5 hover:bg-teal-500/10 transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Add Income for this day
              </button>
            ) : (
              <div className="border border-teal-500/30 rounded-xl p-4 space-y-3 bg-teal-500/5">
                <p className="text-sm font-semibold text-teal-400">Add Income</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={addIncomeForm.amount}
                      onChange={e => setAddIncomeForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="Amount ($)"
                      className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                      autoFocus
                    />
                  </div>
                  <select
                    value={addIncomeForm.frequency}
                    onChange={e => setAddIncomeForm(f => ({ ...f, frequency: e.target.value as IncomeEntry['frequency'] }))}
                    className="bg-slate-700 border border-slate-600 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="once">Once</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <input
                  type="text"
                  value={addIncomeForm.description}
                  onChange={e => setAddIncomeForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description (optional — e.g. Freelance, Tips)"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddIncome}
                    disabled={savingEntry || !addIncomeForm.amount}
                    className="flex-1 btn-accent py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {savingEntry ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving...</> : 'Save Income'}
                  </button>
                  <button
                    onClick={() => { setShowAddIncome(false); setAddIncomeForm({ amount: '', description: '', frequency: 'once' }); }}
                    className="px-4 py-2.5 rounded-xl text-sm text-slate-400 bg-slate-700/60 hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Income schedule bottom sheet ── */}
      {showIncomeSetup && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowIncomeSetup(false)}>
          <div
            className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Recurring Income Schedule</h3>
              <button onClick={() => setShowIncomeSetup(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">For regular paycheques. To add one-time income, tap any day on the calendar.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Pay frequency</label>
                <select
                  value={incomeForm.type}
                  onChange={e => setIncomeForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Bi-weekly (every 2 weeks)</option>
                  <option value="semimonthly">Semi-monthly (1st & 15th)</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Take-home pay per payday ($)</label>
                <input
                  type="number" min="0" step="0.01"
                  value={incomeForm.amount}
                  onChange={e => setIncomeForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="e.g. 2500.00"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-400 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Next payday date</label>
                <input
                  type="date"
                  value={incomeForm.nextPayday}
                  onChange={e => setIncomeForm(f => ({ ...f, nextPayday: e.target.value }))}
                  className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <button
                onClick={handleSaveSchedule}
                disabled={savingIncome || !incomeForm.amount || !incomeForm.nextPayday}
                className="w-full btn-accent py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingIncome ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Income Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-t border-slate-700 py-3 px-4">
        <div className="max-w-md mx-auto flex justify-around">
          <Link href="/app" className="nav-item">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Link>
          <Link href="/calendar" className="nav-item nav-item-active">
            <CalendarDays className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Link>
          <Link href="/add-bill" className="nav-item">
            <Plus className="w-6 h-6" />
            <span className="text-xs">Add Bill</span>
          </Link>
          <Link href="/settings" className="nav-item">
            <Settings className="w-6 h-6" />
            <span className="text-xs">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
