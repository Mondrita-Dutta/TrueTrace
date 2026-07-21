import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiXCircle, FiCheckCircle, FiBox, FiClock, FiMapPin, FiInfo, FiHash, FiAlertTriangle, FiCamera, FiDownload } from 'react-icons/fi';
import publicService from '../../services/publicService';
import Button from '../../components/ui/Button';
import ReportCounterfeitModal from '../../components/ui/ReportCounterfeitModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

const VerificationPortal = () => {
  const { productId: initialId } = useParams();
  const navigate = useNavigate();
  
  const [searchId, setSearchId] = useState(initialId || '');
  const [result, setResult] = useState(null); // The API response data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const certificateRef = useRef(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const downloadCertificate = () => {
    if (!result || !result.data || !result.data.product) return;
    
    const doc = new jsPDF();
    const product = result.data.product;
    const blockchain = result.data.blockchain;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text('TrueTrace Authenticity Certificate', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    
    // Status
    doc.setFontSize(16);
    if (result.data.isAuthentic) {
      doc.setTextColor(16, 185, 129); // Tailwind Success Green
      doc.text('Status: VERIFIED AUTHENTIC', 14, 42);
    } else if (!result.data.blockchain) {
      doc.setTextColor(245, 158, 11); // Tailwind Warning Yellow
      doc.text('Status: PENDING BLOCKCHAIN', 14, 42);
    } else {
      doc.setTextColor(239, 68, 68); // Tailwind Danger Red
      doc.text('Status: FAKE PRODUCT DETECTED', 14, 42);
    }
    
    // Product Details Table
    autoTable(doc, {
      startY: 50,
      head: [['Product Information', 'Details']],
      body: [
        ['Product ID', product.productId || 'N/A'],
        ['Product Name', product.productName || 'N/A'],
        ['Brand Name', product.brandName || 'N/A'],
        ['Manufacturer', product.manufacturerName || 'N/A'],
        ['Batch Number', product.batchNumber || 'N/A'],
        ['Serial Number', product.serialNumber || 'N/A'],
        ['Manufacturing Date', product.manufacturingDate ? new Date(product.manufacturingDate).toLocaleDateString() : 'N/A'],
        ['Expiry Date', product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'],
        ['Origin', product.countryOfOrigin || 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }, // Dark slate
    });
    
    // Blockchain Details Table
    if (blockchain) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Cryptographic Proof', 'Data']],
        body: [
          ['Transaction Hash', blockchain.txHash || 'N/A'],
          ['Ledger ID', blockchain.ledger?.toString() || 'N/A'],
          ['Timestamp', new Date(blockchain.timestamp).toLocaleString() || 'N/A'],
          ['Hash Verification', result.data.isAuthentic ? 'Match' : 'Mismatch']
        ],
        theme: 'grid',
        headStyles: { fillColor: [51, 65, 85] },
        columnStyles: {
          1: { cellWidth: 120 } // Ensure hash doesn't overflow wildly
        }
      });
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('This document mathematically proves the authenticity of the product using the Stellar Blockchain.', 14, doc.internal.pageSize.height - 10);
    
    doc.save(`TrueTrace_Certificate_${product.productId || 'Product'}.pdf`);
  };

  const handleSearch = async (idToSearch = searchId) => {
    if (!idToSearch.trim()) return;
    
    // Update URL if searching manually
    if (idToSearch !== initialId) {
      navigate(`/verify/${encodeURIComponent(idToSearch)}`, { replace: true });
    }

    try {
      setLoading(true);
      setError(null);
      setResult(null);
      const res = await publicService.verifyProduct(idToSearch);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify product.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      {/* Header Search Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl text-center mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
          Verify Product Authenticity
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
          Enter the unique Product ID found on your product's QR code or scan the QR code to verify its cryptographic proof on the Stellar Blockchain.
        </p>
        
        <div className="relative max-w-xl mx-auto shadow-2xl rounded-2xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-white dark:bg-slate-800 p-2 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
            <FiSearch className="text-slate-400 w-6 h-6 ml-4" />
            <input 
              type="text" 
              placeholder="e.g. TT-2026-000001"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none px-4 py-3 text-lg outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <button 
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-primary hover:bg-secondary text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-4 text-slate-500 dark:text-slate-400">
          <div className="h-px bg-slate-200 dark:bg-slate-700 w-16"></div>
          <span className="text-sm font-medium uppercase tracking-wider">OR</span>
          <div className="h-px bg-slate-200 dark:bg-slate-700 w-16"></div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link 
            to="/scan"
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:text-primary dark:hover:text-primary rounded-xl transition-all shadow-sm hover:shadow-md font-medium"
          >
            <FiCamera className="w-5 h-5" />
            Scan QR Code Instead
          </Link>
        </div>
      </motion.div>

      {/* Results Section */}
      <div className="w-full max-w-4xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <svg className="animate-spin h-12 w-12 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">Querying the Stellar Blockchain...</p>
          </div>
        )}

        {!loading && error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-3xl p-8 text-center shadow-xl">
            <FiXCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-danger font-medium">{error}</p>
            <div className="mt-6">
              <Button variant="danger" onClick={() => setIsReportModalOpen(true)}>
                <FiAlertTriangle className="mr-2 inline" /> Report Suspicious Product
              </Button>
            </div>
          </motion.div>
        )}

        {!loading && result && (
          <motion.div ref={certificateRef} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
            
            {result.data.isAuthentic && (
              <button 
                onClick={downloadCertificate}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 dark:bg-slate-900/40 dark:hover:bg-slate-900/60 text-slate-800 dark:text-white rounded-lg text-sm font-medium transition-colors backdrop-blur-sm border border-white/30 dark:border-slate-700/50"
                title="Download Certificate"
              >
                <FiDownload /> Download
              </button>
            )}
            {/* Status Header */}
            <div className={`p-8 text-center ${result.data.isAuthentic ? 'bg-gradient-to-b from-success/20 to-transparent' : (!result.data.blockchain ? 'bg-gradient-to-b from-yellow-500/20 to-transparent' : 'bg-gradient-to-b from-danger/20 to-transparent')}`}>
              {result.data.isAuthentic ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verified Authentic</h2>
                  <p className="text-slate-600 dark:text-slate-300">{result.message}</p>
                </div>
              ) : !result.data.blockchain ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                    <FiShield className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pending Blockchain</h2>
                  <p className="text-slate-600 dark:text-slate-300">{result.message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-danger/20 text-danger rounded-full flex items-center justify-center mb-4">
                    <FiXCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-danger mb-2">Fake Product Detected</h2>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{result.message}</p>
                  <Button variant="danger" onClick={() => setIsReportModalOpen(true)}>
                    <FiAlertTriangle className="mr-2 inline" /> Report Suspicious Product
                  </Button>
                </div>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Product Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                    {result.data.product.productImage ? (
                      <img src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${result.data.product.productImage}`} crossOrigin="anonymous" alt="Product" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400"><FiBox className="w-8 h-8" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{result.data.product.productName}</h3>
                    <p className="text-primary font-bold text-lg">{result.data.product.brandName}</p>
                    <p className="text-sm text-slate-500 font-mono mt-1">ID: {result.data.product.productId}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
                    <FiInfo className="text-primary" /> Manufacturing Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-slate-500">Batch Number</p>
                      <p className="font-mono font-medium text-slate-900 dark:text-white">{result.data.product.batchNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Serial Number</p>
                      <p className="font-mono font-medium text-slate-900 dark:text-white">{result.data.product.serialNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Mfg Date</p>
                      <p className="font-medium text-slate-900 dark:text-white">{new Date(result.data.product.manufacturingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Origin</p>
                      <p className="font-medium text-slate-900 dark:text-white flex items-center gap-1"><FiMapPin /> {result.data.product.countryOfOrigin}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Proof */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl border border-slate-700">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
                <h4 className="font-bold text-lg mb-6 flex items-center gap-2 relative z-10">
                  <FiHash className="text-primary" /> Cryptographic Proof
                </h4>
                
                {result.data.blockchain ? (
                  <div className="space-y-5 relative z-10">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Stellar Ledger</p>
                      <p className="font-mono text-lg text-success">{result.data.blockchain.ledger}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Transaction Hash</p>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${result.data.blockchain.txHash}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-mono text-xs text-blue-400 hover:text-blue-300 break-all hover:underline"
                      >
                        {result.data.blockchain.txHash}
                      </a>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Timestamp</p>
                      <p className="font-mono text-sm text-slate-300 flex items-center gap-2">
                        <FiClock /> {new Date(result.data.blockchain.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 mt-2 backdrop-blur-sm border border-white/10">
                      <p className="text-xs text-slate-300 mb-2">Hash Verification Match:</p>
                      <p className="font-mono text-[10px] text-slate-400 break-all"><span className="text-primary">Local:</span> {result.data.blockchain.localHash}</p>
                      <p className="font-mono text-[10px] text-slate-400 break-all"><span className={result.data.isAuthentic ? 'text-success' : 'text-danger'}>Chain:</span> {result.data.blockchain.stellarHash}</p>
                    </div>
                    
                    <a 
                      href={`https://stellar.expert/explorer/testnet/tx/${result.data.blockchain.txHash}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="mt-4 block w-full text-center bg-white/10 hover:bg-white/20 text-white font-medium py-2 rounded-xl border border-white/20 transition-colors"
                    >
                      View on Stellar Expert
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-3 relative z-10">
                    <FiClock className="w-8 h-8" />
                    <p className="text-sm text-center">This product's data has not been published to the Stellar network yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Timeline */}
            <div className="p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm flex items-center gap-2 mb-6">
                <FiClock className="text-primary" /> Lifecycle Timeline
              </h4>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                <div className="space-y-6">
                  {/* Step 1: Registered */}
                  <div className="relative pl-10">
                    <div className="absolute left-2 top-1.5 w-4 h-4 bg-primary rounded-full border-4 border-slate-50 dark:border-slate-900"></div>
                    <p className="font-bold text-slate-900 dark:text-white">Product Registered</p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(result.data.product.createdAt).toLocaleString()}</p>
                  </div>
                  {/* Step 2: Blockchain Stored */}
                  <div className="relative pl-10">
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${result.data.blockchain ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <p className={`font-bold ${result.data.blockchain ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Blockchain Stored</p>
                    {result.data.blockchain && (
                      <p className="text-xs text-slate-500 mt-1">{new Date(result.data.blockchain.timestamp).toLocaleString()}</p>
                    )}
                  </div>
                  {/* Step 3: QR Generated */}
                  <div className="relative pl-10">
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${result.data.product.qrImageUrl ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}></div>
                    <p className={`font-bold ${result.data.product.qrImageUrl ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>QR Code Generated</p>
                    {result.data.product.qrImageUrl && (
                      <p className="text-xs text-slate-500 mt-1">{new Date(result.data.product.createdAt).toLocaleString()}</p>
                    )}
                  </div>
                  {/* Step 4: Verified */}
                  <div className="relative pl-10">
                    <div className={`absolute left-2 top-1.5 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-slate-900 ${result.data.isAuthentic ? 'bg-success' : (result.data.blockchain ? 'bg-danger' : 'bg-slate-300 dark:bg-slate-700')}`}></div>
                    <p className={`font-bold ${result.data.isAuthentic ? 'text-success' : (result.data.blockchain ? 'text-danger' : 'text-slate-400')}`}>
                      {result.data.isAuthentic ? 'Product Verified Authentic' : (result.data.blockchain ? 'Verification Failed (Tampered)' : 'Pending Verification')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Current Scan: {new Date().toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </div>

      <ReportCounterfeitModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        productId={result?.data?.product?.productId || searchId}
        productName={result?.data?.product?.productName || 'Unknown Product'}
      />
    </div>
  );
};

export default VerificationPortal;
