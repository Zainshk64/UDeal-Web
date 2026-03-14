'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/src/components/layout/Navbar';
import { SplashScreen } from '@/src/components/layout/SplashScreen';
import { HomePage } from '@/src/components/home/HomePage';
import { Chatbot } from '@/src/components/chatbot/Chatbot';
import { Footer } from '@/src/components/layout/Footer';
import CTASection from '@/src/components/home/CTASection';

export default function Home() {
  const [showSplash, setShowSplash] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if splash has EVER been shown in this browser session
    const hasSeenSplash = sessionStorage.getItem('splash_seen');

    if (!hasSeenSplash) {
      setShowSplash(true);
    }

    setIsReady(true);
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    sessionStorage.setItem('splash_seen', 'true');
  };

  // Don't render anything until we check sessionStorage (avoids flash)
  if (!isReady) return null;

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <Navbar variant="glass" showSearch showCategoryDropdown />
      <HomePage />
      <CTASection />
      <Chatbot />
    </>
  );
}