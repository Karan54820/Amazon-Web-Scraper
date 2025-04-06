import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingAnimation = ({ progress = 0 }) => {
  const [scrapingPhase, setScrapingPhase] = useState(0);
  const phases = [
    "Initializing scraper...",
    "Fetching product details...",
    "Extracting price and offers...", 
    "Gathering bank offers...",
    "Collecting product specifications...",
    "Generating review summaries...",
    "Finalizing results..."
  ];

  useEffect(() => {
    // Change the scraping phase based on progress
    if (progress < 20) setScrapingPhase(0);
    else if (progress < 35) setScrapingPhase(1);
    else if (progress < 50) setScrapingPhase(2);
    else if (progress < 65) setScrapingPhase(3);
    else if (progress < 80) setScrapingPhase(4);
    else if (progress < 95) setScrapingPhase(5);
    else setScrapingPhase(6);
  }, [progress]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-50">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Scraping in Progress</h2>
        <p className="text-gray-300 text-lg">Please wait while we gather your data...</p>
      </motion.div>
      
      <div className="w-2/3 max-w-lg bg-gray-700 rounded-full h-4 mb-6">
        <motion.div 
          className="bg-gradient-to-r from-purple-600 to-pink-500 h-4 rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-6 h-6"
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={scrapingPhase}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="text-purple-300 font-medium"
          >
            {phases[scrapingPhase]}
          </motion.p>
        </AnimatePresence>
      </motion.div>
      
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2
        }}
        className="relative w-32 h-32"
      >
        <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-l-4 border-pink-500 animate-spin" style={{ animationDuration: '1.5s' }}></div>
        <div className="absolute inset-0 rounded-full border-b-4 border-blue-500 animate-spin" style={{ animationDuration: '2s' }}></div>
      </motion.div>
      
      <motion.div 
        className="mt-8 flex gap-3"
        animate={{ 
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 2
        }}
      >
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-3 h-3 rounded-full bg-white"></div>
        ))}
      </motion.div>
    </div>
  );
};

export default LoadingAnimation; 