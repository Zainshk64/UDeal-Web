'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiTag, FiAlertCircle, FiInfo, FiCheck } from 'react-icons/fi';
import { cn } from '@/src/utils/cn';

interface PromoCodeModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (code: string) => Promise<void>;
  isLoading: boolean;
}

export const PromoCodeModal: React.FC<PromoCodeModalProps> = ({
  open,
  onClose,
  onApply,
  isLoading,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }
    setError('');
    await onApply(code.trim());
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
        >
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-[#003049] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <FiTag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Apply Promo Code</h3>
                    <p className="text-white/70 text-xs">Unlock exclusive discounts</p>
                  </div>
                </div>
                <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-full">
                  <FiX className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-gray-700 font-semibold text-sm mb-2 block">
                  Enter Promo Code
                </label>
                <div className={cn(
                  'flex items-center border-2 rounded-xl px-4 py-3',
                  error ? 'border-red-400 bg-red-50' : 'border-gray-200'
                )}>
                  <FiTag className={cn('w-5 h-5 flex-shrink-0', error ? 'text-red-400' : 'text-gray-400')} />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.toUpperCase());
                      setError('');
                    }}
                    placeholder="Enter your promo code"
                    disabled={isLoading}
                    className="flex-1 ml-3 text-base text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                  />
                  {code && !isLoading && (
                    <button onClick={() => setCode('')} className="text-gray-400 hover:text-gray-600">
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {error && (
                  <div className="flex items-center gap-1 mt-2">
                    <FiAlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-500 text-sm">{error}</span>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2">
                <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-xs">
                  Promo codes are case-insensitive. Once applied, discounts will be automatically applied to all eligible packages.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !code.trim()}
                  className={cn(
                    'flex-1 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2',
                    isLoading || !code.trim() ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#003049] hover:bg-[#004d6d]'
                  )}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validating...
                    </>
                  ) : (
                    <>
                      <FiCheck className="w-5 h-5" />
                      Apply Code
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};