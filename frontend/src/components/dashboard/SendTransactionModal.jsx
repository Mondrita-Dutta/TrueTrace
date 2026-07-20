import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSend, FiLoader, FiCheckCircle, FiAlertCircle, FiExternalLink } from 'react-icons/fi';
import { buildPaymentTransaction, submitTransaction } from '../../services/stellarService';
import { signXLMTransaction } from '../../utils/freighterUtils';
import { toast } from 'react-toastify';

const SendTransactionModal = ({ isOpen, onClose, walletAddress, onSuccess }) => {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle, building, signing, submitting, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    if (status === 'building' || status === 'signing' || status === 'submitting') return;
    setDestination('');
    setAmount('');
    setStatus('idle');
    setErrorMsg('');
    setTxHash('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!destination || !amount || isNaN(amount) || Number(amount) <= 0) {
      toast.error("Please enter a valid destination and amount.");
      return;
    }

    try {
      setErrorMsg('');
      
      // Step 1: Build XDR
      setStatus('building');
      const xdr = await buildPaymentTransaction(walletAddress, destination, amount);
      
      // Step 2: Request Signature
      setStatus('signing');
      const signedXdr = await signXLMTransaction(xdr);
      
      // Step 3: Submit to Network
      setStatus('submitting');
      const result = await submitTransaction(signedXdr);
      
      if (result.success) {
        setStatus('success');
        setTxHash(result.hash);
        toast.success("Transaction sent successfully!");
        if (onSuccess) onSuccess();
      } else {
        setStatus('error');
        setErrorMsg(result.error);
        toast.error("Transaction failed to submit.");
      }
    } catch (error) {
      setStatus('error');
      setErrorMsg(error.message || "An unexpected error occurred.");
      toast.error("Transaction failed.");
    }
  };

  const isWorking = status === 'building' || status === 'signing' || status === 'submitting';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md overflow-hidden relative"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Send XLM (Testnet)</h3>
              <button 
                onClick={handleClose}
                disabled={isWorking}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {status === 'success' ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                    <FiCheckCircle size={32} className="text-success" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Transaction Successful!</h4>
                  <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">
                    Your XLM has been sent on the Stellar Testnet.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl w-full border border-slate-100 dark:border-slate-700 mb-6">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Transaction Hash</p>
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate mr-2">
                        {txHash}
                      </span>
                      <a 
                        href={`https://stellar.expert/explorer/testnet/tx/${txHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-focus flex-shrink-0"
                      >
                        <FiExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-medium rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {status === 'error' && (
                    <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 flex items-start space-x-3">
                      <FiAlertCircle className="text-danger mt-0.5 flex-shrink-0" size={18} />
                      <div className="text-sm text-danger-content break-words overflow-hidden w-full">
                        <span className="font-semibold block mb-1">Transaction Failed</span>
                        {errorMsg}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Destination Address
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="G..."
                      disabled={isWorking}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-60"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Amount (XLM)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.0000001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={isWorking}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all disabled:opacity-60 pr-16"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <span className="text-slate-400 font-medium">XLM</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isWorking || !destination || !amount}
                      className={`w-full py-3.5 px-4 rounded-xl text-white font-medium flex items-center justify-center space-x-2 transition-all
                        ${isWorking 
                          ? 'bg-primary/70 cursor-not-allowed' 
                          : 'bg-primary hover:bg-primary-focus active:scale-[0.98] shadow-lg shadow-primary/25'
                        }`}
                    >
                      {isWorking ? (
                        <>
                          <FiLoader className="animate-spin" size={18} />
                          <span>
                            {status === 'building' && 'Building...'}
                            {status === 'signing' && 'Awaiting Signature...'}
                            {status === 'submitting' && 'Submitting...'}
                          </span>
                        </>
                      ) : (
                        <>
                          <FiSend size={18} />
                          <span>Send Transaction</span>
                        </>
                      )}
                    </button>
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

export default SendTransactionModal;
