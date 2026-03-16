'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSearch, FiX, FiCheck } from 'react-icons/fi';
import { DropdownOption } from '@/src/api/services/EditAd/FormFieldApi';
import { cn } from '@/src/utils/cn';

interface DropdownSelectProps {
  label: string;
  value: number | string | undefined;
  displayValue: string;
  placeholder?: string;
  required?: boolean;
  options: DropdownOption[];
  loading?: boolean;
  onOpen: () => void;
  onSelect: (option: DropdownOption) => void;
}

export const DropdownSelect: React.FC<DropdownSelectProps> = ({
  label,
  value,
  displayValue,
  placeholder,
  required,
  options,
  loading,
  onOpen,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    onOpen();
    setIsOpen(true);
    setSearch('');
  };

  const filtered = options.filter((o) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <label className="text-gray-700 font-semibold text-sm mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          'w-full flex items-center justify-between px-4 py-3 border rounded-xl bg-white text-left transition-colors',
          value ? 'border-green-400' : 'border-gray-300',
          isOpen && 'border-[#F97316] ring-2 ring-[#F97316]/20'
        )}
      >
        <span className={displayValue ? 'text-gray-800' : 'text-gray-400'}>
          {displayValue || placeholder || `Select ${label}`}
        </span>
        <FiChevronDown className={cn('w-4 h-4 text-gray-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 w-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Search */}
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  autoFocus
                  className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97316]"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2">
                    <FiX className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">No options found</div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors',
                      value === option.id && 'bg-[#F97316]/5 text-[#F97316] font-semibold'
                    )}
                  >
                    <span>{option.name}</span>
                    {value === option.id && <FiCheck className="w-4 h-4 text-[#F97316]" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};