'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle } from 'react-icons/fi';
import { cn } from '@/src/utils/cn';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  const colors = {
    danger: { bg: 'bg-red-100', text: 'text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
    warning: { bg: 'bg-amber-100', text: 'text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' },
    info: { bg: 'bg-blue-100', text: 'text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
  };

  const c = colors[variant];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
          >
            <div className="text-center">
              <div className={cn('w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center', c.bg)}>
                <FiAlertTriangle className={cn('w-7 h-7', c.text)} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm">{message}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn('flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2', c.btn)}
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                )}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};