import React from 'react';
import { motion } from 'framer-motion';

const ApiPage = () => {
  const endpoints = [
    { method: 'GET', path: '/api/v1/products/:id', desc: 'Retrieve details and blockchain verification status for a specific product.' },
    { method: 'POST', path: '/api/v1/products', desc: 'Register a new product onto the TrueTrace blockchain.' },
    { method: 'GET', path: '/api/v1/analytics', desc: 'Fetch analytics and scan statistics for your registered products.' },
    { method: 'POST', path: '/api/v1/auth/token', desc: 'Generate an API access token for server-to-server integration.' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white sm:text-5xl">
            API Reference
          </h1>
          <p className="mt-4 text-xl text-slate-500 dark:text-slate-400">
            Integrate TrueTrace's blockchain authentication capabilities into your own applications.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          <div className="p-8 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Authentication</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              All API requests require a Bearer token in the Authorization header. You can generate a token in the Manufacturer Dashboard under Settings &gt; Developer API.
            </p>
            <code className="block p-4 bg-slate-100 dark:bg-slate-900 rounded-lg text-sm text-pink-600 dark:text-pink-400 font-mono">
              Authorization: Bearer YOUR_API_TOKEN
            </code>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Endpoints</h2>
            <div className="space-y-6">
              {endpoints.map((ep, i) => (
                <div key={i} className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary/50 transition-colors">
                  <div className="flex items-center space-x-4 mb-3">
                    <span className={`px-3 py-1 rounded text-xs font-bold ${
                      ep.method === 'GET' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      ep.method === 'POST' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {ep.method}
                    </span>
                    <code className="text-slate-900 dark:text-slate-200 font-mono">{ep.path}</code>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">{ep.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiPage;
