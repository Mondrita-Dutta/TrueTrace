import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiBox, FiCheckCircle, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../../services/api';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        if (response.data?.success) {
          setAnalytics(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const chartData = {
    labels: analytics?.trendData?.map(d => d.date) || [],
    datasets: [
      {
        fill: true,
        label: 'Verifications (Scans)',
        data: analytics?.trendData?.map(d => d.scans) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Track verification scans and product health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 text-primary rounded-xl">
              <FiTrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Scans</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.totalScans || 0}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/10 text-success rounded-xl">
              <FiCheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Today's Scans</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.todayScans || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
              <FiBox className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Verified Products</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.verifiedProducts || 0}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-danger/10 text-danger rounded-xl">
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Fake Reports</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{analytics?.counterfeitReports || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <FiBarChart2 className="text-primary" /> Verification Trends (Last 7 Days)
        </h3>
        <div className="h-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
