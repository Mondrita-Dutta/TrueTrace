import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Link } from 'react-router-dom';

const QuickActionButton = ({ icon: Icon, title, description, to, delay = 0, variant = "primary" }) => {
  const isPrimary = variant === 'primary';

  return (
    <Link to={to} className="block w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={clsx(
          "p-5 rounded-2xl border transition-all duration-300 flex items-center space-x-4 h-full",
          isPrimary 
            ? "bg-gradient-to-br from-primary to-blue-600 text-white border-transparent shadow-lg shadow-blue-500/30"
            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md"
        )}
      >
        <div className={clsx(
          "p-3 rounded-xl flex-shrink-0",
          isPrimary ? "bg-white/20 text-white" : "bg-blue-50 dark:bg-slate-700 text-primary dark:text-blue-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className={clsx("font-semibold mb-1", isPrimary ? "text-white" : "text-slate-800 dark:text-slate-100")}>
            {title}
          </h4>
          <p className={clsx("text-sm", isPrimary ? "text-blue-100" : "text-slate-500 dark:text-slate-400")}>
            {description}
          </p>
        </div>
      </motion.div>
    </Link>
  );
};

export default QuickActionButton;
