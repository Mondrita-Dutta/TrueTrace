import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBox, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiChevronLeft, FiChevronRight, FiCheckSquare, FiSquare, FiAlertCircle, FiDownload, FiCopy, FiArchive } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import EmptyState from '../../components/dashboard/EmptyState';
import { TableSkeleton } from '../../components/dashboard/LoadingSkeleton';

import productService from '../../services/productService';
import DeleteConfirmModal from '../../components/dashboard/products/DeleteConfirmModal';

const ProductsPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination, Filters, Sorting
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Modals state
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

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

  const handleDelete = async () => {
    try {
      setIsActionLoading(true);
      const ids = modalData?.isBulk ? selectedIds.join(',') : modalData._id;
      await productService.deleteProducts(ids);
      toast.success(modalData?.isBulk ? 'Products deleted' : 'Product deleted');
      setIsDeleteOpen(false);
      setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete product');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkStatusUpdate = async (status) => {
    try {
      await productService.bulkUpdateProducts(selectedIds, { status });
      toast.success(`Products marked as ${status}`);
      setSelectedIds([]);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to update products');
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

  return (
    <div className="space-y-6 h-full flex flex-col">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <Breadcrumbs />
        <button 
          onClick={() => navigate('/manufacturer/products/new')}
          className="bg-primary hover:bg-secondary text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center gap-2"
        >
          <FiBox /> Register Product
        </button>
      </div>

      <div className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col xl:flex-row gap-4 items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          
          {/* Search */}
          <div className="relative w-full xl:max-w-md">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, brand, batch or serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-200 outline-none transition-all"
            />
          </div>

          {/* Filters, Sorting & Bulk Actions */}
          <div className="flex w-full xl:w-auto items-center gap-3 overflow-x-auto pb-2 xl:pb-0 custom-scrollbar">
            <AnimatePresence>
              {selectedIds.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="flex items-center gap-2 bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/20 shrink-0"
                >
                  <span className="text-sm font-medium text-primary mr-2">{selectedIds.length} selected</span>
                  <button onClick={() => handleBulkStatusUpdate('Archived')} className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-lg shadow-sm text-slate-700 dark:text-slate-300 hover:text-primary transition-colors flex items-center gap-1"><FiArchive /> Archive</button>
                  <button onClick={() => { setModalData({ isBulk: true }); setIsDeleteOpen(true); }} className="text-xs bg-red-100 dark:bg-red-900/40 px-2 py-1 rounded-lg shadow-sm text-danger hover:bg-red-200 transition-colors flex items-center gap-1"><FiTrash2 /> Delete</button>
                </motion.div>
              )}
            </AnimatePresence>

            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="py-2 pl-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
            >
              <option value="">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Pharmaceuticals">Pharmaceuticals</option>
              <option value="Luxury Goods">Luxury Goods</option>
              <option value="Apparel">Apparel</option>
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
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <button onClick={() => toggleSelectOne(product._id)} className="text-slate-400 hover:text-primary transition-colors outline-none focus:ring-2 focus:ring-primary rounded">
                        {selectedIds.includes(product._id) ? <FiCheckSquare className="w-5 h-5 text-primary" /> : <FiSquare className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center shrink-0">
                          {product.productImage ? (
                            <img src={`http://localhost:5000${product.productImage}`} alt={product.productName} className="w-full h-full object-cover" loading="lazy" />
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
                          <img src={`http://localhost:5000${product.qrImageUrl}`} alt="QR" className="w-8 h-8" />
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {product.qrImageUrl && (
                          <a href={`http://localhost:5000${product.qrImageUrl}`} download={`QR-${product.productId}.png`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors" title="Download QR">
                            <FiDownload />
                          </a>
                        )}
                        <button onClick={() => navigate(`/manufacturer/products/${product._id}`)} className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors" title="View Details">
                          <FiEye />
                        </button>
                        <button onClick={() => { setModalData(product); setIsDeleteOpen(true); }} className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
