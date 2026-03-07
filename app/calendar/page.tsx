'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Home, Plus, Settings, CalendarDays,
  DollarSign, TrendingDown, TrendingUp, X, AlertTriangle, Wallet, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchBills, getUserPreferences, setUserPreferences,
  Bill, PaydaySchedule
} from '../lib/firebase';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getPaydaysInMonth(schedule: PaydaySchedule, year: number, month: number): Date[] {
  const anchor = new Date(schedule.nextPayday + 'T12:00:00');
  const result: Date[] = [];
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);

  if (schedule.type === 'monthly') {
    const d = new Date(year, month, anchor.getDate());
    if (d <= monthEnd) result.push(d);
  } else if (schedule.type === 'semimonthly') {
    const d1 = new Date(year, month, 1);
    const d2 = new Date(year, month, 15);
    if (d1 >= monthStart && d1 <= monthEnd) result.push(d1);
    if (d2 >= monthStart && d2 <= monthEnd) result.push(d2);
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

export default function CalendarPage() {
  const { user } = useAuth();
  const today = useMemo(() => new Date(), []);

  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [paydaySchedule, setPaydaySchedule] = useState<PaydaySchedule | null>(null);
  const [showIncomeSetup, setShowIncomeSetup] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ type: 'biweekly', amount: '', nextPayday: '' });
  const [savingIncome, setSavingIncome] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchBills(user.uid)
      .then(data => { setBills(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

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

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
    setSelectedDay(null);
  };

  const { calendarDays, billsByDay, paydaysInMonth } = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarDays: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

    const activeBills = bills.filter(b => b.status !== 'paid');
    const billsByDay = groupBillsByDay(activeBills, currentYear, currentMonth);
    const paydaysInMonth = paydaySchedule
      ? getPaydaysInMonth(paydaySchedule, currentYear, currentMonth)
      : [];
    return { calendarDays, billsByDay, paydaysInMonth };
  }, [currentYear, currentMonth, bills, paydaySchedule]);

  const paydayDaySet = useMemo(
    () => new Set(paydaysInMonth.map(d => d.getDate())),
    [paydaysInMonth]
  );

  const monthlyIncome = paydaySchedule ? paydaysInMonth.length * paydaySchedule.amount : 0;
  const monthlyBills = useMemo(
    () => Array.from(billsByDay.values()).flat().reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0),
    [billsByDay]
  );
  const monthlyNet = monthlyIncome - monthlyBills;

  const hasLowFundsAlert = useMemo(() => {
    if (!paydaySchedule) return false;
    let balance = 0;
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      if (paydayDaySet.has(d)) balance += paydaySchedule.amount;
      for (const b of billsByDay.get(d) ?? []) balance -= (b.totalAmount - b.paidAmount);
      if (balance < 0) return true;
    }
    return false;
  }, [paydayDaySet, billsByDay, paydaySchedule, currentYear, currentMonth]);

  const getDayStyle = (day: number) => {
    const hasBills = billsByDay.has(day);
    const isPayday = paydayDaySet.has(day);
    if (!hasBills && !isPayday) return '';
    if (isPayday && !hasBills) return 'bg-emerald-500/15';
    if (!isPayday && hasBills) return 'bg-red-500/10';
    const income = paydaySchedule!.amount;
    const due = (billsByDay.get(day) ?? []).reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);
    return income >= due ? 'bg-emerald-500/15' : 'bg-red-500/10';
  };

  const isToday = (day: number) =>
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  const selectedBills = selectedDay ? (billsByDay.get(selectedDay) ?? []) : [];
  const selectedIsPayday = selectedDay ? paydayDaySet.has(selectedDay) : false;
  const selectedIncome = (selectedIsPayday && paydaySchedule) ? paydaySchedule.amount : 0;
  const selectedBillsTotal = selectedBills.reduce((s, b) => s + (b.totalAmount - b.paidAmount), 0);

  const handleSaveIncome = async () => {
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
    } catch (e) {
      console.error('[calendar] save income error:', e);
    } finally {
      setSavingIncome(false);
    }
  };

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
            {paydaySchedule ? 'Edit Income' : 'Set Income'}
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 pt-4 space-y-4">

        {/* Month nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white font-semibold text-lg">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
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
              const hasBills = billsByDay.has(day);
              const isPayday = paydayDaySet.has(day);
              const billCount = billsByDay.get(day)?.length ?? 0;
              const isSelected = selectedDay === day;
              const tappable = hasBills || isPayday;

              return (
                <button
                  key={day}
                  onClick={() => tappable && setSelectedDay(isSelected ? null : day)}
                  className={`
                    relative flex flex-col items-center pt-1.5 pb-2 rounded-xl min-h-[54px]
                    transition-all duration-100
                    ${getDayStyle(day)}
                    ${isToday(day) ? 'ring-2 ring-teal-500' : ''}
                    ${isSelected ? 'ring-2 ring-white/40 scale-95' : ''}
                    ${tappable ? 'cursor-pointer active:scale-90' : 'cursor-default'}
                  `}
                >
                  <span className={`text-sm font-semibold ${
                    isToday(day) ? 'text-teal-400' :
                    hasBills ? 'text-slate-200' :
                    isPayday ? 'text-emerald-300' : 'text-slate-400'
                  }`}>
                    {day}
                  </span>
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center px-0.5">
                    {isPayday && (
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
            <div className="w-2 h-2 rounded-full bg-emerald-400" />Payday
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
            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-300">
              Projected cash shortfall this month. Review your bill timing.
            </p>
          </div>
        )}

        {/* Monthly summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Monthly Summary</h3>
          <div className="space-y-2.5">
            {paydaySchedule && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Money In ({paydaysInMonth.length} payday{paydaysInMonth.length !== 1 ? 's' : ''})
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
            {paydaySchedule && (
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
            {!paydaySchedule && (
              <button
                onClick={() => setShowIncomeSetup(true)}
                className="w-full text-xs text-teal-400 border border-teal-500/30 rounded-lg py-2 hover:bg-teal-500/10 transition-colors mt-1"
              >
                + Set income to see projected cash flow
              </button>
            )}
          </div>
        </div>

        {!loading && billsByDay.size === 0 && (
          <p className="text-center text-slate-500 text-sm py-4">No unpaid bills this month.</p>
        )}
      </div>

      {/* Day detail bottom sheet */}
      {selectedDay !== null && (
        <div className="fixed inset-0 z-50 flex items-end" onClick={() => setSelectedDay(null)}>
          <div
            className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">
                {MONTHS[currentMonth]} {selectedDay}
              </h3>
              <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedIsPayday && paydaySchedule && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">
                  Payday — ${paydaySchedule.amount.toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {selectedBills.length > 0 ? (
              <div className="space-y-2 mb-4">
                {selectedBills.map(bill => (
                  <div key={bill.id} className="flex items-center justify-between bg-slate-700/60 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-white text-sm font-medium">{bill.companyName}</p>
                      <p className="text-xs text-slate-400 capitalize">{bill.status}</p>
                    </div>
                    <span className="text-white font-semibold text-sm">
                      ${(bill.totalAmount - bill.paidAmount).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm mb-4">No bills due this day.</p>
            )}

            {selectedBills.length > 0 && (
              <div className="border-t border-slate-700 pt-3 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">Total bills due</span>
                  <span className="font-bold text-white text-sm">${selectedBillsTotal.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</span>
                </div>
                {selectedIsPayday && paydaySchedule && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-400">Balance after bills</span>
                    <span className={`font-bold text-sm ${selectedIncome - selectedBillsTotal >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(selectedIncome - selectedBillsTotal).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income setup bottom sheet */}
      {showIncomeSetup && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={() => setShowIncomeSetup(false)}>
          <div
            className="w-full max-w-md mx-auto bg-slate-800 border border-slate-700 rounded-t-3xl p-6 pb-10 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-600 rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-lg">Income Schedule</h3>
              <button onClick={() => setShowIncomeSetup(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

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
                  type="number"
                  min="0"
                  step="0.01"
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
                onClick={handleSaveIncome}
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
