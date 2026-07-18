import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiUploadCloud, FiImage, FiChevronLeft, FiPrinter, FiDownload, FiCopy, FiArrowRight, FiBox } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import productService from '../../services/productService';

const ProductRegistrationPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null); // { productId, qrImageUrl, ... }
  
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    category: '',
    description: '',
    batchNumber: '',
    serialNumber: '',
    manufacturingDate: '',
    expiryDate: '',
    countryOfOrigin: '',
    manufacturerName: '',
    manufacturerCompany: '',
    warrantyPeriod: '',
    additionalNotes: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const required = [
      'productName', 'brandName', 'category', 'description', 
      'batchNumber', 'serialNumber', 'manufacturingDate', 
      'countryOfOrigin', 'manufacturerName', 'manufacturerCompany'
    ];
    
    required.forEach(field => {
      if (!formData[field] || !formData[field].trim()) {
        newErrors[field] = 'This field is required';
      }
    });

    if (formData.manufacturingDate) {
      const mfgDate = new Date(formData.manufacturingDate);
      if (mfgDate > new Date()) {
        newErrors.manufacturingDate = 'Cannot be in the future';
      }
      if (formData.expiryDate) {
        const expDate = new Date(formData.expiryDate);
        if (expDate <= mfgDate) {
          newErrors.expiryDate = 'Must be after manufacturing date';
        }
      }
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      toast.error('Please fix the errors in the form before submitting.');
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are allowed');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) submitData.append(key, formData[key]);
      });
      if (imageFile) {
        submitData.append('productImage', imageFile);
      }

      const res = await productService.createProduct(submitData);
      
      toast.success('Product registered successfully!');
      setSuccessData(res.data);
    } catch (err) {
      toast.error(err.message || 'Failed to register product. Serial number might be duplicate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(successData.productId);
    toast.success('Product ID copied to clipboard');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code - ${successData.productId}</title></head>
        <body style="text-align: center; font-family: sans-serif; padding: 50px;">
          <h2>Product ID: ${successData.productId}</h2>
          <img src="http://localhost:5000${successData.qrImageUrl}" style="width: 300px; height: 300px; margin: 20px 0;" />
          <p>${successData.productName} by ${successData.brandName}</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const resetForm = () => {
    setSuccessData(null);
    setFormData({
      productName: '', brandName: '', category: '', description: '',
      batchNumber: '', serialNumber: '', manufacturingDate: '',
      expiryDate: '', countryOfOrigin: '', manufacturerName: '',
      manufacturerCompany: '', warrantyPeriod: '', additionalNotes: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setErrors({});
  };

  if (successData) {
    return (
      <div className="h-full flex flex-col">
        <Breadcrumbs />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex items-center justify-center py-12"
        >
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 sm:p-12 max-w-2xl w-full text-center relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-success/10 to-transparent pointer-events-none" />
            
            <div className="w-24 h-24 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
              <FiCheckCircle className="w-12 h-12" />
            </div>
            
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
              Registration Successful!
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8 relative z-10">
              Your product has been registered and is pending blockchain verification.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 relative z-10">
              {/* Product ID Section */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-2">Unique Product ID</p>
                <p className="text-2xl font-mono font-bold text-primary mb-4">{successData.productId}</p>
                <button 
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <FiCopy /> Copy ID
                </button>
              </div>

              {/* QR Code Section */}
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-3">Anti-Counterfeit QR</p>
                <div className="bg-white p-2 rounded-xl shadow-sm mb-4">
                  <img 
                    src={`http://localhost:5000${successData.qrImageUrl}`} 
                    alt="Product QR Code"
                    className="w-32 h-32"
                  />
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`http://localhost:5000${successData.qrImageUrl}`}
                    download={`QR-${successData.productId}.png`}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary transition-colors shadow-sm"
                    title="Download PNG"
                  >
                    <FiDownload />
                  </a>
                  <button 
                    onClick={handlePrint}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-300 hover:text-primary transition-colors shadow-sm"
                    title="Print"
                  >
                    <FiPrinter />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <button 
                onClick={resetForm}
                className="w-full sm:w-auto px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Register Another
              </button>
              <button 
                onClick={() => navigate('/manufacturer/products')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold transition-colors shadow-md shadow-primary/30 flex items-center justify-center gap-2"
              >
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
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/manufacturer/products')}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
        >
          <FiChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <FiBox className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Register New Product</h2>
              <p className="text-slate-500 dark:text-slate-400">Fill in the details to generate a unique QR code and prepare for blockchain entry.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8">
          <form id="registration-form" onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-10">
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">1</span> 
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Product Name <span className="text-danger">*</span></label>
                  <input type="text" name="productName" value={formData.productName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.productName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Brand <span className="text-danger">*</span></label>
                  <input type="text" name="brandName" value={formData.brandName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.brandName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-danger">*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.category ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`}>
                    <option value="">Select Category...</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Pharmaceuticals">Pharmaceuticals</option>
                    <option value="Luxury Goods">Luxury Goods</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Food & Beverage">Food & Beverage</option>
                    <option value="Automotive">Automotive</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-danger">*</span></label>
                  <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.description ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none`} />
                </div>
              </div>
            </div>

            {/* Section 2: Identifiers & Origin */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">2</span> 
                Identifiers & Manufacturing
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Batch Number <span className="text-danger">*</span></label>
                  <input type="text" name="batchNumber" value={formData.batchNumber} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.batchNumber ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Serial Number <span className="text-danger">*</span></label>
                  <input type="text" name="serialNumber" value={formData.serialNumber} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.serialNumber ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-mono outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                  {errors.serialNumber && <p className="text-danger text-xs mt-1">{errors.serialNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Manufacturing Date <span className="text-danger">*</span></label>
                  <input type="date" name="manufacturingDate" value={formData.manufacturingDate} onChange={handleChange} max={new Date().toISOString().split('T')[0]} className={`w-full p-3 rounded-xl border ${errors.manufacturingDate ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                  {errors.manufacturingDate && <p className="text-danger text-xs mt-1">{errors.manufacturingDate}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date (Optional)</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} min={formData.manufacturingDate} className={`w-full p-3 rounded-xl border ${errors.expiryDate ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                  {errors.expiryDate && <p className="text-danger text-xs mt-1">{errors.expiryDate}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Country of Origin <span className="text-danger">*</span></label>
                  <select name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.countryOfOrigin ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`}>
                    <option value="">Select Country...</option>
                    <option value="United States">United States</option>
                    <option value="China">China</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="India">India</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Manufacturer Info & Image */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center">3</span> 
                Manufacturer & Assets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Manufacturer Name <span className="text-danger">*</span></label>
                  <input type="text" name="manufacturerName" value={formData.manufacturerName} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.manufacturerName ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Manufacturer Company <span className="text-danger">*</span></label>
                  <input type="text" name="manufacturerCompany" value={formData.manufacturerCompany} onChange={handleChange} className={`w-full p-3 rounded-xl border ${errors.manufacturerCompany ? 'border-danger' : 'border-slate-200 dark:border-slate-600'} bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Warranty Period (Optional)</label>
                  <input type="text" name="warrantyPeriod" placeholder="e.g. 1 Year, 6 Months" value={formData.warrantyPeriod} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Additional Notes</label>
                  <input type="text" name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Product Image (Optional, max 5MB)</label>
                  <div className="mt-1 flex justify-center px-6 pt-8 pb-8 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-2xl hover:border-primary dark:hover:border-primary transition-colors bg-white dark:bg-slate-800 relative overflow-hidden group">
                    <div className="space-y-2 text-center relative z-10">
                      {imagePreview ? (
                        <div className="relative w-full max-w-sm h-48 mx-auto rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white font-medium flex items-center gap-2"><FiUploadCloud /> Replace Image</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                            <FiImage className="w-8 h-8" />
                          </div>
                          <div className="flex text-sm justify-center">
                            <span className="relative cursor-pointer bg-transparent rounded-md font-bold text-primary hover:text-secondary focus-within:outline-none">
                              <span>Upload a file</span>
                            </span>
                            <p className="pl-1 text-slate-500">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-400">PNG, JPG, WebP up to 5MB</p>
                        </>
                      )}
                    </div>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={handleImageChange} accept=".jpg,.jpeg,.png,.webp" />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Footer actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/manufacturer/products')}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="registration-form"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold transition-colors shadow-lg shadow-primary/30 flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>Register & Generate QR <FiArrowRight /></>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductRegistrationPage;
