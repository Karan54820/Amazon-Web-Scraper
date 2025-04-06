import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageGalleryTabs = ({ productImages = [], manufacturerImages = [] }) => {
  const [activeTab, setActiveTab] = useState('product');
  
  // Animation variants
  const tabVariants = {
    inactive: { opacity: 0.7, y: 0 },
    active: { 
      opacity: 1, 
      y: -2,
      transition: { duration: 0.3 }
    }
  };
  
  const imageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 150, 
        damping: 15, 
        delay: 0.1 + i * 0.05 
      }
    })
  };
  
  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex space-x-3 border-b border-gray-700 pb-2">
        <motion.button
          onClick={() => setActiveTab('product')}
          className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'product' 
            ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-white border-b-2 border-amber-500' 
            : 'text-gray-400 hover:text-gray-200'}`}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === 'product' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Product Images
          <span className="ml-2 bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 text-xs">
            {productImages.length}
          </span>
        </motion.button>
        
        <motion.button
          onClick={() => setActiveTab('manufacturer')}
          className={`px-4 py-2 rounded-t-lg font-medium ${activeTab === 'manufacturer' 
            ? 'bg-gradient-to-r from-rose-500/20 to-red-500/20 text-white border-b-2 border-rose-500' 
            : 'text-gray-400 hover:text-gray-200'}`}
          variants={tabVariants}
          initial="inactive"
          animate={activeTab === 'manufacturer' ? 'active' : 'inactive'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Manufacturer Images
          <span className="ml-2 bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 text-xs">
            {manufacturerImages.length}
          </span>
        </motion.button>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'product' && (
          <motion.div
            key="product-images"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {productImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {productImages.map((img, index) => (
                  <motion.div
                    key={index}
                    className="group relative rounded-lg overflow-hidden bg-gray-900/40 shadow-md border border-gray-700 aspect-square"
                    custom={index}
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Product Image ${index + 1}`}
                      className="w-full h-full object-contain p-2 transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2"
                    >
                      <span className="text-white text-xs">Image {index + 1}</span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <p>No product images available</p>
              </div>
            )}
          </motion.div>
        )}
        
        {activeTab === 'manufacturer' && (
          <motion.div
            key="manufacturer-images"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {manufacturerImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {manufacturerImages.map((img, index) => (
                  <motion.div
                    key={index}
                    className="group relative rounded-lg overflow-hidden bg-gray-900/40 shadow-md border border-gray-700"
                    custom={index}
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
                      transition: { duration: 0.2 }
                    }}
                  >
                    <img
                      src={img}
                      alt={`Manufacturer Image ${index + 1}`}
                      className="w-full h-40 object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-2"
                    >
                      <span className="text-white text-xs">Image {index + 1}</span>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-gray-400">
                <motion.div
                  animate={{ rotate: [0, 10, 0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 5 }}
                  className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </motion.div>
                <p>No manufacturer images available</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImageGalleryTabs; 