import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavigation from '../components/dashboard/TopNavigation';
import { useNotification } from '../context/NotificationContext';
import api from '../services/api';

const ManufacturerDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { notifyInfo } = useNotification();
  const prevScansRef = useRef(null);

  useEffect(() => {
    const pollAnalytics = async () => {
      try {
        const response = await api.get('/analytics');
        if (response.data?.success) {
          const currentScans = response.data.data.totalScans;
          if (prevScansRef.current !== null && currentScans > prevScansRef.current) {
            notifyInfo('🎉 A product was just verified!');
          }
          prevScansRef.current = currentScans;
        }
      } catch (error) {
        // silently ignore polling errors
      }
    };

    pollAnalytics(); // Initial fetch
    const interval = setInterval(pollAnalytics, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [notifyInfo]);

  return (
    <div className="flex h-screen overflow-hidden font-primary text-slate-800 dark:text-slate-200 transition-colors duration-200 bg-transparent">
      {/* Sidebar - Handles both mobile and desktop states internally */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
        <TopNavigation 
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
          title="Manufacturer Dashboard" 
        />
        
        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManufacturerDashboardLayout;
