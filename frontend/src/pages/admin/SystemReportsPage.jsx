import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const SystemReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await api.get('/admin/reports');
        if (response.data?.success) {
          setReports(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Reports</h1>
      <p className="text-slate-500 dark:text-slate-400">View all counterfeit reports across the platform.</p>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Manufacturer</th>
              <th className="px-6 py-4 font-medium">Product ID</th>
              <th className="px-6 py-4 font-medium">Reason</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {reports.map(report => (
              <tr key={report._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4 text-sm">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">{report.manufacturerId?.companyName || 'Unknown'}</td>
                <td className="px-6 py-4 font-mono text-sm">{report.productId}</td>
                <td className="px-6 py-4">{report.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${report.status === 'Open' ? 'bg-danger/10 text-danger' : 'bg-success/10 text-success'}`}>
                    {report.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SystemReportsPage;
