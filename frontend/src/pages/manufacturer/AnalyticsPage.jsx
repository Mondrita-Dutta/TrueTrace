import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';

const AnalyticsPage = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Breadcrumbs />
      
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
        <EmptyState 
          icon={FiBarChart2}
          title="Scan Analytics"
          description="View detailed analytics on where and when your products are being scanned by consumers across the globe."
        />
      </div>
    </div>
  );
};

export default AnalyticsPage;
