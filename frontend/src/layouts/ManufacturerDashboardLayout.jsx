import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import TopNavigation from '../components/dashboard/TopNavigation';

const ManufacturerDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark font-primary text-slate-800 dark:text-slate-200 transition-colors duration-200">
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
