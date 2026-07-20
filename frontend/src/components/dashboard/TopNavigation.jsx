import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiBell, FiMenu, FiMoon, FiSun, FiUser, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const TopNavigation = ({ toggleSidebar, title = "Dashboard" }) => {
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const getInitials = () => {
    const name = user?.companyName || user?.firstName || 'User';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Left section */}
      <div className="flex items-center flex-1">
        <button 
          onClick={toggleSidebar}
          className="mr-4 p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <FiMenu className="w-6 h-6" />
        </button>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white hidden sm:block">
          {title}
        </h1>
      </div>

      {/* Middle section - Search */}
      <div className="flex-1 max-w-md hidden md:flex items-center mx-4">
        <div className="relative w-full">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search products, reports..." 
            className="w-full bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-full py-2 pl-10 pr-4 text-sm transition-all outline-none text-slate-700 dark:text-slate-200 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-end flex-1 space-x-2 sm:space-x-4">
        
        {/* Mobile Search Icon */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full md:hidden">
          <FiSearch className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {isDark ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <FiBell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        {/* User Profile */}
        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1 pr-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {getInitials()}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden xl:block">
              {user?.companyName || user?.firstName || 'Manufacturer'}
            </span>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.companyName || user?.firstName || 'Manufacturer'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'admin@techcorp.com'}</p>
                  </div>
                  <div className="py-2">
                    <Link to="/manufacturer/profile" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <FiUser className="mr-3 w-4 h-4 text-slate-400" /> My Profile
                    </Link>
                    <Link to="/manufacturer/settings" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <FiSettings className="mr-3 w-4 h-4 text-slate-400" /> Settings
                    </Link>
                    <Link to="/manufacturer/help" onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">
                      <FiHelpCircle className="mr-3 w-4 h-4 text-slate-400" /> Help Center
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 dark:border-slate-700 py-2">
                    <button onClick={logout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                      <FiLogOut className="mr-3 w-4 h-4" /> Logout
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNavigation;
