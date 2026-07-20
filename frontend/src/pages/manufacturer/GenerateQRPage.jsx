import React, { useState, useEffect } from 'react';
import { FiPrinter, FiMaximize } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Breadcrumbs from '../../components/dashboard/Breadcrumbs';
import productService from '../../services/productService';

const GenerateQRPage = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batchProducts, setBatchProducts] = useState([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoading(true);
        // Fetch a large number of products to extract batches
        const res = await productService.getProducts({ limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' });
        const allProducts = res.data?.products || [];
        
        // Group by batchNumber
        const batchMap = {};
        allProducts.forEach(p => {
          if (p.batchNumber) {
            if (!batchMap[p.batchNumber]) {
              batchMap[p.batchNumber] = {
                batchNumber: p.batchNumber,
                productName: p.productName,
                brandName: p.brandName,
                count: 0,
                products: []
              };
            }
            batchMap[p.batchNumber].count += 1;
            batchMap[p.batchNumber].products.push(p);
          }
        });
        
        setBatches(Object.values(batchMap));
      } catch (error) {
        toast.error('Failed to load batches');
      } finally {
        setLoading(false);
      }
    };
    fetchBatches();
  }, []);

  const handleBatchSelect = (e) => {
    const batchNum = e.target.value;
    setSelectedBatch(batchNum);
    if (batchNum) {
      const batch = batches.find(b => b.batchNumber === batchNum);
      setBatchProducts(batch ? batch.products : []);
    } else {
      setBatchProducts([]);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col print:h-auto print:block">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />
      
      {/* Non-printable UI */}
      <div className="space-y-6 flex-1 flex flex-col print:hidden">
        <Breadcrumbs />
        
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col overflow-hidden">
          
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/20 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <FiMaximize className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Print QR Labels</h2>
                <p className="text-slate-500 text-sm">Select a batch to view and print packaging labels.</p>
              </div>
            </div>
            
            {batchProducts.length > 0 && (
              <button onClick={handlePrint} className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-secondary flex items-center gap-2 shadow-sm">
                <FiPrinter /> Print Labels
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
              
              <div className="p-6 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/30 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Select Batch</h3>
                <div>
                  {loading ? (
                    <div className="animate-pulse h-12 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
                  ) : (
                    <select 
                      value={selectedBatch} 
                      onChange={handleBatchSelect} 
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="">-- Choose a batch --</option>
                      {batches.map(b => (
                        <option key={b.batchNumber} value={b.batchNumber}>
                          Batch {b.batchNumber} - {b.productName} ({b.count} items)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {batchProducts.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Labels Preview ({batchProducts.length})</h3>
                  
                  {/* Grid Preview (screen only, different from print layout) */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {batchProducts.map(p => (
                      <div key={p._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-white dark:bg-slate-800 flex flex-col items-center text-center shadow-sm">
                        <img src={`http://localhost:5000${p.qrImageUrl}`} alt="QR Code" className="w-24 h-24 mb-3" />
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate w-full">{p.productName}</p>
                        <p className="text-[10px] text-slate-500 truncate w-full">Batch: {p.batchNumber}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-1">{p.serialNumber}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
      </div>

      {/* Printable Area - Only visible during print */}
      <div className="hidden print:block print:w-full bg-white print:bg-white absolute top-0 left-0 w-full min-h-screen z-50">
        <style>
          {`
            @media print {
              @page { margin: 0.5in; }
              body { background-color: white !important; color: black !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              /* Hide layout elements that might not be caught by print:hidden */
              aside, header, nav, .sidebar { display: none !important; }
              /* Ensure the printable area takes full width */
              .print\\:w-full { width: 100% !important; }
              * { box-shadow: none !important; text-shadow: none !important; }
            }
          `}
        </style>
        <div className="grid grid-cols-4 gap-4 w-full bg-white print:bg-white">
          {batchProducts.map(p => (
            <div key={p._id} className="border border-black p-2 flex flex-col items-center text-center bg-white print:bg-white" style={{ breakInside: 'avoid' }}>
              <img src={`http://localhost:5000${p.qrImageUrl}`} alt="QR Code" className="w-32 h-32 mb-1 bg-white" />
              <p className="text-sm font-bold text-black m-0 leading-tight">{p.productName}</p>
              <p className="text-xs text-black m-0 leading-tight">Batch: {p.batchNumber}</p>
              <p className="text-xs text-black font-mono m-0 leading-tight">{p.serialNumber}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenerateQRPage;
