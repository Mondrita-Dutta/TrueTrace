import React, { useState, useEffect } from 'react';
import { FiFileText, FiAlertTriangle, FiCheckCircle, FiX, FiImage, FiMapPin, FiMail } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';
import ExportButtons from '../../components/ui/ExportButtons';
import api from '../../services/api';
import { useSearch } from '../../context/SearchContext';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { searchQuery } = useSearch();

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
    createdAt: new Date(r.reportedAt).toLocaleString(),
  }));

  const filteredReports = reports.filter(r => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return (
      (r.productId && r.productId.toLowerCase().includes(lowerQuery)) ||
      (r.reason && r.reason.toLowerCase().includes(lowerQuery)) ||
      (r.status && r.status.toLowerCase().includes(lowerQuery))
    );
  });

  const handleUpdateStatus = async (status) => {
    if (!selectedReport) return;
    setUpdating(true);
    try {
      const response = await api.put(`/analytics/reports/${selectedReport._id}/status`, { status });
      if (response.data.success) {
        toast.success(`Report status updated to ${status}`);
        setReports(reports.map(r => r._id === selectedReport._id ? { ...r, status } : r));
        setSelectedReport({ ...selectedReport, status });
      }
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Failed to update report status');
    } finally {
      setUpdating(false);
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
                {filteredReports.map((report) => (
                  <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(report.reportedAt).toLocaleDateString()}
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
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="text-primary hover:text-secondary text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Report Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAlertTriangle className="text-danger" /> Report Details
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 bg-white dark:bg-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column - Details */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Product ID</p>
                      <p className="font-mono text-sm bg-slate-100 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {selectedReport.productId}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Report Reason</p>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{selectedReport.reason}</p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Customer Description</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg whitespace-pre-wrap">
                        {selectedReport.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><FiMapPin /> Location</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{selectedReport.location || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><FiMail /> Contact</p>
                        <p className="text-sm text-slate-800 dark:text-slate-200">{selectedReport.email || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Evidence Image & Status */}
                  <div className="space-y-6">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <FiImage /> Photo Evidence
                      </p>
                      {selectedReport.imageUrl ? (
                        <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                          <img 
                            src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${selectedReport.imageUrl}`} 
                            alt="Counterfeit Evidence" 
                            className="w-full h-auto object-contain max-h-60"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-300 dark:border-slate-600">
                          <FiImage className="w-8 h-8 mb-2 opacity-50" />
                          <p className="text-sm">No photo provided</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                       <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Investigation Status</p>
                       <div className="flex flex-col gap-2">
                         <div className="flex items-center gap-2 mb-2">
                           <span className={`px-3 py-1 text-xs font-bold rounded-full ${selectedReport.status === 'Open' ? 'bg-danger/20 text-danger' : selectedReport.status === 'Investigating' ? 'bg-yellow-500/20 text-yellow-600' : 'bg-success/20 text-success'}`}>
                             CURRENT: {selectedReport.status}
                           </span>
                         </div>
                         <div className="flex flex-wrap gap-2">
                           {['Open', 'Investigating', 'Resolved', 'Dismissed'].map(status => (
                             <button
                               key={status}
                               disabled={updating || selectedReport.status === status}
                               onClick={() => handleUpdateStatus(status)}
                               className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors border ${
                                 selectedReport.status === status 
                                   ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 border-transparent cursor-not-allowed' 
                                   : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary'
                               }`}
                             >
                               Mark {status}
                             </button>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;
