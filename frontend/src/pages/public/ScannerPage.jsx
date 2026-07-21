import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { FiSearch, FiAlertCircle, FiCamera, FiUploadCloud, FiType, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ScannerPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('camera'); // 'camera', 'upload', 'manual'
  const [manualId, setManualId] = useState('');
  const [error, setError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameras, setHasCameras] = useState(true);
  const html5QrCodeRef = useRef(null);
  
  // For file upload drag & drop
  const [isDragging, setIsDragging] = useState(false);

  // Initialize Html5Qrcode on component mount
  useEffect(() => {
    html5QrCodeRef.current = new Html5Qrcode("reader");
    
    // Check for cameras
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length) {
        setHasCameras(true);
      } else {
        setHasCameras(false);
      }
    }).catch(err => {
      setHasCameras(false);
    });

    return () => {
      stopScanning();
    };
  }, []);

  const stopScanning = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn("Failed to stop scanner", err);
      }
      setIsScanning(false);
    }
  };

  const startScanning = async () => {
    if (!html5QrCodeRef.current) return;
    setError('');
    
    try {
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText, decodedResult) => {
          handleSuccessfulScan(decodedText);
        },
        (errorMessage) => {
          // ignore scan errors
        }
      );
      setIsScanning(true);
    } catch (err) {
      console.error(err);
      setError("Failed to start camera. Please ensure you have granted camera permissions.");
    }
  };

  // Switch tabs
  const handleTabChange = async (tab) => {
    setError('');
    setActiveTab(tab);
    if (tab !== 'camera' && isScanning) {
      await stopScanning();
    }
  };

  const handleSuccessfulScan = async (decodedText) => {
    await stopScanning();
    
    let productId = decodedText;
    try {
      const data = JSON.parse(decodedText);
      if (data.productId) productId = data.productId;
    } catch (e) {
      // not JSON, keep original
    }
    navigate(`/verify/${encodeURIComponent(productId)}`);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualId.trim()) {
      navigate(`/verify/${encodeURIComponent(manualId.trim())}`);
    } else {
      setError('Please enter a valid Product ID');
    }
  };

  // File Upload Handlers
  const handleFileScan = async (file) => {
    if (!file) return;
    if (!html5QrCodeRef.current) return;
    
    setError('');
    try {
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      handleSuccessfulScan(decodedText);
    } catch (err) {
      setError("No QR code found in the image. Please try a different image.");
    }
  };

  const onFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileScan(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const onFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileScan(e.target.files[0]);
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
            <FiSearch className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Verify Product</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Choose a method below to verify the authenticity of a TrueTrace product.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => handleTabChange('camera')}
              className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'camera' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <FiCamera className="w-4 h-4" /> Camera
            </button>
            <button
              onClick={() => handleTabChange('upload')}
              className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <FiUploadCloud className="w-4 h-4" /> Upload
            </button>
            <button
              onClick={() => handleTabChange('manual')}
              className={`flex-1 py-4 px-2 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2 ${activeTab === 'manual' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <FiType className="w-4 h-4" /> Enter ID
            </button>
          </div>

          <div className="p-6">
            {/* Camera Tab Content */}
            <div className={activeTab === 'camera' ? 'block' : 'hidden'}>
              <div className="mb-4">
                <div id="reader" className={`w-full mx-auto overflow-hidden rounded-2xl bg-black/5 dark:bg-black/20 [&_video]:rounded-2xl [&_video]:object-cover ${!isScanning ? 'h-64 flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-600' : ''}`}>
                  {!isScanning && (
                    <div className="text-center p-4">
                      <FiCamera className="w-12 h-12 mx-auto text-slate-400 mb-2" />
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {hasCameras ? 'Camera is ready' : 'No camera detected'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={!hasCameras}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCamera /> Start Camera Scanner
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-danger hover:bg-danger/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <FiX /> Stop Camera
                </button>
              )}
            </div>

            {/* Upload Tab Content */}
            <div className={activeTab === 'upload' ? 'block' : 'hidden'}>
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onFileDrop}
                className={`relative w-full h-64 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 dark:hover:border-primary/50 bg-slate-50 dark:bg-slate-800/50'}`}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={onFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FiUploadCloud className={`w-12 h-12 mb-3 ${isDragging ? 'text-primary' : 'text-slate-400'}`} />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 text-center mb-1">
                  Click to upload a file
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                  or drag and drop an image containing a QR code
                </p>
              </div>
            </div>

            {/* Manual Tab Content */}
            <div className={activeTab === 'manual' ? 'block' : 'hidden'}>
              <form onSubmit={handleManualSubmit}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Product ID or Serial Number
                </label>
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
                <button
                  type="submit"
                  className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Verify Product ID
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2"
              >
                <FiAlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" /> 
                <p className="text-sm text-danger">{error}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ScannerPage;
