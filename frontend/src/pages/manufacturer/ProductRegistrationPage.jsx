import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiUploadCloud, FiImage, FiChevronLeft, FiPrinter, FiDownload, FiCopy, FiArrowRight, FiBox, FiList, FiFileText } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Papa from 'papaparse';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import productService from '../../services/productService';
import * as templateService from '../../services/templateService';

const categories = [
  "Apparel", "Automotive", "Cosmetics", "Electronics",
  "Food & Beverage", "Furniture", "Jewelry", "Luxury Goods",
  "Other", "Pharmaceuticals", "Toys"
];

const ProductRegistrationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('single'); // 'single', 'batch', 'bulk'
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null); // Result object
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Templates
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');

  // Batch
  const [quantity, setQuantity] = useState('');

  // Bulk
  const [csvFile, setCsvFile] = useState(null);
  const [parsedCsvData, setParsedCsvData] = useState([]);

  // Helper to get local date string (YYYY-MM-DD) avoiding UTC midnight offset bugs
  const getLocalDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [formData, setFormData] = useState({
    productName: '', brandName: '', category: '', customCategory: '', description: '',
    batchNumber: '', serialNumber: '', manufacturingDate: '', expiryDate: '', 
    countryOfOrigin: '', manufacturerName: '', manufacturerCompany: '', 
    warrantyPeriod: '', additionalNotes: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if manufacturer profile is complete
    if (user && user.role === 'manufacturer') {
      const isProfileComplete = user.companyName && user.companyAddress && user.businessRegistrationNumber && user.licenseNumber;
      if (!isProfileComplete) {
        toast.warning('Please complete your profile before registering a product.');
        navigate('/manufacturer/profile', { state: { incompleteProfile: true } });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await templateService.getTemplates();
      setTemplates(res.data); // Fixed nested .data from backend response
    } catch (error) {
      console.error("Failed to load templates", error);
    }
  };

  const handleTemplateChange = (e) => {
    const tempId = e.target.value;
    setSelectedTemplate(tempId);
    if (!tempId) {
      resetFormData();
      return;
    }
    const temp = templates.find(t => t._id === tempId);
    if (temp) {
      setFormData(prev => ({
        ...prev,
        productName: temp.productName || '',
        brandName: temp.brandName || '',
        category: temp.category || '',
        description: temp.description || '',
        countryOfOrigin: temp.countryOfOrigin || '',
        manufacturerName: temp.manufacturerName || '',
        manufacturerCompany: temp.manufacturerCompany || '',
        warrantyPeriod: temp.warrantyPeriod || '',
        additionalNotes: temp.additionalNotes || ''
      }));
    }
  };

  const validate = () => {
    if (mode === 'bulk') {
      if (!parsedCsvData.length) {
        toast.error('Please upload and parse a valid CSV file first.');
        return false;
      }
      return true;
    }

    const newErrors = {};
    const required = [
      'productName', 'brandName', 'category', 'description', 
      'batchNumber', 'manufacturingDate', 'countryOfOrigin', 
      'manufacturerName', 'manufacturerCompany'
    ];
    if (mode === 'single') required.push('serialNumber');
    if (mode === 'batch' && (!quantity || parseInt(quantity) < 1 || parseInt(quantity) > 500)) {
      newErrors.quantity = 'Please enter a quantity between 1 and 500';
    }

    required.forEach(field => {
      if (!formData[field] || (typeof formData[field] === 'string' && !formData[field].trim())) {
        newErrors[field] = 'Please fill out this field';
      }
    });

    if (formData.category === 'Other' && (!formData.customCategory || !formData.customCategory.trim())) {
      newErrors.customCategory = 'Please specify the category';
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fill up all necessary fields.');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
          if (results.errors.length) {
            toast.error('Error parsing CSV. Please check format.');
            console.error(results.errors);
          } else {
            setParsedCsvData(results.data);
            toast.success(`Parsed ${results.data.length} products from CSV`);
          }
        }
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      if (mode === 'bulk') {
        const res = await productService.bulkCreateProducts(parsedCsvData);
        setBulkSuccess(true);
        setSuccessMessage(res.message || 'Bulk upload successful');
      } 
      else if (mode === 'batch') {
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'category') {
            submitData.append('category', formData.category === 'Other' ? formData.customCategory : formData.category);
          } else if (key !== 'customCategory' && formData[key]) {
            submitData.append(key, formData[key]);
          }
        });
        submitData.append('quantity', quantity);
        if (imageFile) submitData.append('productImage', imageFile);

        const res = await productService.createProductBatch(submitData);
        setBatchSuccess(true);
        setSuccessMessage(res.message || 'Batch creation successful');
      } 
      else {
        // Single
        const submitData = new FormData();
        Object.keys(formData).forEach(key => {
          if (key === 'category') {
            submitData.append('category', formData.category === 'Other' ? formData.customCategory : formData.category);
          } else if (key !== 'customCategory' && formData[key]) {
            submitData.append(key, formData[key]);
          }
        });
        if (imageFile) submitData.append('productImage', imageFile);

        const res = await productService.createProduct(submitData);
        setSuccessData(res.data);
      }

      // Handle Template Saving
      if ((mode === 'single' || mode === 'batch') && saveAsTemplate && templateName) {
        await templateService.createTemplate({
          ...formData,
          templateName,
          category: formData.category === 'Other' ? formData.customCategory : formData.category
        });
        toast.success('Template saved successfully!');
        fetchTemplates();
        setSaveAsTemplate(false);
        setTemplateName('');
      }

    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFormData = () => {
    setFormData({
      productName: '', brandName: '', category: '', customCategory: '', description: '',
      batchNumber: '', serialNumber: '', manufacturingDate: '', expiryDate: '', 
      countryOfOrigin: '', manufacturerName: '', manufacturerCompany: '', 
      warrantyPeriod: '', additionalNotes: ''
    });
    setQuantity('');
    setErrors({});
  };

  const resetAll = () => {
    setSuccessData(null);
    setBatchSuccess(false);
    setBulkSuccess(false);
    setSuccessMessage('');
    setCsvFile(null);
    setParsedCsvData([]);
    resetFormData();
  };

  // SUCCESS VIEWS
  if (successData || batchSuccess || bulkSuccess) {
    return (
      <div className="h-full flex flex-col">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
        <Breadcrumbs />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center py-12"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 sm:p-12 max-w-2xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-success/10 to-transparent pointer-events-none" />
            <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <FiCheckCircle className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
              Registration Successful!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 relative z-10">
              {successMessage || 'Your product(s) have been registered.'}
            </p>
            
            {successData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 relative z-10">
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-2">Unique Product ID</p>
                  <p className="text-2xl font-mono font-bold text-primary mb-4">{successData.productId}</p>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(successData.productId); toast.success('Copied!'); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm"
                  >
                    <FiCopy /> Copy ID
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                  <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-3">Anti-Counterfeit QR</p>
                  <div className="bg-white p-2 rounded-xl shadow-sm mb-4">
                    <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${successData.qrImageUrl}`} className="w-32 h-32" alt="QR" />
                  </div>
                  <div className="flex gap-2">
                    <a href={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${successData.qrImageUrl}`} download={`QR-${successData.productId}.png`} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm"><FiDownload /></a>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button onClick={resetAll} className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800">
                Register Another
              </button>
              <button onClick={() => navigate('/manufacturer/products')} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold flex items-center justify-center gap-2">
                Go to Products <FiArrowRight />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/manufacturer/products')} className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
          <FiChevronLeft className="w-5 h-5 text-slate-600" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <FiBox className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register Products</h2>
                <p className="text-slate-500 text-sm">Create verifiable assets on the TrueTrace blockchain.</p>
              </div>
            </div>
            
            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button type="button" onClick={() => setMode('single')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${mode === 'single' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                <FiBox /> Single
              </button>
              <button type="button" onClick={() => setMode('batch')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${mode === 'batch' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                <FiList /> Batch
              </button>
              <button type="button" onClick={() => setMode('bulk')} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${mode === 'bulk' ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-500 hover:text-slate-700'}`}>
                <FiFileText /> CSV Bulk
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <form id="registration-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8">
            
            {(mode === 'single' || mode === 'batch') && (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-sm font-semibold text-primary">Load Template:</span>
                  <select value={selectedTemplate} onChange={handleTemplateChange} className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white text-sm outline-none">
                    <option value="">-- No Template (Start Fresh) --</option>
                    {templates?.map?.(t => (
                      <option key={t._id} value={t._id}>{t.templateName}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Product Name <span className="text-danger">*</span></label>
                    <input type="text" name="productName" value={formData.productName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.productName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.productName && <p className="text-danger text-xs mt-1">{errors.productName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Brand <span className="text-danger">*</span></label>
                    <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.brandName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.brandName && <p className="text-danger text-xs mt-1">{errors.brandName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Category <span className="text-danger">*</span></label>
                    <select name="category" value={formData.category} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.category ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`}>
                      <option value="">Select Category...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.category && <p className="text-danger text-xs mt-1">{errors.category}</p>}
                    
                    {formData.category === 'Other' && (
                      <div className="mt-2">
                        <input type="text" name="customCategory" value={formData.customCategory} onChange={handleChange} placeholder="Custom category" className={`w-full p-3 rounded-xl border ${errors.customCategory ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                        {errors.customCategory && <p className="text-danger text-xs mt-1">{errors.customCategory}</p>}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Description <span className="text-danger">*</span></label>
                    <textarea name="description" rows="2" value={formData.description} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.description ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.description && <p className="text-danger text-xs mt-1">{errors.description}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Batch Number <span className="text-danger">*</span></label>
                    <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.batchNumber ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white font-mono`} />
                    {errors.batchNumber && <p className="text-danger text-xs mt-1">{errors.batchNumber}</p>}
                  </div>
                  {mode === 'single' ? (
                    <div>
                      <label className="block text-sm font-semibold mb-1">Serial Number <span className="text-danger">*</span></label>
                      <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.serialNumber ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white font-mono`} />
                      {errors.serialNumber && <p className="text-danger text-xs mt-1">{errors.serialNumber}</p>}
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-primary">Quantity to Generate <span className="text-danger">*</span></label>
                      <input type="number" min="1" max="500" name="quantity" value={quantity} onChange={e=> { setQuantity(e.target.value); if(errors.quantity) setErrors({...errors, quantity: null}); }} placeholder="Max 500" className={`w-full p-3 rounded-xl border ${errors.quantity ? 'border-danger' : 'border-primary/30'} bg-primary/5 text-primary outline-none`} />
                      {errors.quantity && <p className="text-danger text-xs mt-1">{errors.quantity}</p>}
                      {!errors.quantity && <p className="text-xs mt-1 text-slate-500">Serials will be auto-generated as: [Batch]-[0001...]</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-1">Mfg Date <span className="text-danger">*</span></label>
                    <input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleChange} max={getLocalDateString()} className={`w-full p-3 rounded-xl border ${errors.manufacturingDate ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.manufacturingDate && <p className="text-danger text-xs mt-1">{errors.manufacturingDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Expiry Date (Optional)</label>
                    <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} min={formData.manufacturingDate || getLocalDateString()} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-1">Country of Origin <span className="text-danger">*</span></label>
                    <input type="text" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.countryOfOrigin ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.countryOfOrigin && <p className="text-danger text-xs mt-1">{errors.countryOfOrigin}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Manufacturer Name <span className="text-danger">*</span></label>
                    <input type="text" name="manufacturerName" value={formData.manufacturerName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.manufacturerName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.manufacturerName && <p className="text-danger text-xs mt-1">{errors.manufacturerName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Company <span className="text-danger">*</span></label>
                    <input type="text" name="manufacturerCompany" value={formData.manufacturerCompany} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.manufacturerCompany ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 dark:text-white`} />
                    {errors.manufacturerCompany && <p className="text-danger text-xs mt-1">{errors.manufacturerCompany}</p>}
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-primary" />
                      <span className="text-sm font-medium">Save these details as a new Template</span>
                    </label>
                    {saveAsTemplate && (
                      <input type="text" placeholder="Enter Template Name" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full mt-2 p-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 dark:text-white text-sm" />
                    )}
                  </div>
                </div>
                
                {/* Image Upload Section */}
                <div className="grid grid-cols-1 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Product Image (Optional)</label>
                    <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-xl hover:border-primary transition-colors cursor-pointer"
                         onClick={() => document.getElementById('image-upload').click()}
                         onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                         onDrop={(e) => {
                           e.preventDefault();
                           e.stopPropagation();
                           const file = e.dataTransfer.files[0];
                           if (file && file.type.startsWith('image/')) {
                             setImageFile(file);
                             const reader = new FileReader();
                             reader.onloadend = () => setImagePreview(reader.result);
                             reader.readAsDataURL(file);
                           } else {
                             toast.error('Please upload a valid image file');
                           }
                         }}>
                      <div className="space-y-1 text-center">
                        {imagePreview ? (
                          <div className="flex flex-col items-center">
                            <img src={imagePreview} alt="Preview" className="h-32 object-contain mb-2 rounded-lg" />
                            <p className="text-sm text-primary font-medium">Click to change image</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <FiImage className="mx-auto h-12 w-12 text-slate-400" />
                            <div className="flex text-sm text-slate-600 dark:text-slate-400 mt-4">
                              <span className="relative rounded-md font-medium text-primary hover:text-secondary focus-within:outline-none">
                                <span>Upload a file</span>
                              </span>
                              <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                      <input 
                        id="image-upload" 
                        name="image-upload" 
                        type="file" 
                        accept="image/*"
                        className="sr-only" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setImageFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setImagePreview(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {mode === 'bulk' && (
              <div className="p-8 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-3xl">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiUploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upload CSV File</h3>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">Upload a CSV containing your products. Ensure columns match: productName, brandName, category, description, batchNumber, serialNumber, manufacturingDate, countryOfOrigin, manufacturerName, manufacturerCompany.</p>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="block w-full max-w-sm mx-auto text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                
                {parsedCsvData.length > 0 && (
                  <div className="mt-6 p-4 bg-success/10 text-success rounded-xl font-medium">
                    <FiCheckCircle className="inline mr-2" /> Ready to register {parsedCsvData.length} products
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-4">
          <button type="submit" form="registration-form" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold transition-colors flex items-center gap-2 disabled:opacity-50">
            {isSubmitting ? 'Processing...' : (mode === 'bulk' ? `Upload ${parsedCsvData.length || ''} Products` : mode === 'batch' ? `Generate ${quantity || 'Batch'}` : 'Register Product')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductRegistrationPage;
