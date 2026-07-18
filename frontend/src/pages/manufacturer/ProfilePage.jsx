import React from 'react';
import { FiCheckCircle, FiEdit2, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';

const ProfilePage = () => {
  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-primary/30">
                TC
              </div>
              <button className="absolute -bottom-3 -right-3 p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-md border border-slate-100 dark:border-slate-600 hover:text-primary transition-colors">
                <FiEdit2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-slate-900 dark:text-white">TechCorp Inc.</h1>
                  <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2.5 py-0.5 rounded-full text-xs font-medium border border-success/20">
                    <FiCheckCircle className="w-3 h-3" /> Approved
                  </span>
                </div>
                <p className="text-slate-500 dark:text-slate-400">Premium Electronics Manufacturer</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <FiMail className="w-5 h-5 text-slate-400" />
                  <span>admin@techcorp.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <FiPhone className="w-5 h-5 text-slate-400" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <FiMapPin className="w-5 h-5 text-slate-400" />
                  <span>San Francisco, CA, USA</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <FiBriefcase className="w-5 h-5 text-slate-400" />
                  <span>Reg: #TC-9938210</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                  <FiCalendar className="w-5 h-5 text-slate-400" />
                  <span>Joined October 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
