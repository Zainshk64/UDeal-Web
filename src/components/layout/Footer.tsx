'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiMail } from 'react-icons/fi';
import { ROUTES } from '@/src/utils/constants';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Browse',
      links: [
        { label: 'Categories', href: '#' },
        { label: 'Latest Ads', href: ROUTES.HOME },
        { label: 'Trending', href: '#' },
      ],
    },
    {
      title: 'Selling',
      links: [
        { label: 'Post Ad', href: ROUTES.ADD_POST },
        { label: 'Manage Ads', href: ROUTES.MY_ADS },
        { label: 'Safety Tips', href: '#' },
      ],
    },
    {
      title: 'About Us',
      links: [
        { label: 'About UDealZone', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Contact Us', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms & Conditions', href: '#' },
        { label: 'Cookie Policy', href: '#' },
      ],
    },
  ];

  const socialLinks = [
    { icon: FiFacebook, href: '#', label: 'Facebook' },
    { icon: FiTwitter, href: '#', label: 'Twitter' },
    { icon: FiInstagram, href: '#', label: 'Instagram' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="gradient-premium text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-22">
        {/* Content Grid */}
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

          {/* Newsletter */}
          {/* <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2">
            <FiMail className="w-4 h-4" />
            <input
              type="email"
              placeholder="Get updates via email"
              className="bg-transparent text-sm text-white placeholder-white/50 outline-none w-40"
            />
            <button className="text-[#F97316] hover:text-white transition-colors font-medium text-sm">
              Subscribe
            </button>
          </div> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
