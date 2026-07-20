import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiPackage, FiMaximize, FiShield, FiHash, FiClock, FiInfo, FiCalendar, FiMapPin, FiPrinter, FiDownload, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import productService from '../../services/productService';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        setProduct(res.data);
      } catch (err) {
        toast.error('Failed to load product details');
        navigate('/manufacturer/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handlePrintQR = () => {
    if (!product?.qrImageUrl) return;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>Print QR Code - ${product.productId}</title></head>
        <body style="text-align: center; font-family: sans-serif; padding: 50px;">
          <h2>Product ID: ${product.productId}</h2>
          <img src="http://localhost:5000${product.qrImageUrl}" style="width: 300px; height: 300px; margin: 20px 0;" />
          <p>${product.productName} by ${product.brandName}</p>
          <script>window.onload = function() { window.print(); window.close(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePublishToBlockchain = async () => {
    try {
      setIsPublishing(true);
      const res = await productService.publishToBlockchain(product._id);
      toast.success('Successfully published to Stellar Blockchain!');
      setProduct(res.data); // Update with new Tx Hash and status
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish to blockchain');
    } finally {
      setIsPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!product) return null;

  const statusColors = {
    'Draft': 'bg-slate-100 text-slate-600',
    'Pending Blockchain': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Verified': 'bg-success/10 text-success border-success/20',
    'Inactive': 'bg-slate-100 text-slate-600',
    'Archived': 'bg-slate-200 text-slate-700'
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/manufacturer/products')}
          className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
          <FiChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <Breadcrumbs />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar h-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* Left Column - Image & QR */}
            <div className="space-y-6">
              
              {/* Product Image */}
              <div className="aspect-square rounded-3xl border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center relative group">
                {product.productImage ? (
                  <img 
                    src={`http://localhost:5000${product.productImage}`} 
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiPackage className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-full text-white transition-colors">
                    <FiMaximize className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm flex flex-col items-center">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-4">
                  <FiHash className="text-primary" /> Anti-Counterfeit QR
                </h4>
                {product.qrImageUrl ? (
                  <>
                    <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm mb-4">
                      <img src={`http://localhost:5000${product.qrImageUrl}`} alt="QR Code" className="w-40 h-40" />
                    </div>
                    <div className="flex w-full gap-2">
                      <a 
                        href={`http://localhost:5000${product.qrImageUrl}`}
                        download={`QR-${product.productId}.png`}
                        className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                      >
                        <FiDownload /> Download
                      </a>
                      <button 
                        onClick={handlePrintQR}
                        className="flex-1 py-2 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl text-slate-700 dark:text-slate-200 text-sm font-medium transition-colors"
                      >
                        <FiPrinter /> Print
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">QR Code not generated.</p>
                )}
              </div>

            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Header */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${statusColors[product.status] || 'bg-slate-100 text-slate-600'}`}>
                    {product.status}
                  </span>
                  
                  {product.blockchainStatus === 'Verified' ? (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-success/10 text-success border-success/20 flex items-center gap-1 shadow-sm">
                      <FiShield /> Blockchain Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1">
                      <FiClock /> Pending Blockchain
                    </span>
                  )}
                  
                  <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
                    <FiClock className="w-4 h-4" /> Registered {formatDate(product.createdAt)}
                  </span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {product.productName}
                </h1>
                <p className="text-xl text-primary font-bold">{product.brandName}</p>
                
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-100 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                    <span className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Product ID</span>
                    <span className="text-lg font-mono font-bold text-slate-900 dark:text-white">{product.productId}</span>
                  </div>

                  {product.blockchainStatus !== 'Verified' && (
                    <button 
                      onClick={handlePublishToBlockchain}
                      disabled={isPublishing}
                      className="px-6 py-2.5 bg-primary hover:bg-secondary text-white font-bold rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                    >
                      {isPublishing ? 'Publishing...' : 'Publish to Blockchain'}
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FiInfo className="text-primary" /> Description
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 text-lg">
                  {product.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Identifiers */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-700 pb-2">
                    <FiPackage className="text-primary" /> Product Details
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Category</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200 text-lg">{product.category}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Batch Number</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg inline-block border border-slate-200 dark:border-slate-600">{product.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Serial Number</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200 font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-lg inline-block border border-slate-200 dark:border-slate-600">{product.serialNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Manufacturing & Logistics */}
                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 border-b-2 border-slate-100 dark:border-slate-700 pb-2">
                    <FiCalendar className="text-primary" /> Manufacturing
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Manufacturer</p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{product.manufacturerName} ({product.manufacturerCompany})</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Mfg Date</p>
                        <p className="font-medium text-slate-900 dark:text-slate-200">{formatDate(product.manufacturingDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Expiry Date</p>
                        <p className="font-medium text-slate-900 dark:text-slate-200">{formatDate(product.expiryDate)}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                        <FiMapPin /> Country of Origin
                      </p>
                      <p className="font-medium text-slate-900 dark:text-slate-200">{product.countryOfOrigin}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(product.warrantyPeriod || product.additionalNotes) && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 mb-4">
                    <FiAlertCircle className="text-primary" /> Additional Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {product.warrantyPeriod && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Warranty Period</p>
                        <p className="font-medium text-slate-900 dark:text-slate-200">{product.warrantyPeriod}</p>
                      </div>
                    )}
                    {product.additionalNotes && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Notes</p>
                        <p className="font-medium text-slate-900 dark:text-slate-200">{product.additionalNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blockchain Record Details */}
              {product.transactionHash && (
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700">
                  <h4 className="text-sm font-bold text-success uppercase tracking-wider flex items-center gap-2 mb-4">
                    <FiShield /> Immutable Blockchain Record
                  </h4>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Transaction Hash</p>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${product.transactionHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm text-primary hover:underline break-all"
                      >
                        {product.transactionHash}
                      </a>
                    </div>
                    {product.ledgerNumber && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Ledger Sequence</p>
                        <p className="font-mono text-sm text-slate-700 dark:text-slate-300">{product.ledgerNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailsPage;
