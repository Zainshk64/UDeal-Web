'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/src/components/layout/Navbar';
import { SplashScreen } from '@/src/components/layout/SplashScreen';
import { HomePage } from '@/src/components/home/HomePage';
import { Chatbot } from '@/src/components/chatbot/Chatbot';
import { Footer } from '@/src/components/layout/Footer';
import CTASection from '@/src/components/home/CTASection';

export default function Home() {
const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  }
  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Navbar variant="glass" showSearch showCategoryDropdown />
      <HomePage />
      <CTASection/>
      <Footer/>
      <Chatbot />
    </>
  );
}