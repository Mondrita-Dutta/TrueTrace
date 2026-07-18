import React from 'react';
import { FiLock, FiBell, FiMoon, FiTrash2, FiSave } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import { useTheme } from '../../context/ThemeContext';

const SettingsPage = () => {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="space-y-6">
      <Breadcrumbs />

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account preferences and settings.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Theme Preferences */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FiMoon className="text-primary" /> Appearance
            </h3>
            <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">Dark Mode</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode theme for the dashboard.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={isDark}
                  onChange={toggleTheme}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </section>

          {/* Notifications */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FiBell className="text-primary" /> Notification Preferences
            </h3>
            <div className="space-y-3">
              {['Email alerts for new counterfeit reports', 'Push notifications for QR generation', 'Weekly analytics summary'].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">{item}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={i !== 2} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <FiLock className="text-primary" /> Security
            </h3>
            <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Change Password
            </button>
          </section>

          {/* Danger Zone */}
          <section className="pt-6 border-t border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-danger mb-4 flex items-center gap-2">
              <FiTrash2 /> Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10">
              <div>
                <h4 className="font-medium text-red-800 dark:text-red-400">Delete Account</h4>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1">Permanently delete your data and products. This cannot be undone.</p>
              </div>
              <button className="bg-danger hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors shrink-0">
                Delete Account
              </button>
            </div>
          </section>

        </div>
        
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end">
          <button className="bg-primary hover:bg-secondary text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
            <FiSave /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
