import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { FiCheckCircle, FiAlertTriangle, FiBox, FiLink, FiInfo } from 'react-icons/fi';

const iconMap = {
  success: FiCheckCircle,
  warning: FiAlertTriangle,
  product: FiBox,
  blockchain: FiLink,
  info: FiInfo,
};

const colorMap = {
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  product: "bg-primary text-white",
  blockchain: "bg-purple-500 text-white",
  info: "bg-slate-500 text-white",
};

const ActivityTimeline = ({ activities }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">Recent Activity</h3>
      <div className="space-y-6">
        {activities.map((activity, index) => {
          const Icon = iconMap[activity.type] || iconMap.info;
          const isLast = index === activities.length - 1;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex gap-4"
            >
              {!isLast && (
                <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-700" />
              )}
              <div className={clsx(
                "relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                colorMap[activity.type] || colorMap.info
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {activity.title}
                  </h4>
                  <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap ml-4">
                    {activity.timestamp}
                  </span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activity.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
