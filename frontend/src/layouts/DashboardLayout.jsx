import React from 'react';
import { Outlet } from 'react-router-dom';

const Sidebar = () => (
  <aside className="w-64 bg-secondary text-white flex flex-col shadow-lg hidden md:flex h-full">
    <div className="p-4 text-2xl font-bold border-b border-blue-800">TrueTrace</div>
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        <li><a href="/dashboard" className="block py-2 px-4 rounded hover:bg-blue-800 transition">Dashboard</a></li>
        <li><a href="/products" className="block py-2 px-4 rounded hover:bg-blue-800 transition">Products</a></li>
        <li><a href="/settings" className="block py-2 px-4 rounded hover:bg-blue-800 transition">Settings</a></li>
      </ul>
    </nav>
  </aside>
);

const DashboardHeader = () => (
  <header className="bg-white dark:bg-slate-800 shadow-sm p-4 flex justify-between items-center h-16 border-b dark:border-slate-700">
    <div className="md:hidden font-bold text-primary">TrueTrace</div>
    <div className="flex-1"></div>
    <div className="flex items-center space-x-4">
      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer">
        U
      </div>
    </div>
  </header>
);

const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-light dark:bg-bg-dark font-primary text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
