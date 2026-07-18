import React from 'react';
import { FiMaximize } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';

const GenerateQRPage = () => {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <Breadcrumbs />
      
      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
        <EmptyState 
          icon={FiMaximize}
          title="Generate QR Codes"
          description="Select a registered product to generate secure, blockchain-backed QR codes for your batches."
          actionText="Select Product"
          onAction={() => console.log('Select product clicked')}
        />
      </div>
    </div>
  );
};

export default GenerateQRPage;
