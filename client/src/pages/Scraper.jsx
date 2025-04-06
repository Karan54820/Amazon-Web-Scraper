import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingAnimation from "../components/LoadingAnimation";
import { validateScrapedData, formatScrapingRequest } from "../utils/scrapingHelpers";
import ImageGalleryTabs from "../components/ImageGalleryTabs";

// Get API URL from environment variables
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function Scraper({ setShowCircle }) {
  const [link, setLink] = useState("");
  const [data, setData] = useState(null); // To store the scraped data
  const [loading, setLoading] = useState(false); // To handle loading state
  const [error, setError] = useState(null); // To handle errors
  const [progress, setProgress] = useState(0); // Track progress for loading animation

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Function to sanitize and validate incoming data
  const sanitizeData = (rawData) => {
    if (!rawData) return null;
    
    // Validate the data structure
    const validationResults = validateScrapedData(rawData);
    
    // Log validation issues
    if (!validationResults.isValid) {
      console.warn("Invalid scraped data structure:", validationResults);
    }
    
    if (validationResults.emptyArrays.includes('bankOffers')) {
      console.warn("Bank offers array is empty in the response");
    }
    
    return {
      title: rawData.title || "Unknown Title",
      rating: rawData.rating || "N/A",
      numRatings: rawData.numRatings || "0",
      price: rawData.price || "N/A",
      discount: rawData.discount || "No Discount",
      bankOffers: Array.isArray(rawData.bankOffers) ? rawData.bankOffers : [],
      aboutItem: Array.isArray(rawData.aboutItem) ? rawData.aboutItem : [],
      productInfo: rawData.productInfo || {},
      productImages: Array.isArray(rawData.productImages) ? rawData.productImages : [],
      manufacturerImages: Array.isArray(rawData.manufacturerImages) ? rawData.manufacturerImages : [],
      reviews: rawData.reviews || "No review summary available."
    };
  };

  const handleScrape = async () => {
    if (link.trim() === "") {
      alert("Please enter a valid link!");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);
    setShowCircle(false); // Hide the Circle when scraping starts
    setProgress(0);

    // Debug info
    console.log("Scraping URL:", link);

    // Format the request properly
    const request = formatScrapingRequest(link);
    console.log("Formatted request:", request);

    // Simulate progress updates while waiting for response
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Cap at 90% until we get actual data
        const newProgress = prev + (90 - prev) * 0.1;
        return Math.min(newProgress, 89);
      });
    }, 300);

    try {
      console.log("Sending request to backend with payload:", request);
      
      const response = await fetch(`${API_URL}/scrape`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request), // Use our formatted request with options
      });

      if (!response.ok) {
        throw new Error("Failed to fetch data from the backend");
      }

      const result = await response.json();
      console.log("Raw response from backend:", result);
      
      // Check specifically for bank offers in the raw response
      if (!result.bankOffers) {
        console.warn("Backend response missing 'bankOffers' field");
      } else if (result.bankOffers && result.bankOffers.length === 0) {
        console.warn("Backend returned empty 'bankOffers' array");
      }
      
      // Complete the progress animation
      clearInterval(progressInterval);
      setProgress(100);
      
      // Short delay to show 100% completion before removing loading screen
      setTimeout(() => {
        // Sanitize and validate the data before setting it
        setData(sanitizeData(result)); // Store the sanitized data
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error(err);
      clearInterval(progressInterval);
      setError("Failed to scrape data. Please try again.");
      setLoading(false);
    }
  };

  const handleClearData = () => {
    setData(null); // Clear the scraped data
    setShowCircle(true); // Show the Circle again
  };

  useEffect(() => {
    if (data) {
      console.log("Received Data:", data);
      console.log("Bank Offers:", data.bankOffers);
      
      // Check if bankOffers exists and is valid
      if (!data.bankOffers) {
        console.warn("Bank offers data is undefined");
      } else if (!Array.isArray(data.bankOffers)) {
        console.warn("Bank offers is not an array:", typeof data.bankOffers);
      } else if (data.bankOffers.length === 0) {
        console.warn("Bank offers array is empty");
      }
    }
  }, [data]);

  // Get the effective bank offers to display (either real or mock)
  const getEffectiveBankOffers = () => {
    if (!data || !data.bankOffers) return [];
    return data.bankOffers;
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white p-4">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-40 left-10 -z-10"
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.1, 0.2, 0.1],
          rotate: 360
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "linear"
        }}
      >
        <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-3xl" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-40 right-10 -z-10"
        animate={{ 
          y: [0, -40, 0],
          opacity: [0.1, 0.2, 0.1],
          rotate: -360
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 25,
          ease: "linear"
        }}
      >
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl" />
      </motion.div>
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              backgroundColor: i % 2 === 0 ? "#a855f7" : "#ec4899",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 5 + 15,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Loading Animation */}
      <AnimatePresence>
        {loading && <LoadingAnimation progress={progress} />}
      </AnimatePresence>

      {/* Scraper Section */}
      <motion.div 
        className="relative flex flex-col items-center justify-center text-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="relative top-32 max-w-3xl font-Manrope px-4"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 15 
          }}
        >
          <motion.h1 
            className="text-5xl font-extrabold sm:text-7xl"
            initial={{ backgroundPosition: "200% 0" }}
            animate={{ backgroundPosition: "0% 0" }}
            transition={{ duration: 1.5 }}
            style={{ 
              backgroundImage: "linear-gradient(90deg, #fff, #a855f7, #ec4899, #fff)",
              backgroundSize: "200% auto",
              color: "transparent",
              backgroundClip: "text",
              WebkitBackgroundClip: "text"
            }}
          >
            Smart Scraper
          </motion.h1>
          <motion.p 
            className="my-4 font-medium text-gray-300 text-xl"
            variants={itemVariants}
          >
            Here, you can start scraping data from Amazon India's smart TV listings. Enter a link below to begin the scraping process.
          </motion.p>
          <motion.div 
            className="flex items-center justify-center gap-4 mt-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.input
              type="text"
              placeholder="Enter the link here"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-80 rounded-lg px-4 py-2 text-black bg-white border-2 border-transparent focus:border-purple-500 transition-all duration-300"
              whileFocus={{ scale: 1.02, boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)" }}
            />
            <motion.button
              onClick={handleScrape}
              className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-white shadow-lg"
              disabled={loading}
              whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(168, 85, 247, 0.7)" }}
              whileTap={{ scale: 0.95 }}
            >
              {loading ? "Scraping..." : "Start Scraping"}
            </motion.button>
          </motion.div>
          {error && (
            <motion.p 
              className="text-red-500 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </motion.div>

      {/* Display Scraped Data */}
      <AnimatePresence>
      {data && (
          <motion.div 
            className="mt-40 px-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ type: "spring", damping: 20 }}
          >
            <motion.h2 
              className="text-3xl font-bold text-center mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              Scraped Data
            </motion.h2>
            <motion.div 
              className="bg-gray-800 p-6 rounded-lg shadow-lg text-left"
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.h3 
                className="text-3xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 10,
                  delay: 0.3 
                }}
              >
                {data.title}
              </motion.h3>
              
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.4 
                }}
              >
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(168, 85, 247, 0.4)" 
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15
                  }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3"
                      animate={{ 
                        rotate: [0, 5, 0, -5, 0] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 5, 
                        ease: "easeInOut" 
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.div>
                    <h4 className="text-xl font-bold text-white">Product Details</h4>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="mb-3 flex items-center">
                      <span className="text-purple-400 font-medium w-32">Rating:</span> 
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-2">★</span>
                        <span className="text-gray-200">{data.rating}</span>
                      </div>
                    </div>

                    <div className="mb-3 flex items-center">
                      <span className="text-purple-400 font-medium w-32">Reviews:</span> 
                      <span className="text-gray-200">{data.numRatings}</span>
                    </div>
                    
                    <div className="mb-3 flex items-center">
                      <span className="text-purple-400 font-medium w-32">Price:</span> 
                      <span className="text-white font-bold text-xl">{data.price}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-purple-400 font-medium w-32">Discount:</span> 
                      <motion.span 
                        className="inline-block bg-green-600 text-white px-2 py-1 rounded-md text-sm font-medium"
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          repeat: 3,
                          repeatDelay: 5,
                          duration: 0.4
                        }}
                      >
                        {data.discount}
                      </motion.span>
                    </div>
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm"
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(236, 72, 153, 0.4)" 
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 15
                  }}
                >
                  <div className="flex items-center mb-4">
                    <motion.div 
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center mr-3"
                      animate={{ 
                        rotate: [0, -5, 0, 5, 0] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 5,
                        delay: 0.5,
                        ease: "easeInOut" 
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </motion.div>
                    <h4 className="text-xl font-bold text-white">Bank Offers</h4>
                  </div>
                  
                  {getEffectiveBankOffers().length > 0 ? (
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                      {getEffectiveBankOffers().map((offer, index) => (
                        <motion.div 
                          key={index}
                          className="bg-gray-700/50 p-3 rounded-lg border-l-4 border-pink-500"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                          whileHover={{ 
                            x: 5,
                            backgroundColor: "rgba(107, 114, 128, 0.4)",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <p className="text-gray-200 text-sm">{offer}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col items-center space-y-4 py-3"
                    >
                      <motion.div 
                        className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center"
                        animate={{ 
                          scale: [1, 1.1, 1],
                          rotate: [0, 10, 0, -10, 0],
                        }}
                        transition={{ 
                          repeat: Infinity, 
                          repeatType: "mirror",
                          duration: 4 
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </motion.div>
                      <p className="text-gray-300 italic text-center text-sm">
                        No bank offers available for this product
                      </p>
                      <motion.button
                        className="px-4 py-1 mt-1 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full text-xs text-white shadow-md"
                        whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(147, 51, 234, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          window.open("https://www.amazon.in/gp/help/customer/display.html?nodeId=201556430", "_blank");
                        }}
                      >
                        Learn about bank offers
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
              
              <motion.div
                className="my-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.6 
                }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 flex items-center justify-center mr-3"
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6, 
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <h4 className="text-xl font-bold text-white">About This Item</h4>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm"
                  whileHover={{ 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(99, 102, 241, 0.4)" 
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.aboutItem.map((item, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-start space-x-2 bg-gray-700/30 p-3 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.05 }}
                        whileHover={{ 
                          backgroundColor: "rgba(75, 85, 99, 0.4)",
                          x: 5,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="mt-1 flex-shrink-0">
                          <motion.div
                            className="w-4 h-4 rounded-full bg-indigo-500"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                          />
                        </div>
                        <p className="text-gray-200 text-sm">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="my-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 0.8 
                }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center mr-3"
                    animate={{ 
                      rotate: [0, -5, 0, 5, 0] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6, 
                      ease: "easeInOut",
                      delay: 1.5
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </motion.div>
                  <h4 className="text-xl font-bold text-white">Product Specifications</h4>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm"
                  whileHover={{ 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(20, 184, 166, 0.4)" 
                  }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(data.productInfo).map(([key, value], index) => (
                      <motion.div
                  key={index}
                        className="bg-gray-700/30 p-3 rounded-lg"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.9 + index * 0.03 }}
                        whileHover={{ 
                          backgroundColor: "rgba(75, 85, 99, 0.4)",
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-teal-400 font-medium text-sm">{key}</span>
                          <motion.div 
                            className="h-px w-12 bg-gray-600 mt-3"
                            animate={{ width: ["30%", "70%", "30%"] }}
                            transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", delay: index * 0.1 }}
                          />
                        </div>
                        <p className="text-white mt-1">{value}</p>
                      </motion.div>
              ))}
            </div>
                </motion.div>
              </motion.div>
              
              <motion.div
                className="my-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 1.0 
                }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center mr-3"
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6, 
                      ease: "easeInOut",
                      delay: 2
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </motion.div>
                  <h4 className="text-xl font-bold text-white">Image Gallery</h4>
                </div>
                
                <motion.div 
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg border border-gray-700 backdrop-blur-sm"
                  whileHover={{ 
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(245, 158, 11, 0.4)" 
                  }}
                >
                  {/* Tabs for image types */}
                  <ImageGalleryTabs 
                    productImages={data.productImages || []} 
                    manufacturerImages={data.manufacturerImages || []} 
                  />
                </motion.div>
              </motion.div>
              
              <motion.div
                className="my-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  delay: 1.4 
                }}
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 flex items-center justify-center mr-3"
                    animate={{ 
                      rotate: [0, 5, 0, -5, 0] 
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6, 
                      ease: "easeInOut",
                      delay: 3
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </motion.div>
                  <h4 className="text-xl font-bold text-white">AI-Generated Review Summary</h4>
                </div>
                
                <motion.div 
                  className="relative overflow-hidden rounded-xl shadow-2xl"
                  whileHover={{ 
                    scale: 1.01, 
                    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  {/* Background gradient animation */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-purple-800/80 via-pink-700/80 to-purple-800/80 backdrop-blur-md"
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ 
                      duration: 10, 
                      repeat: Infinity, 
                      repeatType: "mirror" 
                    }}
                    style={{ backgroundSize: "200% 200%" }}
                  />
                  
                  {/* Animated decorative elements */}
                  <div className="relative z-0 overflow-hidden">
                    <motion.div
                      className="absolute right-10 top-10 w-20 h-20 rounded-full bg-pink-500/20 blur-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
                      transition={{ duration: 5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute left-10 bottom-10 w-16 h-16 rounded-full bg-purple-500/20 blur-xl"
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                    />
                  </div>
                  
                  {/* Content */}
                  <div className="relative p-8 z-10">
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.5 }}
                      className="bg-gray-900/30 backdrop-blur-sm p-6 rounded-lg border border-white/10"
                    >
                      <div className="flex space-x-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <motion.span 
                            key={i} 
                            className="text-yellow-400 text-xl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6 + i * 0.1 }}
                          >
                            ★
                          </motion.span>
              ))}
            </div>
                      
                      <motion.div 
                        className="prose prose-invert max-w-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.1 }}
                      >
                        <p className="text-white text-lg leading-relaxed font-light">
                          {data.reviews || "No summary available."}
                        </p>
                      </motion.div>
                      
                      <motion.div
                        className="mt-6 flex space-x-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.5 }}
                      >
                        <div className="px-3 py-1 bg-purple-900/50 rounded-full text-xs text-purple-200 border border-purple-600/30">
                          AI Generated
                        </div>
                        <div className="px-3 py-1 bg-indigo-900/50 rounded-full text-xs text-indigo-200 border border-indigo-600/30">
                          Summarized from reviews
                        </div>
                      </motion.div>
                    </motion.div>
            </div>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="flex justify-center mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 3 }}
              >
                <motion.button
              onClick={handleClearData}
                  className="relative overflow-hidden rounded-xl px-8 py-4 group shadow-[0_0_25px_rgba(220,38,38,0.5)]"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600" />
                  <span className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center justify-center text-white font-bold text-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
              Clear Data
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}