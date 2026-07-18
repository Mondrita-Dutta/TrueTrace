import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 h-full min-h-[400px]"
    >
      <div className="w-20 h-20 bg-blue-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-primary dark:text-blue-400" />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-primary hover:bg-secondary text-white font-medium py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-slate-800 shadow-lg shadow-primary/30"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
