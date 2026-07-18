import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiShield, FiXCircle, FiCheckCircle, FiBox, FiClock, FiMapPin, FiInfo, FiHash } from 'react-icons/fi';
import publicService from '../../services/publicService';

const VerificationPortal = () => {
  const { productId: initialId } = useParams();
  const navigate = useNavigate();
  
  const [searchId, setSearchId] = useState(initialId || '');
  const [result, setResult] = useState(null); // The API response data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleSearch = async (idToSearch = searchId) => {
    if (!idToSearch.trim()) return;
    
    // Update URL if searching manually
    if (idToSearch !== initialId) {
      navigate(`/verify/${idToSearch}`, { replace: true });
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
          Enter the unique Product ID found on your product's QR code to verify its cryptographic proof on the Stellar Blockchain.
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
          </motion.div>
        )}

        {!loading && result && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            
            {/* Status Header */}
            <div className={`p-8 text-center ${result.data.isAuthentic ? 'bg-gradient-to-b from-success/20 to-transparent' : 'bg-gradient-to-b from-yellow-500/20 to-transparent'}`}>
              {result.data.isAuthentic ? (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Verified Authentic</h2>
                  <p className="text-slate-600 dark:text-slate-300">{result.message}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-yellow-500/20 text-yellow-600 rounded-full flex items-center justify-center mb-4">
                    <FiShield className="w-10 h-10" />
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Pending Blockchain</h2>
                  <p className="text-slate-600 dark:text-slate-300">{result.message}</p>
                </div>
              )}
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Product Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-slate-100 dark:bg-slate-700 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-600">
                    {result.data.product.productImage ? (
                      <img src={`http://localhost:5000${result.data.product.productImage}`} alt="Product" className="w-full h-full object-cover" />
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
                      <p className="font-mono text-[10px] text-slate-400 break-all"><span className="text-success">Chain:</span> {result.data.blockchain.stellarHash}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 space-y-3 relative z-10">
                    <FiClock className="w-8 h-8" />
                    <p className="text-sm text-center">This product's data has not been published to the Stellar network yet.</p>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </div>

    </div>
  );
};

export default VerificationPortal;
