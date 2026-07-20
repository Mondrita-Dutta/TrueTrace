import React from 'react';
import { FiDownload } from 'react-icons/fi';
import { exportToCSV, exportToPDF, exportToExcel } from '../../utils/exportUtils';

const ExportButtons = ({ data, filename, pdfTitle, columns }) => {
  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => exportToCSV(data, filename)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <FiDownload /> CSV
      </button>
      <button 
        onClick={() => exportToExcel(data, filename)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <FiDownload /> Excel
      </button>
      <button 
        onClick={() => exportToPDF(data, filename, pdfTitle, columns)}
        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
      >
        <FiDownload /> PDF
      </button>
    </div>
  );
};

export default ExportButtons;
