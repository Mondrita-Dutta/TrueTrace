import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { 
  FiHome, FiBox, FiMaximize, FiBarChart2, 
  FiFileText, FiBell, FiUser, FiSettings, 
  FiHelpCircle, FiLogOut, FiX 
} from 'react-icons/fi';

const navItems = [
  { name: 'Dashboard', path: '/manufacturer', icon: FiHome, exact: true },
  { name: 'Products', path: '/manufacturer/products', icon: FiBox },
  { name: 'Generate QR', path: '/manufacturer/generate-qr', icon: FiMaximize },
  { name: 'Scan Analytics', path: '/manufacturer/analytics', icon: FiBarChart2 },
  { name: 'Reports', path: '/manufacturer/reports', icon: FiFileText },
  { name: 'Notifications', path: '/manufacturer/notifications', icon: FiBell },
];

const bottomItems = [
  { name: 'Profile', path: '/manufacturer/profile', icon: FiUser },
  { name: 'Settings', path: '/manufacturer/settings', icon: FiSettings },
  { name: 'Help', path: '/manufacturer/help', icon: FiHelpCircle },
];

const SidebarItem = ({ item, onClick }) => {
  const location = useLocation();
  const isActive = item.exact 
    ? location.pathname === item.path 
    : location.pathname.startsWith(item.path);

  return (
    <NavLink
      to={item.path}
      onClick={onClick}
      className={clsx(
        "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
        isActive 
          ? "bg-primary text-white shadow-md shadow-primary/20" 
          : "text-slate-600 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-blue-400"
      )}
    >
      <item.icon className={clsx("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-primary dark:group-hover:text-blue-400")} />
      <span className="font-medium">{item.name}</span>
      {isActive && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-8 bg-white rounded-r-full"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </NavLink>
  );
};

const Sidebar = ({ isOpen, setIsOpen }) => {
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Content */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isOpen ? "open" : "closed"}
        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen",
          "lg:!transform-none lg:!opacity-100 lg:flex" // Always show on large screens
        )}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-primary dark:text-blue-500">
            <FiBox className="w-8 h-8" />
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              TrueTrace
            </span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <div className="mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => (
            <SidebarItem key={item.path} item={item} onClick={() => setIsOpen(false)} />
          ))}

          <div className="mt-8 mb-2 px-4 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Account
          </div>
          {bottomItems.map((item) => (
            <SidebarItem key={item.path} item={item} onClick={() => setIsOpen(false)} />
          ))}
        </div>

        {/* User / Logout Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button className="flex items-center space-x-3 px-4 py-3 w-full rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors">
            <FiLogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
