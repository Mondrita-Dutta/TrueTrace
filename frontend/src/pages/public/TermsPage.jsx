import React from 'react';
import { motion } from 'framer-motion';

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Terms of Service</h1>
        
        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">1. Acceptance of Terms</h2>
          <p>By accessing or using the TrueTrace platform, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access our service.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">2. Use of Service</h2>
          <p>TrueTrace provides product authentication using blockchain technology. Manufacturers are responsible for the accuracy of the product data they register. Consumers should use the verification tool as an informational resource.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">3. Blockchain Finality</h2>
          <p>Transactions submitted to the Stellar network through our platform are final. We cannot modify, delete, or reverse any product registration once it has been confirmed on the blockchain.</p>
          
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">4. Limitation of Liability</h2>
          <p>TrueTrace shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your access to or use of, or inability to access or use, the service.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsPage;
