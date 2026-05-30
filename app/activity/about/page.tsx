import React from 'react';
import { Metadata } from 'next';
import { FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';
import { SiTiktok, SiWhatsapp } from 'react-icons/si';

export const metadata: Metadata = {
  title: 'About Us - UDealZone',
  description: 'Learn about UDealZone - Where Trust Meets Opportunity!',
};

const socialLinks = [
  {
    icon: FiFacebook,
    url: "https://www.facebook.com/share/19sk7go3fE/",
    color: "#1877F2",
    label: "Facebook"
  },
  {
    icon: FiInstagram,
    url: "https://www.instagram.com/udealzoneofficial?igsh=MWVtMTV2djgwNXd1ag==",
    color: "#E4405F",
    label: "Instagram"
  },
  {
    icon: FiYoutube,
    url: "https://youtube.com/@udealzone?si=DSFVEl5Ees_oq8xK",
    color: "#FF0000",
    label: "YouTube"
  },
  {
    icon: SiTiktok,
    url: "https://www.tiktok.com/@udealzone?_t=ZN-8u8IOFZf446&_r=1",
    color: "#010101",
    label: "TikTok"
  },
  {
    icon: SiWhatsapp,
    url: "https://whatsapp.com/channel/0029Vb6EeH76LwHiQEPrMd2Y",
    color: "#25D366",
    label: "WhatsApp"
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-34 pb-12 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block gradient-premium text-white px-8 py-12 rounded-2xl mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
            <div className="w-20 h-px bg-white/30 mx-auto mb-3" />
            <p className="text-lg font-medium text-white/90">
              Where Trust Meets Opportunity!
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8">
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
            <p>
              Welcome to UDealZone, your trusted online marketplace for buying,
              selling, and renting. Based in Rawalpindi, Pakistan, UDealZone
              connects buyers and sellers through a secure, user-friendly platform
              that ensures verified interactions and great deals. Whether you're
              looking to sell or rent properties, vehicles, bikes, or mobiles,
              we've got you covered. And this is just the beginning—we're
              expanding our categories to offer even more opportunities for
              seamless transactions.
            </p>

            <p>
              Our platform provides a space where individuals can list
              items or services for sale and connect with genuine buyers or
              renters. At UDealZone, we ensure that every listing undergoes a
              verification process to promote trust and transparency within our
              community. From residential and commercial properties to used cars,
              motorcycles, and electronic gadgets, our growing catalog is tailored
              to meet diverse user needs.
            </p>

            <p>
              At UDealZone, we prioritize affordability and accessibility.
              Our featured and premium ad rates are among the lowest in the
              market, making it easy for users to promote their listings
              effectively. Additionally, our intuitive search filters and
              category-specific options allow buyers to find exactly what they're
              looking for with minimal effort.
            </p>

            <p>
              We're committed to making buying and selling as seamless as
              possible. With both a fully responsive website and a mobile app
              available for Android and iOS, UDealZone provides convenience at
              your fingertips. Whether you're at home or on the go, our platform
              ensures you can easily manage your listings, respond to inquiries,
              and close deals efficiently.
            </p>

            <p className="font-semibold text-[#003049]">
              Join UDealZone today and become part of a growing community
              where trust meets value. Start exploring, buying, and selling all in
              one place!
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect With Us</h2>
          <div className="flex justify-center gap-4 flex-wrap">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  style={{ borderLeft: `4px solid ${social.color}` }}
                >
                  <Icon className="w-5 h-5" style={{ color: social.color }} />
                  <span className="font-medium text-gray-700">{social.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}