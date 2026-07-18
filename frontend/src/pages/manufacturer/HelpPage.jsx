import React from 'react';
import { FiHelpCircle, FiMail, FiBookOpen } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';

const faqs = [
  {
    q: "How do I register a new product?",
    a: "Go to the Products page and click 'Add New Product'. Fill in the required details such as Name, SKU, Category, and Description. Once submitted, it will be recorded on the blockchain."
  },
  {
    q: "How are QR codes generated?",
    a: "After registering a product, navigate to 'Generate QR', select your product and batch size. The system will create unique, cryptographically secure QR codes ready for printing."
  },
  {
    q: "What should I do if I receive a counterfeit report?",
    a: "Check the Reports tab to view the details of the suspicious scan, including the location and time. You can use this data to investigate supply chain leaks."
  }
];

const HelpPage = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact & Docs */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-primary dark:text-blue-400">
              <FiMail className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Contact Support</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Need help with your account? Our support team is available 24/7.
            </p>
            <button className="w-full bg-primary hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Email Support
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-primary dark:text-blue-400">
              <FiBookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Documentation</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">
              Read our developer guides and API documentation.
            </p>
            <button className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors">
              View Docs
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
              <FiHelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            </div>
            
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border border-slate-100 dark:border-slate-800">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HelpPage;
