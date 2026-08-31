import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen text-slate-800 dark:text-slate-200 font-primary selection:bg-primary/20 selection:text-primary">
      <Navbar />
      {/* Add padding top to account for the fixed navbar */}
      <main className="flex-grow pt-[72px]">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
