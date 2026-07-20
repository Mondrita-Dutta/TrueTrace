import React, { useState, useEffect } from 'react';
import { FiUsers, FiBox, FiActivity, FiAlertTriangle } from 'react-icons/fi';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalManufacturers: 0,
    totalProducts: 0,
    totalVerifications: 0,
    totalReports: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/analytics');
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
      <p className="text-slate-500 dark:text-slate-400">System-wide statistics and platform health.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl"><FiUsers className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              <p className="text-xs text-slate-400 mt-1">{stats.totalManufacturers} Manufacturers</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><FiBox className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Products Registered</p>
              <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-xl"><FiActivity className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Verifications</p>
              <h3 className="text-2xl font-bold">{stats.totalVerifications}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger/10 text-danger rounded-xl"><FiAlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Counterfeit Reports</p>
              <h3 className="text-2xl font-bold">{stats.totalReports}</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
