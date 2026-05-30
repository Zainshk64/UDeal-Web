import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - UDealZone',
  description: 'UDealZone Privacy Policy - Learn how we protect your data',
};

const sections = [
  {
    title: "1. Privacy Policy",
    content:
      "We take your privacy seriously. Your personal information is stored securely, and we use it only for purposes related to providing our services. We will not share your data without your consent unless required by law.",
  },
  {
    title: "2. Data Collection",
    content:
      "We collect personal information such as your name, contact details, and transaction history to provide a seamless experience. Additionally, we may collect non-personal information such as browser type and usage statistics.",
  },
  {
    title: "3. Data Retention",
    content:
      "We retain your data for as long as necessary to fulfill the purposes for which it was collected. You may request to have your data deleted at any time by contacting us.",
  },
  {
    title: "4. User Rights",
    content:
      "You have the right to access, update, and delete your personal data. For requests related to your personal data, please contact our support team.",
  },
  {
    title: "5. Third-Party Sharing",
    content:
      "We do not sell, rent, or trade your personal information. However, we may share your information with third-party service providers to help us operate our platform, or as required by law.",
  },
  {
    title: "6. Security",
    content:
      "We employ industry-standard security measures to protect your data, including encryption and secure servers.",
  },
  {
    title: "7. Cookies and Tracking",
    content:
      "We may use cookies and other tracking technologies to enhance your experience on our platform. You can control your cookie settings through your browser.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen pt-34 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Privacy Policy
          </h1>
          {/* <p className="text-lg text-gray-600">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p> */}
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

          {/* Contact */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Questions about our Privacy Policy?
            </h3>
            <p className="text-gray-600">
              If you have any questions or concerns, please contact us at{' '}
              <a href="mailto:info@udealzone.com" className="text-[#F97316] hover:underline">
                info@udealzone.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}