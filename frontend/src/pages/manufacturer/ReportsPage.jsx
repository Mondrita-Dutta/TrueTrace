import React, { useState, useEffect } from 'react';
import { FiFileText, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';
import ExportButtons from '../../components/ui/ExportButtons';
import api from '../../services/api';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/analytics/reports');
        if (response.data?.success) {
          setReports(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const exportColumns = [
    { label: 'Date', key: 'createdAt' },
    { label: 'Product ID', key: 'productId' },
    { label: 'Reason', key: 'reason' },
    { label: 'Location', key: 'location' },
    { label: 'Status', key: 'status' },
  ];

  const exportData = reports.map(r => ({
    ...r,
    createdAt: new Date(r.createdAt).toLocaleString(),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <Breadcrumbs />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Counterfeit Reports</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and investigate suspicious product reports</p>
        </div>
        
        {reports.length > 0 && (
          <ExportButtons 
            data={exportData}
            filename="counterfeit_reports"
            pdfTitle="Counterfeit Reports"
            columns={exportColumns}
          />
        )}
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
        {reports.length === 0 ? (
          <div className="p-6 h-full flex items-center justify-center">
            <EmptyState 
              icon={FiFileText}
              title="Counterfeit Reports"
              description="You currently have no counterfeit reports. Any suspicious scans reported by consumers will appear here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-medium">Date reported</th>
                  <th className="px-6 py-4 font-medium">Product ID</th>
                  <th className="px-6 py-4 font-medium">Reason</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-slate-900 dark:text-white">{report.productId}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {report.reason === 'Fake / Counterfeit' ? (
                          <FiAlertTriangle className="text-danger" />
                        ) : (
                          <FiFileText className="text-yellow-500" />
                        )}
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {report.reason}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'Open' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary hover:text-secondary text-sm font-medium">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
