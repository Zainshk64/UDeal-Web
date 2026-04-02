'use client';

import React from 'react';
import { cn } from '@/src/utils/cn';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  '7xl': 'max-w-7xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className,
  maxWidth = '8xl',
}) => {
  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-16', maxWidthClasses[maxWidth], className)}>
      {children}
    </div>
  );
};