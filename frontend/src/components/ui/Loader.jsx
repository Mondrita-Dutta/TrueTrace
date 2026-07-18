import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const containerStyle = fullScreen 
    ? "fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50"
    : "flex items-center justify-center p-4";

  return (
    <div className={containerStyle}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full"
      />
    </div>
  );
};

export default Loader;
