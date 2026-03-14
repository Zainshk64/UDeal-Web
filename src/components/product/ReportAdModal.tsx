'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiFlag, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/src/utils/cn';

const REPORT_REASONS = [
  { id: 1, keyword: 'Spam', label: 'Spam or misleading' },
  { id: 2, keyword: 'Fraud', label: 'Fraud or scam' },
  { id: 3, keyword: 'Inappropriate', label: 'Inappropriate content' },
  { id: 4, keyword: 'Duplicate', label: 'Duplicate listing' },
  { id: 5, keyword: 'Wrong Category', label: 'Wrong category' },
];

interface ReportAdModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (keyword: string, comment: string) => Promise<void>;
  isLoading: boolean;
}

export const ReportAdModal: React.FC<ReportAdModalProps> = ({
  visible,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [selectedReason, setSelectedReason] = useState<string | null>(
    null
  );
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherKeyword, setOtherKeyword] = useState('');
  const [comment, setComment] = useState('');

  const resetForm = () => {
    setSelectedReason(null);
    setShowOtherInput(false);
    setOtherKeyword('');
    setComment('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    const keyword = showOtherInput
      ? otherKeyword.trim()
      : selectedReason;
    if (!keyword) return;
    await onSubmit(keyword, comment.trim());
    resetForm();
  };

  const canSubmit =
    (selectedReason || (showOtherInput && otherKeyword.trim())) &&
    !isLoading;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="relative bg-white w-full sm:w-[480px] sm:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-full flex items-center justify-center">
                  <FiFlag className="w-4 h-4 text-red-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  Report This Ad
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Info Banner */}
              <div className="flex items-center gap-2 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <FiAlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-amber-700 text-sm">
                  Help us keep UDealZone safe by reporting suspicious
                  ads
                </p>
              </div>

              {/* Reasons */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-3">
                  Why are you reporting this ad?
                </p>

                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected =
                      selectedReason === reason.keyword;
                    return (
                      <button
                        key={reason.id}
                        onClick={() => {
                          setSelectedReason(reason.keyword);
                          setShowOtherInput(false);
                          setOtherKeyword('');
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                          isSelected
                            ? 'border-[#F97316] bg-orange-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        )}
                      >
                        <div
                          className={cn(
                            'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                            isSelected
                              ? 'border-[#F97316] bg-[#F97316]'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            isSelected
                              ? 'text-orange-700 font-semibold'
                              : 'text-gray-700'
                          )}
                        >
                          {reason.label}
                        </span>
                      </button>
                    );
                  })}

                  {/* Other Option */}
                  <button
                    onClick={() => {
                      setSelectedReason(null);
                      setShowOtherInput(true);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all',
                      showOtherInput
                        ? 'border-[#F97316] bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        showOtherInput
                          ? 'border-[#F97316] bg-[#F97316]'
                          : 'border-gray-300'
                      )}
                    >
                      {showOtherInput && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span
                      className={cn(
                        'text-sm',
                        showOtherInput
                          ? 'text-orange-700 font-semibold'
                          : 'text-gray-700'
                      )}
                    >
                      Other reason
                    </span>
                  </button>
                </div>
              </div>

              {/* Other Input */}
              {showOtherInput && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Specify reason{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={otherKeyword}
                    onChange={(e) => setOtherKeyword(e.target.value)}
                    placeholder="Enter your reason..."
                    maxLength={50}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                  />
                </div>
              )}

              {/* Comment */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                  Additional details{' '}
                  <span className="text-gray-400 font-normal">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide more details..."
                  maxLength={500}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm bg-gray-50 resize-none focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  {comment.length}/500
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100">
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={cn(
                  'w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all',
                  canSubmit
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiFlag className="w-4 h-4" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};