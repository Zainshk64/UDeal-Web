'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';
import { SiTiktok, SiWhatsapp } from 'react-icons/si';
import { ROUTES } from '@/src/utils/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Top Ads',
      links: [
        { label: 'Featured Ads', href: '/#featured' },
        { label: 'All Categories', href: '/category/1' },
        { label: 'Buyers', href: ROUTES.BUYERS },
      ],
    },
    {
      title: 'Selling',
      links: [
        { label: 'Post Ad', href: ROUTES.ADD_POST },
        { label: 'Manage Ads', href: ROUTES.MY_ADS },
        { label: 'Safety Tips', href: '/activity/safety-tips' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/activity/about' },
        { label: 'FAQ', href: '/activity/faq' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '/activity/privacy-policy' },
        { label: 'Terms of Use', href: '/activity/terms-of-use' },
      ],
    },
  ];

  const socialLinks = [
    { 
      icon: FiFacebook, 
      href: 'https://www.facebook.com/share/19sk7go3fE/', 
      label: 'Facebook' 
    },
    { 
      icon: SiTiktok, 
      href: 'https://www.tiktok.com/@udealzone?_t=ZN-8u8IOFZf446&_r=1', 
      label: 'TikTok' 
    },
    { 
      icon: FiInstagram, 
      href: 'https://www.instagram.com/udealzoneofficial?igsh=MWVtMTV2djgwNXd1ag==', 
      label: 'Instagram' 
    },
    { 
      icon: FiYoutube, 
      href: 'https://youtube.com/@udealzone?si=DSFVEl5Ees_oq8xK', 
      label: 'YouTube' 
    },
    { 
      icon: SiWhatsapp, 
      href: 'https://whatsapp.com/channel/0029Vb6EeH76LwHiQEPrMd2Y', 
      label: 'WhatsApp' 
    },
  ];

  return (
    <footer className="gradient-premium text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-22">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-4">
              <span>UDeal</span>
              <span className="text-[#F97316]">Zone</span>
            </h3>
            <p className="text-white/70 text-sm">
              A modern marketplace platform connecting buyers and sellers. Buy and sell
              with confidence.
            </p>
            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/10 rounded-full hover:bg-[#F97316] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: (index + 1) * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-white/70 hover:text-[#F97316] transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/70 text-sm">
            © {currentYear} UDealZone. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;