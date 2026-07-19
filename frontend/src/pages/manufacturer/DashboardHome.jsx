import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { FiBox, FiCheckCircle, FiMaximize, FiBarChart2, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import StatCard from '../../components/dashboard/StatCard';
import QuickActionButton from '../../components/dashboard/QuickActionButton';
import ActivityTimeline from '../../components/dashboard/ActivityTimeline';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import { CardSkeleton } from '../../components/dashboard/LoadingSkeleton';

const DashboardHome = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { title: 'Total Products', value: '1,248', icon: FiBox, trend: 'up', trendValue: '+12%' },
    { title: 'Verified Products', value: '1,102', icon: FiCheckCircle, trend: 'up', trendValue: '+18%' },
    { title: 'Total Scans', value: '45.2k', icon: FiBarChart2, trend: 'up', trendValue: '+24%' },
    { title: 'Counterfeit Reports', value: '12', icon: FiAlertTriangle, trend: 'down', trendValue: '-5%' },
  ];

  const quickActions = [
    { title: 'Register Product', description: 'Add a new product to TrueTrace', icon: FiPlus, to: '/manufacturer/products', variant: 'primary' },
    { title: 'Generate QR', description: 'Create verifiable QR codes', icon: FiMaximize, to: '/manufacturer/generate-qr', variant: 'secondary' },
    { title: 'View Analytics', description: 'Check scan locations & stats', icon: FiBarChart2, to: '/manufacturer/analytics', variant: 'secondary' },
  ];

  const activities = [
    { id: 1, type: 'success', title: 'Product Registered', description: 'Luxury Watch Model X was successfully registered on the blockchain.', timestamp: '10 mins ago' },
    { id: 2, type: 'blockchain', title: 'QR Batch Generated', description: 'Generated 500 QR codes for batch #8942.', timestamp: '2 hours ago' },
    { id: 3, type: 'warning', title: 'Counterfeit Report', description: 'Suspicious scan detected in London, UK.', timestamp: '5 hours ago' },
    { id: 4, type: 'info', title: 'Admin Approval', description: 'Your company profile was verified by TrueTrace Admins.', timestamp: '1 day ago' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs />

      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-40 -mb-20 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-success/10 text-success px-3 py-1 rounded-full text-sm font-medium mb-4">
            <FiCheckCircle className="w-4 h-4" />
            <span>Verified Manufacturer</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Welcome back, {user?.companyName || user?.firstName || 'Manufacturer'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl">
            Here's what's happening with your products today. You have generated 500 new QR codes and received 12 new scans in the last 24 hours.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading 
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : stats.map((stat, index) => (
              <StatCard key={index} {...stat} delay={index * 0.1} />
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Quick Actions</h3>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} {...action} delay={index * 0.1 + 0.2} />
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 h-[400px]">
               <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded h-6 w-1/4 mb-6" />
               <div className="space-y-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
                     <div className="flex-1 space-y-2">
                       <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
                       <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          ) : (
            <ActivityTimeline activities={activities} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
