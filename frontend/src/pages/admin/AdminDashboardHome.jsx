import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBriefcase, FiBox, FiAlertTriangle, FiActivity, FiServer, FiDatabase } from 'react-icons/fi';
import adminService from '../../services/adminService';
import StatCard from '../../components/dashboard/StatCard';
import Loader from '../../components/ui/Loader';
import { toast } from 'react-toastify';

const AdminDashboardHome = () => {
  const [analytics, setAnalytics] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, healthData] = await Promise.all([
          adminService.getSystemAnalytics(),
          adminService.getSystemHealth()
        ]);
        setAnalytics(analyticsData);
        setHealth(healthData);
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader size="lg" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">System Overview</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor platform health and aggregate metrics.</p>
        </div>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={analytics?.totalUsers} icon={FiUsers} color="bg-blue-500" />
        <StatCard title="Manufacturers" value={analytics?.totalManufacturers} icon={FiBriefcase} color="bg-indigo-500" />
        <StatCard title="Total Products" value={analytics?.totalProducts} icon={FiBox} color="bg-emerald-500" />
        <StatCard title="Active Reports" value={analytics?.totalReports} icon={FiAlertTriangle} color="bg-rose-500" />
      </div>

      {/* System Health */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">System Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${health?.apiStatus === 'healthy' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
              <FiActivity size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">API Server</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{health?.apiStatus || 'Unknown'}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className={`p-4 rounded-xl ${health?.database === 'connected' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-600'}`}>
              <FiDatabase size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">MongoDB Database</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{health?.database || 'Unknown'}</h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
            <div className="p-4 rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <FiServer size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Server Uptime</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {health?.uptime ? Math.floor(health.uptime / 3600) + ' hrs' : '0 hrs'}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardHome;
