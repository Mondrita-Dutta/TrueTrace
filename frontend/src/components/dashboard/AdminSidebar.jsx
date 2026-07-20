import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { 
  FiHome, FiUsers, FiBriefcase, FiAlertTriangle, 
  FiActivity, FiSettings, FiLogOut, FiX 
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/admin', icon: FiHome, exact: true },
  { name: 'Users', path: '/admin/users', icon: FiUsers },
  { name: 'Manufacturers', path: '/admin/manufacturers', icon: FiBriefcase },
  { name: 'Reports', path: '/admin/reports', icon: FiAlertTriangle },
  { name: 'System Logs', path: '/admin/logs', icon: FiActivity },
];

const bottomItems = [
  { name: 'Settings', path: '/admin/settings', icon: FiSettings },
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

const AdminSidebar = ({ isOpen, setIsOpen }) => {
  const { logout } = useAuth();
  
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "-100%", opacity: 0 }
  };

  return (
    <>
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

      <motion.aside
        initial={false}
        animate={isOpen ? "open" : "closed"}
        variants={sidebarVariants}
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out lg:!transform-none lg:!opacity-100",
          "shadow-2xl lg:shadow-none"
        )}
      >
        <div className="flex items-center justify-between p-6 h-20">
          <NavLink to="/admin" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">
              T
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              TrueTrace
            </span>
            <span className="ml-1 text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full dark:bg-red-900/30 dark:text-red-400">ADMIN</span>
          </NavLink>
          
          <button 
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 scrollbar-hide space-y-1">
          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-4 mt-2">
            Admin Controls
          </div>
          {navItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              item={item} 
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }} 
            />
          ))}

          <div className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 ml-4 mt-8">
            System
          </div>
          {bottomItems.map((item) => (
            <SidebarItem 
              key={item.path} 
              item={item} 
              onClick={() => {
                if (window.innerWidth < 1024) setIsOpen(false);
              }} 
            />
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors group"
          >
            <FiLogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default AdminSidebar;
