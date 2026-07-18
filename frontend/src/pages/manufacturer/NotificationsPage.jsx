import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiTrash2, FiCheck, FiInfo, FiBox, FiMaximize, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';

const iconMap = {
  product: FiBox,
  qr: FiMaximize,
  report: FiAlertTriangle,
  system: FiInfo,
  approval: FiCheckCircle
};

const initialNotifications = [
  { id: 1, type: 'approval', title: 'Admin Approval', message: 'Your company profile has been verified and approved.', time: '2 hours ago', read: false },
  { id: 2, type: 'report', title: 'Counterfeit Report', message: 'A suspicious scan was reported for product ID #8291.', time: '5 hours ago', read: false },
  { id: 3, type: 'qr', title: 'QR Batch Generated', message: 'Batch #8942 QR codes have been successfully generated.', time: '1 day ago', read: true },
  { id: 4, type: 'product', title: 'Product Registered', message: 'Luxury Watch Model X was added to the registry.', time: '2 days ago', read: true },
  { id: 5, type: 'system', title: 'System Announcement', platform: true, message: 'TrueTrace platform maintenance scheduled for this weekend.', time: '1 week ago', read: true },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState('all'); // all, unread

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const toggleRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: !n.read } : n
    ));
  };

  const filteredNotifications = notifications.filter(n => filter === 'all' || (filter === 'unread' && !n.read));

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <FiBell className="text-primary" /> Notifications
        </h2>
        <div className="flex items-center gap-3">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
          </select>
          <button 
            onClick={handleMarkAllRead}
            className="text-sm font-medium text-primary hover:text-secondary dark:text-blue-400 flex items-center gap-1"
          >
            <FiCheck /> Mark all read
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <FiBell className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No notifications found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            <AnimatePresence>
              {filteredNotifications.map((notif) => {
                const Icon = iconMap[notif.type] || FiInfo;
                return (
                  <motion.div 
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className={`p-4 sm:p-6 flex items-start gap-4 transition-colors ${!notif.read ? 'bg-blue-50/50 dark:bg-slate-800/80' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  >
                    <div className={`p-3 rounded-xl shrink-0 ${!notif.read ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className={`font-semibold truncate ${!notif.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                          {notif.title}
                        </h4>
                        <span className="text-xs text-slate-400 shrink-0 whitespace-nowrap mt-1">{notif.time}</span>
                      </div>
                      <p className={`text-sm ${!notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                        {notif.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <button 
                        onClick={() => toggleRead(notif.id)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title={notif.read ? "Mark as unread" : "Mark as read"}
                      >
                        <FiCheck className={`w-4 h-4 ${!notif.read ? 'opacity-100' : 'opacity-50'}`} />
                      </button>
                      <button 
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 text-slate-400 hover:text-danger hover:bg-red-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
