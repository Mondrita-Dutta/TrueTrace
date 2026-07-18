import React from 'react';
import { FiFileText } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';

const ReportsPage = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Breadcrumbs />
      
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
        <EmptyState 
          icon={FiFileText}
          title="Counterfeit Reports"
          description="You currently have no counterfeit reports. Any suspicious scans reported by consumers will appear here."
        />
      </div>
    </div>
  );
};

export default ReportsPage;
