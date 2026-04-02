'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiX, FiClock, FiInbox } from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import {
  getNotifications,
  Notification,
} from '@/src/api/services/NotificationApi';
import { cn } from '@/src/utils/cn';

interface NotificationPopupProps {
  variant?: 'glass' | 'solid';
  className?: string;
}

export const NotificationPopup: React.FC<NotificationPopupProps> = ({
  variant = 'glass',
  className,
}) => {
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications when opened
  useEffect(() => {
    if (isOpen && isAuthenticated && user?.userId && !hasFetched) {
      fetchNotifications();
    }
  }, [isOpen, isAuthenticated, user?.userId]);

  const fetchNotifications = async () => {
    if (!user?.userId) return;

    setIsLoading(true);
    try {
      const data = await getNotifications(user.userId);
      setNotifications(data);
      setHasFetched(true);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Reset fetch state when reopening
    if (!isOpen) {
      setHasFetched(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const textColor =
    variant === 'glass' ? 'text-gray-900' : 'text-white';

  return (
    <div ref={popupRef} className={cn('relative', className)}>
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className={cn(
          'relative p-2.5 cursor-pointer rounded-lg transition-colors',
          variant === 'glass'
            ? 'hover:bg-gray-100'
            : 'hover:bg-white/10'
        )}
        title="Notifications"
      >
        <FiBell className={cn('w-5 h-5', textColor)} />

        {/* Unread dot */}
        
      </button>

      {/* Popup Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50',
              'w-80 sm:w-96'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-[#003049] to-[#004d6d]">
              <div className="flex items-center gap-2">
                <FiBell className="w-5 h-5 text-white" />
                <h3 className="font-bold text-white">Notifications</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {!isAuthenticated ? (
                /* Not logged in state */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiBell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Login Required
                  </h4>
                  <p className="text-gray-500 text-sm">
                    Please login to see your notifications
                  </p>
                </div>
              ) : isLoading ? (
                /* Loading state */
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-full" />
                        <div className="h-3 bg-gray-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                /* Empty state */
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <FiInbox className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">
                    No Notifications
                  </h4>
                  <p className="text-gray-500 text-sm">
                    You&apos;re all caught up! No new notifications.
                  </p>
                </div>
              ) : (
                /* Notification items */
                <div className="divide-y divide-gray-50">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.notid}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316]/10 to-[#F97316]/20 flex items-center justify-center flex-shrink-0">
                          <FiBell className="w-5 h-5 text-[#F97316]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">
                            {notif.title}
                          </p>
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                            {notif.description}
                          </p>
                          <div className="flex items-center gap-1 mt-2">
                            <FiClock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {formatDate(notif.entryDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};