import React, { useState } from 'react';
import { ArrowLeft, Plus, UserPlus, Share2, Calculator, DollarSign, Users, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface Person {
  id: string;
  name: string;
  emoji: string;
  amount: number;
  paid: boolean;
}

interface SplitBill {
  id: string;
  title: string;
  totalAmount: number;
  people: Person[];
  createdDate: string;
  settled: boolean;
}

const availableEmojis = ['👨', '👩', '🧑', '👦', '👧', '🧒', '👴', '👵', '🧔', '👱', '🦸', '🦹', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🤖', '👽', '🎅', '🤶', '🦄', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐸', '🐵'];

export default function BillSplitting() {
  const { toast } = useToast();
  const [bills, setBills] = useState<SplitBill[]>([
    {
      id: '1',
      title: 'Dinner at The Keg',
      totalAmount: 180.00,
      people: [
        { id: '1', name: 'You', emoji: '👨', amount: 60.00, paid: true },
        { id: '2', name: 'Sarah', emoji: '👩', amount: 60.00, paid: false },
        { id: '3', name: 'Mike', emoji: '🧑', amount: 60.00, paid: false }
      ],
      createdDate: '2025-01-12',
      settled: false
    }
  ]);

  const [showNewBill, setShowNewBill] = useState(false);
  const [newBillTitle, setNewBillTitle] = useState('');
  const [newBillAmount, setNewBillAmount] = useState('');
  const [newBillPeople, setNewBillPeople] = useState<Person[]>([
    { id: '1', name: 'You', emoji: '👨', amount: 0, paid: false }
  ]);

  const getRandomEmoji = () => {
    return availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
  };

  const addPersonToBill = () => {
    const newPerson: Person = {
      id: Date.now().toString(),
      name: '',
      emoji: getRandomEmoji(),
      amount: 0,
      paid: false
    };
    setNewBillPeople([...newBillPeople, newPerson]);
  };

  const updatePersonName = (id: string, name: string) => {
    setNewBillPeople(people => 
      people.map(p => p.id === id ? { ...p, name } : p)
    );
  };

  const updatePersonEmoji = (id: string, emoji: string) => {
    setNewBillPeople(people => 
      people.map(p => p.id === id ? { ...p, emoji } : p)
    );
  };

  const removePersonFromBill = (id: string) => {
    if (newBillPeople.length > 1) {
      setNewBillPeople(people => people.filter(p => p.id !== id));
    }
  };

  const splitBillEvenly = () => {
    const amount = parseFloat(newBillAmount);
    if (amount && newBillPeople.length > 0) {
      const splitAmount = amount / newBillPeople.length;
      setNewBillPeople(people => 
        people.map(p => ({ ...p, amount: Math.round(splitAmount * 100) / 100 }))
      );
    }
  };

  const createBill = () => {
    if (!newBillTitle || !newBillAmount || newBillPeople.some(p => !p.name)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before creating the bill.",
        variant: "destructive"
      });
      return;
    }

    const newBill: SplitBill = {
      id: Date.now().toString(),
      title: newBillTitle,
      totalAmount: parseFloat(newBillAmount),
      people: newBillPeople,
      createdDate: new Date().toISOString().split('T')[0],
      settled: false
    };

    setBills([newBill, ...bills]);
    setShowNewBill(false);
    setNewBillTitle('');
    setNewBillAmount('');
    setNewBillPeople([{ id: '1', name: 'You', emoji: '👨', amount: 0, paid: false }]);

    toast({
      title: "Bill Created! 🎉",
      description: "Your bill has been split and is ready to share with friends."
    });
  };

  const shareBill = (bill: SplitBill) => {
    const shareText = `💰 ${bill.title}\n\nTotal: $${bill.totalAmount.toFixed(2)}\n\n` +
      bill.people.map(p => `${p.emoji} ${p.name}: $${p.amount.toFixed(2)} ${p.paid ? '✅' : '❌'}`).join('\n') +
      '\n\nSplit with MyBillPort 📱';

    if (navigator.share) {
      navigator.share({
        title: `Bill Split: ${bill.title}`,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: "Copied to Clipboard! 📋",
        description: "Share this bill split with your friends."
      });
    }
  };

  const markAsPaid = (billId: string, personId: string) => {
    setBills(bills => 
      bills.map(bill => 
        bill.id === billId 
          ? {
              ...bill,
              people: bill.people.map(p => 
                p.id === personId ? { ...p, paid: !p.paid } : p
              )
            }
          : bill
      )
    );

    toast({
      title: "Payment Updated! 💰",
      description: "Payment status has been updated."
    });
  };

  const getTotalOwed = (bill: SplitBill) => {
    return bill.people.filter(p => !p.paid).reduce((sum, p) => sum + p.amount, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="flex items-center space-x-4 p-4">
            <button 
              onClick={() => window.location.href = "/"} 
              className="p-1 text-white hover:text-gray-200"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6" />
              <div>
                <h1 className="text-xl font-bold">Bill Splitting</h1>
                <p className="text-sm text-purple-100">Split bills with friends</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Quick Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={() => setShowNewBill(true)}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              data-testid="button-new-bill"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Split
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              data-testid="button-quick-split"
              onClick={() => {
                setShowNewBill(true);
                setNewBillTitle('Quick Split');
              }}
            >
              <Calculator className="w-4 h-4 mr-2" />
              Quick Split
            </Button>
          </div>

          {/* Active Bills */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Split Bills</h2>
            <div className="space-y-4">
              {bills.map(bill => (
                <div key={bill.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">{bill.title}</h3>
                      <p className="text-sm text-gray-600">{bill.createdDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600">${bill.totalAmount.toFixed(2)}</p>
                      {getTotalOwed(bill) > 0 && (
                        <p className="text-sm text-orange-600">${getTotalOwed(bill).toFixed(2)} owed</p>
                      )}
                    </div>
                  </div>

                  {/* People */}
                  <div className="space-y-2 mb-3">
                    {bill.people.map(person => (
                      <div key={person.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{person.emoji}</span>
                          <span className="text-sm font-medium">{person.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">${person.amount.toFixed(2)}</span>
                          <button
                            onClick={() => markAsPaid(bill.id, person.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              person.paid 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-500'
                            }`}
                            data-testid={`button-toggle-paid-${person.id}`}
                          >
                            {person.paid && <span className="text-xs">✓</span>}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => shareBill(bill)}
                      className="flex-1"
                      data-testid={`button-share-${bill.id}`}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      data-testid={`button-remind-${bill.id}`}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Remind
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Bill Modal */}
        {showNewBill && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Bill Split</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bill Title</label>
                  <Input
                    value={newBillTitle}
                    onChange={(e) => setNewBillTitle(e.target.value)}
                    placeholder="e.g., Dinner at Restaurant"
                    data-testid="input-bill-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      value={newBillAmount}
                      onChange={(e) => setNewBillAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      data-testid="input-bill-amount"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">People</label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={splitBillEvenly}
                      data-testid="button-split-evenly"
                    >
                      Split Evenly
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {newBillPeople.map((person, index) => (
                      <div key={person.id} className="flex items-center space-x-2">
                        <button
                          onClick={() => updatePersonEmoji(person.id, getRandomEmoji())}
                          className="text-2xl hover:scale-110 transition-transform"
                          data-testid={`button-emoji-${person.id}`}
                        >
                          {person.emoji}
                        </button>
                        <Input
                          value={person.name}
                          onChange={(e) => updatePersonName(person.id, e.target.value)}
                          placeholder="Name"
                          className="flex-1"
                          data-testid={`input-person-name-${person.id}`}
                        />
                        <div className="relative w-20">
                          <span className="absolute left-2 top-3 text-xs text-gray-400">$</span>
                          <Input
                            type="number"
                            value={person.amount || ''}
                            onChange={(e) => {
                              const amount = parseFloat(e.target.value) || 0;
                              setNewBillPeople(people => 
                                people.map(p => p.id === person.id ? { ...p, amount } : p)
                              );
                            }}
                            className="pl-5 text-sm"
                            data-testid={`input-person-amount-${person.id}`}
                          />
                        </div>
                        {newBillPeople.length > 1 && (
                          <button
                            onClick={() => removePersonFromBill(person.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            data-testid={`button-remove-person-${person.id}`}
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addPersonToBill}
                    className="w-full mt-2"
                    data-testid="button-add-person"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Person
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewBill(false);
                    setNewBillTitle('');
                    setNewBillAmount('');
                    setNewBillPeople([{ id: '1', name: 'You', emoji: '👨', amount: 0, paid: false }]);
                  }}
                  className="flex-1"
                  data-testid="button-cancel-bill"
                >
                  Cancel
                </Button>
                <Button
                  onClick={createBill}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  data-testid="button-create-bill"
                >
                  Create Split
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}