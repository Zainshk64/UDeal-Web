'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMail } from 'react-icons/fi';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is UdealZone?",
    answer:
      "UdealZone is an online platform that provides users with seamless buying and selling experiences. It offers a variety of tools and features to enhance the selling process, such as featured ads and category-specific boosts.",
  },
  {
    question: "How can I create a listing?",
    answer:
      "To create a listing, simply navigate to the 'Sell' section in your home, select the category and subcategory and fill in the details about your item, and submit. You can also select a package to feature your listing for enhanced visibility.",
  },
  {
    question: "What are featured ads?",
    answer:
      "Featured ads are special listings that are displayed prominently on the platform. They help increase visibility, making it easier for buyers to find your item. You can choose different packages based on the visibility and duration you want.",
  },
  {
    question: "How do I edit or delete my listing?",
    answer:
      "To edit or delete your listing, go to the 'Ads' section in your home. From there, you can make changes or remove your listing entirely.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "You can contact our customer support team via the 'About' section in your dashboard or by emailing us at info@udealzone.com.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept a variety of payment methods, including credit/debit cards, and local bank transfers. You can select your preferred payment method at the time of purchase.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen pt-34 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about UDealZone
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-12">
          {faqData.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <FiChevronDown
                  className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-[#003049] to-[#004d6d] rounded-2xl p-8 text-center text-white">
          <FiMail className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="mb-4 text-white/80">
            Contact our support team for personalized assistance
          </p>
          <a
            href="mailto:info@udealzone.com"
            className="inline-block bg-[#F97316] hover:bg-[#d97706] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Email Support
          </a>
        </div>
      </div>
    </div>
  );
}