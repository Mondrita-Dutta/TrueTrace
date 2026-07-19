import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiCheckCircle, FiEdit2, FiMail, FiPhone, FiMapPin, FiBriefcase, FiCalendar, FiSave, FiX } from 'react-icons/fi';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: user?.companyName || user?.firstName || '',
    phone: user?.phone || '',
    companyAddress: user?.companyAddress || '',
    businessRegistrationNumber: user?.businessRegistrationNumber || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const getInitials = () => {
    const name = user?.companyName || user?.firstName || 'User';
    return name.substring(0, 2).toUpperCase();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      companyName: user?.companyName || user?.firstName || '',
      phone: user?.phone || '',
      companyAddress: user?.companyAddress || '',
      businessRegistrationNumber: user?.businessRegistrationNumber || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8 items-start">
            <div className="shrink-0 relative group">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-primary/30">
                {getInitials()}
              </div>
              {!isEditing && (
                <button 
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="absolute -bottom-3 -right-3 p-2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-full shadow-md border border-slate-100 dark:border-slate-600 hover:text-primary transition-colors">
                  <FiEdit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex-1 space-y-4 w-full">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Edit Profile</h2>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <FiX className="w-4 h-4" /> Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-3 py-1.5 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm shadow-primary/30 transition-colors flex items-center gap-1 disabled:opacity-50"
                      >
                        <FiSave className="w-4 h-4" /> {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company / Full Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                        placeholder="Company Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email (Read Only)</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                        placeholder="Phone Number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Registration Number</label>
                      <input
                        type="text"
                        name="businessRegistrationNumber"
                        value={formData.businessRegistrationNumber}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                        placeholder="Business Registration Number"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Address</label>
                      <input
                        type="text"
                        name="companyAddress"
                        value={formData.companyAddress}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-white text-sm"
                        placeholder="Full Company Address"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{user?.companyName || user?.firstName || 'Manufacturer Name'}</h1>
                      <span className="inline-flex items-center gap-1 bg-success/10 text-success px-2.5 py-0.5 rounded-full text-xs font-medium border border-success/20">
                        <FiCheckCircle className="w-3 h-3" /> Approved
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Premium Electronics Manufacturer</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <FiMail className="w-5 h-5 text-slate-400" />
                      <span>{user?.email || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <FiPhone className="w-5 h-5 text-slate-400" />
                      <span>{user?.phone || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <FiMapPin className="w-5 h-5 text-slate-400" />
                      <span>{user?.companyAddress || 'Not provided'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <FiBriefcase className="w-5 h-5 text-slate-400" />
                      <span>Reg: {user?.businessRegistrationNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                      <FiCalendar className="w-5 h-5 text-slate-400" />
                      <span>Joined October 2025</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
