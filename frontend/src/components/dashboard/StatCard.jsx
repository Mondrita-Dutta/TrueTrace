import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, delay = 0 }) => {
  const isPositive = trend === 'up';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{value}</h3>
        </div>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-primary dark:text-blue-400">
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trendValue && (
        <div className="mt-4 flex items-center text-sm">
          <span className={clsx(
            "flex items-center font-medium mr-2",
            isPositive ? "text-success" : "text-danger"
          )}>
            {isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
            {trendValue}
          </span>
          <span className="text-slate-500 dark:text-slate-400 text-xs">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
