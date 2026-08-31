import React from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaCode, FaCubes, FaShieldAlt } from 'react-icons/fa';

const DocsPage = () => {
  const sections = [
    {
      title: 'Getting Started',
      description: 'Learn how to set up your TrueTrace account and register your first product on the blockchain.',
      icon: <FaBook className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Blockchain Verification',
      description: 'Understand how our Stellar blockchain integration ensures product authenticity and provenance.',
      icon: <FaCubes className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Security Guide',
      description: 'Best practices for securing your manufacturer account and protecting your product data.',
      icon: <FaShieldAlt className="w-8 h-8 text-primary" />,
    },
    {
      title: 'Developer API',
      description: 'Integrate TrueTrace directly into your existing supply chain management systems.',
      icon: <FaCode className="w-8 h-8 text-primary" />,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            Documentation
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 dark:text-slate-400">
            Everything you need to know about using TrueTrace.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {section.description}
              </p>
              <div className="mt-6 flex items-center text-primary font-semibold hover:text-primary-dark transition-colors">
                Read more &rarr;
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
