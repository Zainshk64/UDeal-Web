import React from 'react';
import { Metadata } from 'next';
import { FiUsers, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

export const metadata: Metadata = {
  title: 'Safety Tips - UDealZone',
  description: 'Important safety tips for buying and selling on UDealZone',
};

const safetyTips = [
  {
    icon: FiUsers,
    title: "Meet in public places",
    titleUrdu: "عوامی جگہوں پر ملیں",
    description: "Always meet buyers or sellers in well-lit, public areas. Avoid meeting in isolated or unfamiliar locations.",
  },
  {
    icon: FiCheckCircle,
    title: "Check the item before payment",
    titleUrdu: "ادائیگی سے پہلے چیز کو چیک کریں",
    description: "Thoroughly inspect the item and verify its condition before making any payment. Test electronics and check documents for authenticity.",
  },
  {
    icon: FiAlertTriangle,
    title: "Don't send money in advance",
    titleUrdu: "پیشگی رقم نہ بھیجیں",
    description: "Never send advance payments or deposits to sellers. Complete all transactions in person after inspecting the item.",
  },
];

export default function SafetyTipsPage() {
  return (
    <div className="min-h-screen pt-34 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Safety Tips
          </h1>
          <h2 className="text-3xl font-semibold text-gray-700 mb-4">
            حفاظتی ہدایات
          </h2>
          <p className="text-lg text-gray-600">
            Follow these important guidelines to stay safe while buying and selling
          </p>
        </div>

        {/* Safety Tips */}
        <div className="space-y-6 mb-12">
          {safetyTips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#003049] to-[#004d6d] rounded-full flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-3xl font-bold text-[#F97316]">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {tip.title}
                        </h3>
                        <p className="text-lg text-gray-600 font-urdu">
                          {tip.titleUrdu}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      {tip.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Warning */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <FiAlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-red-900 mb-2">
                Important Warning
              </h3>
              <p className="text-red-800 leading-relaxed">
                UDealZone is not responsible for transactions between buyers and sellers. 
                Always exercise caution and use your best judgment. If something seems too 
                good to be true, it probably is. Report suspicious activity to our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Need Help or Want to Report Something?
          </h3>
          <p className="text-gray-600 mb-6">
            Our support team is here to help keep our community safe
          </p>
          <a
            href="mailto:info@udealzone.com"
            className="inline-block bg-[#F97316] hover:bg-[#d97706] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}