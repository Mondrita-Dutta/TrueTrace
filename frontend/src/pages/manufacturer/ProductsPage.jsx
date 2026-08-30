import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiChevronLeft, FiChevronRight, FiCheckSquare, FiSquare, FiAlertCircle, FiDownload, FiCopy, FiArchive, FiList, FiLayers, FiLink } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';
import { TableSkeleton } from '../../components/dashboard/LoadingSkeleton';
import ExportButtons from '../../components/ui/ExportButtons';
import { useAuth } from '../../context/AuthContext';
import { useSearch } from '../../context/SearchContext';

import productService from '../../services/productService';
import DeleteConfirmModal from '../../components/dashboard/products/DeleteConfirmModal';
import { connectFreighter, signXLMTransaction } from '../../utils/freighterUtils';
import { buildRegisterProductTx, submitSorobanTransaction } from '../../services/stellarService';

const ProductsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination, Filters, Sorting
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const { searchQuery: globalSearchQuery } = useSearch();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const searchQuery = globalSearchQuery || localSearchQuery;
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // View Mode
  const [viewMode, setViewMode] = useState('batch'); // 'flat' or 'batch'

  // Modals state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await productService.getProductCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    loadCategories();
  }, []);

  const fetchProducts = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const res = await productService.getProducts({
        page,
        limit: pagination.limit,
        search: searchQuery,
        category: categoryFilter,
        status: statusFilter,
        sortBy,
        sortOrder
      });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter, sortBy, sortOrder, pagination.limit]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, sortOrder]);

  const handleRegisterClick = () => {
    const isProfileComplete = user?.companyName && user?.companyAddress && user?.businessRegistrationNumber && user?.licenseNumber;
    if (!isProfileComplete) {
      navigate('/manufacturer/profile', { state: { incompleteProfile: true } });
    } else {
      navigate('/manufacturer/products/new');
    }
  };

  const handleDelete = async () => {
    try {
      setIsActionLoading(true);
      const ids = modalData?.batchIds ? modalData.batchIds.join(',') : (modalData?.isBulk ? selectedIds.join(',') : modalData._id);
      await productService.deleteProducts(ids);
      toast.success(modalData?.isBulk || modalData?.batchIds ? 'Products deleted' : 'Product deleted');
      setIsDeleteOpen(false);
      setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status, specificIds = null) => {
    try {
      const idsToUpdate = specificIds || selectedIds;
      await productService.bulkUpdateProducts(idsToUpdate, { status });
      toast.success(`Products marked as ${status}`);
      if (!specificIds) setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update products');
    }
  };

  const handleBulkPublish = async (specificIds = null) => {
    try {
      setIsActionLoading(true);
      const idsToPublish = specificIds && Array.isArray(specificIds) ? specificIds : selectedIds;
      
      const productsToPublish = products.filter(p => idsToPublish.includes(p._id) && p.blockchainStatus !== 'Verified');
      if (productsToPublish.length === 0) {
        toast.info('Selected products are already published or invalid');
        return;
      }
      if (productsToPublish.length > 100) {
        throw new Error('You can only publish a maximum of 100 products at a time (Blockchain transaction limit)');
      }

      toast.info('Connecting to Freighter wallet...');
      const address = await connectFreighter();
      if (!address) throw new Error("Wallet not connected");

      // Verify wallet
      if (user?.walletAddress && address !== user.walletAddress) {
        throw new Error(`Please connect with your registered wallet address: ${user.walletAddress}`);
      }

      toast.info(`Note: Soroban currently requires individual signatures. Please sign for each product (${productsToPublish.length} total).`, { autoClose: 5000 });
      
      let successCount = 0;
      for (let i = 0; i < productsToPublish.length; i++) {
        const product = productsToPublish[i];
        try {
          toast.info(`Signing ${i + 1} of ${productsToPublish.length}...`);
          const xdr = await buildRegisterProductTx(address, product.productId, product.blockchainHash);
          const signedXdr = await signXLMTransaction(xdr, address);
          
          toast.info(`Submitting ${i + 1} of ${productsToPublish.length}...`);
          const submitRes = await submitSorobanTransaction(signedXdr);
          
          if (!submitRes.success) {
            toast.error(`Transaction failed for ${product.productName}`);
            continue;
          }

          await productService.markBatchAsPublishedSoroban([product._id], submitRes.hash);
          successCount++;
        } catch (err) {
          console.error("Publishing error for product", product._id, err);
          toast.error(`Failed to publish ${product.productName}`);
          if (err.message && err.message.toLowerCase().includes('declined')) {
            toast.info('Publishing stopped because signature was declined.');
            break;
          }
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully published ${successCount} products`);
      }
      
      if (!specificIds || !Array.isArray(specificIds)) setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to publish products');
    } finally {
      setIsActionLoading(false);
    }
  };

  const toggleBatchSelect = (batchIds) => {
    const allSelected = batchIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !batchIds.includes(id)));
    } else {
      const newIds = [...selectedIds];
      batchIds.forEach(id => {
        if (!newIds.includes(id)) newIds.push(id);
      });
      setSelectedIds(newIds);
    }
  };

  // Selection logic
  const toggleSelectAll = () => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map(p => p._id));
    }
  };

  const toggleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(itemId => itemId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const statusColors = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Pending Blockchain': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Verified': 'bg-success/10 text-success border-success/20',
    'Inactive': 'bg-slate-100 text-slate-600',
    'Archived': 'bg-slate-200 text-slate-700'
  };

  // Grouping Logic
  const groupedProducts = products.reduce((acc, p) => {
    const batch = p.batchNumber || 'No Batch';
    if (!acc[batch]) acc[batch] = [];
    acc[batch].push(p);
    return acc;
  }, {});

  const exportColumns = [
    { label: 'Date', key: 'createdAt' },
    { label: 'Product ID', key: 'productId' },
    { label: 'Name', key: 'productName' },
    { label: 'Brand', key: 'brandName' },
    { label: 'Category', key: 'category' },
    { label: 'Batch', key: 'batchNumber' },
    { label: 'Serial', key: 'serialNumber' },
    { label: 'Status', key: 'status' }
  ];

  const exportData = products.map(p => ({
    ...p,
    createdAt: new Date(p.createdAt).toLocaleString(),
  }));

  const renderProductRow = (product, isGrouped = false) => (
    <tr key={product._id} className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group ${isGrouped ? 'bg-white dark:bg-slate-800' : ''}`}>
      <td className={`px-6 py-4 ${isGrouped ? 'pl-10' : ''}`}>
        <button onClick={() => toggleSelectOne(product._id)} className="text-slate-400 hover:text-primary transition-colors outline-none focus:ring-2 focus:ring-primary rounded">
          {selectedIds.includes(product._id) ? <FiCheckSquare className="w-5 h-5 text-primary" /> : <FiSquare className="w-5 h-5" />}
        </button>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
            {product.productImage ? (
              <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${product.productImage}`} alt={product.productName} className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <FiBox className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white line-clamp-1">{product.productName}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{product.brandName}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-mono font-semibold text-primary">{product.productId || 'N/A'}</p>
        <p className="text-xs text-slate-500">{new Date(product.createdAt).toLocaleDateString()}</p>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{product.category}</p>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border ${statusColors[product.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
          {product.status}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {product.qrImageUrl ? (
          <div className="inline-block p-1 bg-white border border-slate-200 rounded-lg shadow-sm group-hover:border-primary transition-colors">
            <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${product.qrImageUrl}`} alt="QR" className="w-8 h-8" />
          </div>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
          {product.qrImageUrl && (
            <a href="#" onClick={(e) => handleDownloadQR(e, `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${product.qrImageUrl}`, `QR-${product.productId}.png`)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Download QR">
                <FiDownload />
              </a>
          )}
          <button onClick={() => navigate(`/manufacturer/products/${product._id}`)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
            <FiEye />
          </button>
          {!isGrouped && (
            <button onClick={() => { setModalData(product); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
              <FiTrash2 />
            </button>
          )}
        </div>
      </td>
    </tr>
  );

  const handleDownloadQR = async (e, url, filename) => {
    e.preventDefault();
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download QR code');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <Breadcrumbs />
        <div className="flex items-center gap-3">
          {products.length > 0 && (
            <ExportButtons 
              data={exportData}
              filename="products_export"
              pdfTitle="Product List"
              columns={exportColumns}
            />
          )}
          <button 
            onClick={handleRegisterClick}
            className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
          >
            <FiBox /> Register Product
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          
          {/* Search */}
          <div className="relative w-full xl:max-w-md flex items-center gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by name, brand, batch or serial..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Filters, Sorting & Bulk Actions */}
          <div className="flex w-full xl:w-auto items-center gap-3 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl shrink-0 border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('batch')} 
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'batch' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                title="Group by Batch"
              >
                <FiLayers className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('flat')} 
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'flat' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="flex items-center gap-2.5 bg-primary/10 dark:bg-primary/20 p-2 rounded-xl border border-primary/20 shrink-0"
                >
                  <span className="text-sm font-bold text-primary mx-2">{selectedIds.length} selected</span>
                  <button onClick={handleBulkPublish} className="text-sm font-semibold bg-white dark:bg-slate-800 px-3.5 py-2 rounded-lg shadow-sm text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiLink /> Publish</button>
                  <button onClick={() => handleBulkStatusUpdate('Archived')} className="text-sm font-semibold bg-white dark:bg-slate-800 px-3.5 py-2 rounded-lg shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiArchive /> Archive</button>
                  <button onClick={() => { setModalData({ isBulk: true }); setIsDeleteOpen(true); }} className="text-sm font-semibold bg-red-100 dark:bg-red-900/40 px-3.5 py-2 rounded-lg shadow-sm text-danger hover:bg-danger hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiTrash2 /> Delete</button>
                </motion.div>
              )}
            </AnimatePresence>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <option value="">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Pending Blockchain">Pending Blockchain</option>
              <option value="Verified">Verified</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </select>

            <div className="flex items-center gap-2 shrink-0 border-l border-slate-200 dark:border-slate-700 pl-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              >
                <option value="createdAt">Date</option>
                <option value="productName">Name</option>
                <option value="category">Category</option>
              </select>
              <select 
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 text-sm"
              >
                <option value="desc">Desc</option>
                <option value="asc">Asc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto relative">
          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} />
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <FiAlertCircle className="w-12 h-12 text-danger mb-4" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
              <button onClick={() => fetchProducts(1)} className="px-6 py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-secondary">
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="h-full flex items-center justify-center p-6">
              <EmptyState 
                icon={FiBox}
                title={searchQuery || categoryFilter || statusFilter ? "No matches found" : "No Products Found"}
                description={searchQuery || categoryFilter || statusFilter ? "Try adjusting your filters or search query." : "You haven't registered any products yet. Register your first product to generate a verifiable QR code."}
                actionText={searchQuery || categoryFilter || statusFilter ? "Clear Filters" : "Register Product"}
                onAction={() => {
                  if (searchQuery || categoryFilter || statusFilter) {
                    setSearchQuery(''); setCategoryFilter(''); setStatusFilter('');
                  } else {
                    navigate('/manufacturer/products/new');
                  }
                }}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold w-12">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary transition-colors outline-none focus:ring-2 focus:ring-primary rounded">
                      {selectedIds.length === products.length && products.length > 0 ? <FiCheckSquare className="w-5 h-5 text-primary" /> : <FiSquare className="w-5 h-5" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Product ID</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-center">QR</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {viewMode === 'flat' ? (
                  products.map(product => renderProductRow(product, false))
                ) : (
                  Object.keys(groupedProducts).map(batch => (
                    <React.Fragment key={batch}>
                      <tr className="bg-slate-100/80 dark:bg-slate-700/80 border-t-4 border-white dark:border-slate-800">
                        <td className="px-6 py-3">
                           <button onClick={() => toggleBatchSelect(groupedProducts[batch].map(p=>p._id))} className="text-slate-400 hover:text-primary transition-colors outline-none focus:ring-2 focus:ring-primary rounded">
                             {groupedProducts[batch].every(p => selectedIds.includes(p._id)) ? <FiCheckSquare className="w-5 h-5 text-primary" /> : <FiSquare className="w-5 h-5" />}
                           </button>
                        </td>
                        <td colSpan="3" className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            <FiLayers className="text-primary" />
                            <span className="font-bold text-slate-800 dark:text-slate-200 tracking-wide uppercase text-sm">
                              Batch: {batch}
                            </span>
                            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full ml-2">
                              {groupedProducts[batch].length} items
                            </span>
                          </div>
                        </td>
                        <td colSpan="3" className="px-6 py-3 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleBulkPublish(groupedProducts[batch].map(p=>p._id))} className="text-sm font-semibold bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm text-slate-700 dark:text-slate-200 hover:bg-primary hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiLink /> Publish</button>
                              <button onClick={() => handleBulkStatusUpdate('Archived', groupedProducts[batch].map(p=>p._id))} className="text-sm font-semibold bg-white dark:bg-slate-800 px-3.5 py-1.5 rounded-lg shadow-sm text-slate-700 dark:text-slate-200 hover:bg-slate-600 dark:hover:bg-slate-600 hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiArchive /> Archive</button>
                              <button onClick={() => { setModalData({ isBulk: true, batchIds: groupedProducts[batch].map(p=>p._id) }); setIsDeleteOpen(true); }} className="text-sm font-semibold bg-red-100 dark:bg-red-900/40 px-3.5 py-1.5 rounded-lg shadow-sm text-danger hover:bg-danger hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-1.5"><FiTrash2 /> Delete</button>
                           </div>
                        </td>
                      </tr>
                      {groupedProducts[batch].map(product => renderProductRow(product, true))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && products.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/20 text-sm text-slate-500 dark:text-slate-400">
            <div>
              Showing <span className="font-medium text-slate-900 dark:text-slate-200">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{pagination.total}</span> products
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              
              <span className="px-3 font-medium text-slate-700 dark:text-slate-300">Page {pagination.page} of {pagination.pages}</span>
              
              <button 
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <DeleteConfirmModal 
        isOpen={isDeleteOpen} 
        onClose={() => setIsDeleteOpen(false)} 
        onConfirm={handleDelete}
        isLoading={isActionLoading}
        title={modalData?.isBulk ? "Delete Multiple Products" : "Delete Product"}
        message={modalData?.isBulk ? `Are you sure you want to permanently delete ${selectedIds.length} products?` : `Are you sure you want to permanently delete "${modalData?.productName}"?`}
      />

    </div>
  );
};

export default ProductsPage;
