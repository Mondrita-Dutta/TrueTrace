import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.data?.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success('User status updated');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <ToastContainer />
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manage Users</h1>
      <p className="text-slate-500 dark:text-slate-400">View and manage all users on the platform.</p>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 text-xs uppercase border-b border-slate-200 dark:border-slate-700">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                <td className="px-6 py-4">{user.name || user.companyName}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4 capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.status === 'Active' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {user.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-sm"
                    value={user.status || 'Active'}
                    onChange={(e) => handleStatusChange(user._id, e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsersPage;
