'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { sendChatMessage, getInitialGreeting, ChatMessage } from '@/src/api/services/ChatbotApi';
import { generateId } from '@/src/utils/format';

export const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chatbot on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    const newConversationId = generateId();
    setConversationId(newConversationId);
    setIsLoading(true);

    try {
      const response = await getInitialGreeting(newConversationId);
      if (response) {
        setMessages([
          {
            role: 'assistant',
            content: response.reply,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
      setMessages([
        {
          role: 'assistant',
          content: 'Hello! Welcome to UDealZone. How can I help you today?',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || !conversationId) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
        timestamp: Date.now(),
      },
    ]);

    setIsLoading(true);

    try {
      const response = await sendChatMessage(userMessage, conversationId);

      if (response) {
        if (response.blocked) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: 'I cannot respond to that message. Please ask something else.',
              timestamp: Date.now(),
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content: response.reply,
              timestamp: Date.now(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-23 right-8 p-4 gradient-primary text-white rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        title="Chat with UDealZone Assistant"
      >
        {isOpen ? <FiX className="w-7 h-7" /> : <FiMessageCircle className="w-7 h-7" />}
      </motion.button>

      {/* Chatbot Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-35 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-100 border border-gray-200"
          >
            {/* Header */}
            <div className="gradient-primary text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">UDealZone Assistant</h3>
                <p className="text-sm text-white/80">Always here to help</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-[#F97316] text-white rounded-br-none'
                        : 'bg-gray-100 text-black rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-2 rounded-lg rounded-bl-none">
                    <div className="flex gap-2">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="border-t border-gray-200 p-4 flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#F97316] transition-colors disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="p-2 bg-[#F97316] text-white rounded-lg hover:bg-[#d97706] disabled:bg-gray-300 transition-colors"
              >
                <FiSend className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
