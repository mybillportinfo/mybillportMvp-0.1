'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

interface ProviderAutocompleteProps {
  providers: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ProviderAutocomplete({
  providers,
  value,
  onChange,
  placeholder = 'Search or type provider name',
}: ProviderAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const providersKey = providers.join(',');
  useEffect(() => {
    setSearch('');
    setIsOpen(false);
  }, [providersKey]);

  useEffect(() => {
    if (!value) {
      setSearch('');
    }
  }, [value]);

  const filtered = providers.filter(p =>
    p.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        if (!value && search) {
          onChange(search);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, search, onChange]);

  const handleSelect = (provider: string) => {
    onChange(provider);
    setSearch('');
    setIsOpen(false);
  };

  const handleInputChange = (val: string) => {
    setSearch(val);
    onChange(val);
    if (!isOpen) setIsOpen(true);
  };

  const handleClear = () => {
    onChange('');
    setSearch('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    setIsOpen(true);
    if (value && !search) {
      setSearch(value);
    }
  };

  const displayValue = isOpen ? search : value;

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="w-full pl-10 pr-16 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => { setIsOpen(!isOpen); if (!isOpen) inputRef.current?.focus(); }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map(provider => (
              <button
                key={provider}
                type="button"
                onClick={() => handleSelect(provider)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-teal-50 hover:text-teal-700 transition-colors ${
                  value === provider ? 'bg-teal-50 text-teal-700 font-medium' : 'text-slate-700'
                }`}
              >
                {provider}
              </button>
            ))
          ) : search ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No match found — "<span className="font-medium text-slate-700">{search}</span>" will be used as provider
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}