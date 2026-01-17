'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Clock, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContactClientPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-navy">
      <div className="max-w-4xl mx-auto px-4 py-16 sm:py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-dark-navy-secondary rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg p-6 sm:p-8 md:p-12"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg"
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Name & Email Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-navy border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-200"
                  placeholder="Kirat Dewas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={loading}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="w-full px-4 py-3 bg-white dark:bg-dark-navy border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-200"
                  placeholder="kiratdewas@minenepal.xyz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Subject */}
            <div>
              <label 
                htmlFor="subject" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                type="text"
                className="w-full px-4 py-3 bg-white dark:bg-dark-navy border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-200"
                placeholder="How can we help you?"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={loading}
                required
                minLength={3}
              />
            </div>

            {/* Message */}
            <div>
              <label 
                htmlFor="message" 
                className="block text-sm font-semibold text-gray-900 dark:text-white mb-2"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                className="w-full px-4 py-3 bg-white dark:bg-dark-navy border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:focus:ring-blue-400 transition-all duration-200 resize-none"
                rows={6}
                placeholder="Tell us more about your inquiry..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={loading}
                required
                minLength={10}
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Minimum 10 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-mahogany-red-2 hover:bg-mahogany-red dark:bg-mahogany-red dark:hover:bg-strawberry-red text-white rounded-lg font-semibold transition-all duration-200 active:scale-[0.98] shadow-lg shadow-mahogany-red-2/30 dark:shadow-mahogany-red/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-mahogany-red-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Contact Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          <div className="bg-white dark:bg-dark-navy-secondary rounded-xl border border-gray-200 dark:border-slate-700 shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-mahogany-red-2/10 dark:bg-mahogany-red/30 rounded-lg">
                <Mail className="w-5 h-5 text-mahogany-red-2 dark:text-mahogany-red" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Email</h3>
            </div>
            <a 
              href="mailto:contact@minenepal.xyz" 
              className="text-mahogany-red-2 dark:text-mahogany-red hover:underline font-medium"
            >
              contact@minenepal.xyz
            </a>
          </div>
          <div className="bg-white dark:bg-dark-navy-secondary rounded-xl border border-gray-200 dark:border-slate-700 shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-mahogany-red-2/10 dark:bg-mahogany-red/30 rounded-lg">
                <Clock className="w-5 h-5 text-mahogany-red-2 dark:text-mahogany-red" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Response Time</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              We typically respond within 24 hours
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}