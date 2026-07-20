import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSend, FiRefreshCw, FiExternalLink } from 'react-icons/fi';
import { fetchBalance } from '../../services/stellarService';

const WalletCard = ({ walletAddress, onSendClick }) => {
  const [balance, setBalance] = useState('Loading...');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBalance = async () => {
    if (!walletAddress) return;
    setIsRefreshing(true);
    try {
      const bal = await fetchBalance(walletAddress);
      setBalance(bal);
    } catch (error) {
      setBalance('Error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, [walletAddress]);

  if (!walletAddress) return null;

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 6)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-lg border border-indigo-500/30 text-white relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <p className="text-indigo-200 text-sm font-medium mb-1">Stellar Testnet Wallet</p>
          <div className="flex items-center space-x-2 bg-black/30 rounded-lg px-3 py-1 border border-white/10">
            <span className="font-mono text-sm tracking-wider text-indigo-100">{truncateAddress(walletAddress)}</span>
            <a 
              href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-indigo-300 hover:text-white transition-colors"
            >
              <FiExternalLink size={14} />
            </a>
          </div>
        </div>
        <button 
          onClick={loadBalance} 
          disabled={isRefreshing}
          className={`p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all ${isRefreshing ? 'animate-spin opacity-50' : ''}`}
        >
          <FiRefreshCw size={16} className="text-indigo-200" />
        </button>
      </div>

      <div className="mb-6 relative z-10">
        <h3 className="text-4xl font-bold tracking-tight text-white flex items-end">
          {balance !== 'Loading...' && balance !== 'Error' && !balance.includes('Unfunded') 
            ? parseFloat(balance).toFixed(2) 
            : balance.includes('Unfunded') ? '0.00' : balance}
          <span className="text-lg font-medium text-indigo-300 ml-2 mb-1">XLM</span>
        </h3>
        {balance.includes('Unfunded') && (
          <p className="text-xs text-orange-300 mt-1">
            Account unfunded. Use Friendbot on Stellar Laboratory.
          </p>
        )}
      </div>

      <button
        onClick={onSendClick}
        className="w-full py-3 px-4 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-medium rounded-xl flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-indigo-500/25 border border-indigo-400/50"
      >
        <FiSend size={18} />
        <span>Send XLM</span>
      </button>
    </motion.div>
  );
};

export default WalletCard;
