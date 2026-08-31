import React from 'react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">1. Information We Collect</h2>
          <p>At TrueTrace, we are committed to protecting your privacy. We collect minimal information necessary to provide our product authentication and tracking services. This includes account details for manufacturers and non-personally identifiable analytics data for public users.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">2. Blockchain Data</h2>
          <p>Please note that any product verification data committed to the Stellar blockchain is public, immutable, and permanent by design. This cryptographic data does not contain sensitive personal information.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">3. Usage Tracking</h2>
          <p>We use Vercel Analytics to monitor application performance and general usage trends to improve our service. This data is fully anonymized.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">4. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact our support team.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPage;
