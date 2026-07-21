import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiSearch, FiAlertCircle, FiCamera } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, aspectRatio: 1.0 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        // Typically our QR code encodes an object or string.
        let productId = decodedText;
        try {
          const data = JSON.parse(decodedText);
          if (data.productId) productId = data.productId;
        } catch (e) {
          // not JSON, keep original
        }
        navigate(`/verify/${encodeURIComponent(productId)}`);
      },
      (errorMessage) => {
        // Ignore scan errors until success
      }
    );

    return () => {
      try {
        scanner.clear();
      } catch(err) {
        // ignore
      }
    };
  }, [navigate]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(`/verify/${encodeURIComponent(manualId.trim())}`);
    } else {
      setError('Please enter a valid Product ID');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <FiCamera className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Scan Product</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Point your camera at the TrueTrace QR code on the product packaging to verify its authenticity.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* QR Scanner Container */}
          <div className="p-4 bg-black/5 dark:bg-black/20">
            <div id="qr-reader" className="w-full rounded-2xl overflow-hidden [&_#qr-reader__dashboard_section_csr_span]:text-slate-700 [&_#qr-reader__dashboard_section_csr_span]:dark:text-slate-300 [&_#qr-reader__dashboard_section_swaplink]:text-primary [&_button]:bg-primary [&_button]:text-white [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-xl [&_button]:font-medium [&_button]:mt-2"></div>
          </div>

          <div className="p-6">
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">Or enter manually</span>
              </div>
            </div>

            <form onSubmit={handleManualSubmit}>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => {
                    setManualId(e.target.value);
                    setError('');
                  }}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl leading-5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="e.g. TT-PROD-12345"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-danger flex items-center gap-1">
                  <FiAlertCircle /> {error}
                </p>
              )}
              <button
                type="submit"
                className="mt-4 w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                Verify Product ID
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScannerPage;
