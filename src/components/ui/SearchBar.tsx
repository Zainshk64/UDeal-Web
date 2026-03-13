'use client';

import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { cn } from '@/src/utils/cn';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
  variant?: 'default' | 'compact';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search products, categories...',
  className,
  onSearch,
  variant = 'default',
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-12 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent transition-all',
            variant === 'default' ? 'py-3 text-base' : 'py-2 text-sm'
          )}
        />
      </div>
    </form>
  );
};