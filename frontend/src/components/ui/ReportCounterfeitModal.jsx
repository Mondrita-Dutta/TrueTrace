import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiAlertTriangle, FiUploadCloud } from 'react-icons/fi';
import Button from './Button';

const ReportCounterfeitModal = ({ isOpen, onClose, productId, productName }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    location: '',
    email: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const submitData = new FormData();
      submitData.append('productId', productId);
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      if (imageFile) {
        submitData.append('reportImage', imageFile);
      }

      const response = await fetch('/api/public/report', {
        method: 'POST',
        body: submitData
      });
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setFormData({ reason: '', description: '', location: '', email: '' });
          setImageFile(null);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-danger/10">
              <h3 className="text-lg font-bold text-danger flex items-center gap-2">
                <FiAlertTriangle /> Report Suspicious Product
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {success ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiAlertTriangle className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Report Submitted</h4>
                  <p className="text-slate-500">Thank you. The manufacturer has been notified and will investigate this product immediately.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Product</label>
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-mono">
                      {productName} ({productId})
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Reason for reporting *</label>
                    <select
                      name="reason"
                      required
                      value={formData.reason}
                      onChange={handleChange}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Fake / Counterfeit">Fake / Counterfeit</option>
                      <option value="Tampered Packaging">Tampered Packaging</option>
                      <option value="Hash Mismatch">Hash Verification Failed</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description *</label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Please provide details about why this product is suspicious..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Upload Evidence (Optional)</label>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                        <FiUploadCloud /> {imageFile ? 'Change Image' : 'Select Image'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => setImageFile(e.target.files[0])} 
                        />
                      </label>
                      {imageFile && <span className="text-xs text-slate-500 truncate max-w-[200px]">{imageFile.name}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Location (Optional)</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Store or City"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Your Email (Optional)</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="For updates"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-danger"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="danger" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Report'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportCounterfeitModal;
