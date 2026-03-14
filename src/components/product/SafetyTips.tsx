'use client';

import React from 'react';
import { FiShield } from 'react-icons/fi';

const TIPS = [
  {
    en: 'Meet in public places',
    ur: 'عوامی جگہوں پر ملیں',
  },
  {
    en: 'Check the item before payment',
    ur: 'ادائیگی سے پہلے چیز کو چیک کریں',
  },
  {
    en: "Don't send money in advance",
    ur: 'پیشگی رقم نہ بھیجیں',
  },
];

export const SafetyTips: React.FC = () => {
  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 bg-orange-100 rounded-full flex items-center justify-center">
          <FiShield className="w-5 h-5 text-[#F97316]" />
        </div>
        <div>
          <h4 className="font-bold text-orange-800">Safety Tips</h4>
          <p className="text-orange-600 text-sm">حفاظتی ہدایات</p>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-3">
        {TIPS.map((tip, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-orange-800 font-bold text-xs">
                {index + 1}
              </span>
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm">
                {tip.en}
              </p>
              <p className="text-gray-600 text-sm mt-0.5 font-urdu">
                {tip.ur}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};