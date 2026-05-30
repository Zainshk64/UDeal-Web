import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use - UDealZone',
  description: 'UDealZone Terms of Use and Service Agreement',
};

const sections = [
  {
    title: "1. Terms of Use",
    content:
      "By using the Udealzone platform, users can buy, sell, rent, and invest in properties, cars, bikes, and mobiles. You agree to adhere to the terms outlined below while engaging with these services.",
  },
  {
    title: "2. Account Termination",
    content:
      "Udealzone reserves the right to suspend or terminate user accounts for violating any of the platform's terms or engaging in fraudulent activities. Users will be notified in case of account suspension or termination.",
  },
  {
    title: "3. Payment Terms",
    content:
      "All transactions made on Udealzone are processed securely. Payments for listings, products, or services are handled through our payment gateway. Refunds will be processed under the conditions mentioned in our refund policy.",
  },
  {
    title: "4. Liability Disclaimer",
    content:
      "Udealzone is not responsible for any damages, losses, or issues arising from transactions between buyers and sellers. All users engage in transactions at their own risk.",
  },
];

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen pt-34 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Terms of Use
          </h1>
          <p className="text-lg text-gray-600">
            Please read these terms carefully before using our platform
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Acceptance */}
          <div className="mt-12 p-6 bg-blue-50 rounded-xl border-l-4 border-[#003049]">
            <p className="text-gray-800">
              By using UDealZone, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}