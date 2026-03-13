'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { FiDownload, FiShield, FiZap, FiStar } from 'react-icons/fi';

const STORE_LINKS = {
  playStore:
    'https://play.google.com/store/apps/details?id=com.UDealZone.udealzone&pcampaignid=web_share',
  appStore: 'https://apps.apple.com/pk/app/udealzone/id6754576104',
};

const FEATURES = [
  { icon: FiZap, text: 'Lightning fast deals' },
  { icon: FiShield, text: 'Secure transactions' },
  { icon: FiStar, text: 'Premium experience' },
];

export const CTASection: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#003049] via-[#003049] to-[#004d6d]" />

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Decorative Blurs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F97316]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* ===== LEFT: Text Content ===== */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
            >
              <FiDownload className="w-4 h-4 text-[#F97316]" />
              <span>Available on Mobile</span>
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              Buy & Sell Faster
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#facc15]">
                with UDealZone
              </span>
            </h2>

            {/* Description */}
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-4 max-w-lg mx-auto lg:mx-0">
              Experience the easiest way to buy and sell products in
              Pakistan. From vehicles to electronics, find everything
              you need — right at your fingertips.
            </p>

            <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
              Join thousands of happy users who are already trading
              smarter. Post ads in seconds, connect with buyers
              instantly, and close deals faster than ever before.
            </p>

            {/* Features List */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={feature.text}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-2 text-white/90"
                >
                  <div className="w-8 h-8 rounded-full bg-[#F97316]/20 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-[#F97316]" />
                  </div>
                  <span className="text-sm font-medium">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Store Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              {/* Google Play Button */}
              <a
                href={STORE_LINKS.playStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white text-[#003049] px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 flex-shrink-0"
                  fill="currentColor"
                >
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.302 2.302a1 1 0 0 1 0 1.38l-2.302 2.302L15.396 13l2.302-2.302zM5.864 2.658L16.8 8.99l-2.302 2.302L5.864 2.658z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-500 leading-none">
                    GET IT ON
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    Google Play
                  </div>
                </div>
              </a>

              {/* App Store Button */}
              <a
                href={STORE_LINKS.appStore}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-white text-[#003049] px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-8 h-8 flex-shrink-0"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-500 leading-none">
                    Download on the
                  </div>
                  <div className="text-lg font-bold leading-tight">
                    App Store
                  </div>
                </div>
              </a>
            </motion.div>

            {/* Download Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 mt-8 justify-center lg:justify-start"
            >
              <div className="text-center">
                <p className="text-2xl font-bold text-white">10K+</p>
                <p className="text-xs text-white/60">Downloads</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">4.5★</p>
                <p className="text-xs text-white/60">Rating</p>
              </div>
              <div className="w-px h-10 bg-white/20" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">5K+</p>
                <p className="text-xs text-white/60">Active Users</p>
              </div>
            </motion.div>
          </motion.div>

          {/* ===== RIGHT: Phone Mockup ===== */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow Effect Behind Phone */}
              <div className="absolute -inset-8 bg-gradient-to-tr from-[#F97316]/30 to-[#facc15]/20 rounded-full blur-3xl" />

              {/* Phone Frame */}
              <div className="relative w-[280px] sm:w-[300px] lg:w-[320px]">
                {/* Phone Outer Shell */}
                <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  {/* Phone Top Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />

                  {/* Screen Bezel */}
                  <div className="relative rounded-[2.4rem] overflow-hidden bg-black">
                    {/* Status Bar */}
                    <div className="absolute top-0 left-0 right-0 h-8 bg-black g-gradient-to-b from-black to-transparent z-10 flex items-center justify-between px-8">
                      <span className="text-white text-[10px] font-medium">
                        9:41
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 border border-white/80 rounded-sm">
                          <div className="w-3/4 h-full bg-white/80 rounded-sm" />
                        </div>
                      </div>
                    </div>

                    {/* App Screenshot */}
                    <div className="relative w-full aspect-[9/19.5]">
                      <Image
                        src="/cta-mob.jpeg"
                        alt="UDealZone Mobile App"
                        fill
                        className="object-cover object-top"
                        priority
                      />
                    </div>
                  </div>

                  {/* Home Indicator */}
                  <div className="flex justify-center mt-2">
                    <div className="w-28 h-1 bg-gray-600 rounded-full" />
                  </div>
                </div>

                {/* Floating Cards Around Phone */}
                {/* Card 1: Top Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  // @ts-ignore
                  transition2={{
                    y: {
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    },
                  }}
                  className="absolute -top-10 -left-8 sm:-left-12 bg-white rounded-xl shadow-xl p-3 z-20"
                >
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 text-sm">
                        ✓
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Ad Posted!
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Just now
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Card 2: Bottom Right */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  className="absolute -bottom-2 -right-6 sm:-right-10 bg-white rounded-xl shadow-xl p-3 z-20"
                >
                  <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{
                      duration: 3.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 0.5,
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-[#F97316]/10 rounded-full flex items-center justify-center">
                      <span className="text-[#F97316] text-sm">
                        🔥
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        Deal Closed
                      </p>
                      <p className="text-[10px] text-gray-500">
                        PKR 45,000
                      </p>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Card 3: Middle Left */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 }}
                  className="absolute top-1/2 -left-10 sm:-left-16 bg-white rounded-xl shadow-xl p-3 z-20"
                >
                  <motion.div
                    animate={{ x: [0, -5, 0] }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1,
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">
                        💬
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">
                        New Message
                      </p>
                      <p className="text-[10px] text-gray-500">
                        2 min ago
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;