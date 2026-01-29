import { Link } from "wouter";
import { Zap, Phone, Wifi, CreditCard, Home, Droplets, Tv, Shield, Car, Trash2 } from "lucide-react";
import { useState, type MouseEvent } from "react";

interface BillCardProps {
  id: string;
  company: string;
  category?: string;
  amount: number;
  dueDate: string;
  status?: 'paid' | 'due_soon' | 'overdue' | 'upcoming';
  accountNumber?: string;
  logoUrl?: string;
  onDelete?: (id: string) => void;
}

const categoryIcons: Record<string, any> = {
  'electric': Zap,
  'hydro': Zap,
  'power': Zap,
  'gas': Home,
  'water': Droplets,
  'phone': Phone,
  'mobile': Phone,
  'internet': Wifi,
  'wifi': Wifi,
  'credit': CreditCard,
  'bank': CreditCard,
  'tv': Tv,
  'cable': Tv,
  'insurance': Shield,
  'car': Car,
  'default': Home
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  'electric': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  'hydro': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  'gas': { bg: 'bg-orange-100', text: 'text-orange-600' },
  'water': { bg: 'bg-blue-100', text: 'text-blue-600' },
  'phone': { bg: 'bg-purple-100', text: 'text-purple-600' },
  'mobile': { bg: 'bg-purple-100', text: 'text-purple-600' },
  'internet': { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  'wifi': { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  'credit': { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  'bank': { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  'default': { bg: 'bg-gray-100', text: 'text-gray-600' }
};

function getIconForBill(company: string, category?: string): any {
  const searchTerm = (category || company).toLowerCase();
  for (const [key, icon] of Object.entries(categoryIcons)) {
    if (searchTerm.includes(key)) {
      return icon;
    }
  }
  return categoryIcons.default;
}

function getColorsForBill(company: string, category?: string): { bg: string; text: string } {
  const searchTerm = (category || company).toLowerCase();
  for (const [key, colors] of Object.entries(categoryColors)) {
    if (searchTerm.includes(key)) {
      return colors;
    }
  }
  return categoryColors.default;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function BillCard({ 
  id, 
  company, 
  category, 
  amount, 
  dueDate, 
  status,
  accountNumber,
  logoUrl,
  onDelete
}: BillCardProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const Icon = getIconForBill(company, category);
  const colors = getColorsForBill(company, category);
  
  const statusColors = {
    paid: 'text-teal-700',
    due_soon: 'text-amber-600',
    overdue: 'text-red-600',
    upcoming: 'text-gray-600'
  };

  const handleDeleteClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(true);
  };

  const handleConfirmDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id);
    }
    setShowConfirm(false);
  };

  const handleCancelDelete = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowConfirm(false);
  };

  if (showConfirm) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-200">
        <div className="text-center">
          <p className="text-gray-900 font-medium mb-2">Delete {company}?</p>
          <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
          <div className="flex space-x-3">
            <button
              onClick={handleCancelDelete}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex items-center justify-between">
        <Link href={`/bill-details/${id}`} className="flex items-center space-x-3 flex-1">
          <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
            {logoUrl ? (
              <img src={logoUrl} alt={company} className="w-8 h-8 object-contain" />
            ) : (
              <Icon className={`w-6 h-6 ${colors.text}`} />
            )}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{company}</h4>
            <p className="text-sm text-gray-500">{category || 'Bill'}</p>
          </div>
        </Link>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm text-gray-500">{formatDate(dueDate)}</p>
            <p className={`text-lg font-bold ${status ? statusColors[status] : 'text-gray-900'}`}>
              ${amount.toFixed(2)}
            </p>
          </div>
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Delete bill"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
