import React from 'react';
import { motion } from "framer-motion";

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };
  
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
  
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-black text-white">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-20 left-10 z-[-2]"
        animate={{ 
          y: [0, 30, 0],
          opacity: [0.3, 0.5, 0.3],
          rotate: 360
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 15,
          ease: "linear"
        }}
      >
        <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
      </motion.div>
      
      <motion.div 
        className="absolute bottom-20 right-10 z-[-2]"
        animate={{ 
          y: [0, -40, 0],
          opacity: [0.2, 0.4, 0.2],
          rotate: -360
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 20,
          ease: "linear"
        }}
      >
        <div className="w-96 h-96 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-3xl" />
      </motion.div>
      
      {/* Animated floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 10 + 5}px`,
              backgroundColor: i % 2 === 0 ? "#a855f7" : "#ec4899",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: Math.random() * 5 + 10,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>
      
      {/* Hero Section */}
      <motion.div 
        className="relative flex flex-col items-center justify-center text-center z-10 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="relative max-w-3xl font-Manrope px-4"
          variants={itemVariants}
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
            About Us
          </motion.h1>
          
          <motion.p 
            className="my-4 font-medium text-gray-300 text-xl"
            variants={itemVariants}
          >
            At SmartScraper, we specialize in automating e-commerce data extraction to make online product analysis effortless. Our intelligent web scraper retrieves detailed information from Amazon India's smart TV listings, including prices, discounts, reviews, specifications, and offers—all in one place. Whether you're a tech enthusiast, a researcher, or a savvy shopper, SmartScraper helps you make informed decisions with accurate, real-time data.
          </motion.p>
          
          {/* New content below */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16"
            variants={itemVariants}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            {/* Our Mission */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.2)",
                borderColor: "rgba(168, 85, 247, 0.4)" 
              }}
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Our Mission
              </h2>
              
              <p className="text-gray-300 mb-4">
                SmartScraper was born from a simple realization: comparing products online is too time-consuming. Our mission is to simplify this process by providing an intuitive platform that extracts and organizes product information in seconds.
              </p>
              
              <p className="text-gray-300">
                We're committed to helping consumers make better purchasing decisions through access to comprehensive, unbiased data. By automating the tedious parts of product research, we free you to focus on what matters most—finding the perfect product for your needs.
              </p>
            </motion.div>
            
            {/* Why Choose Us */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(236, 72, 153, 0.2)",
                borderColor: "rgba(236, 72, 153, 0.4)" 
              }}
            >
              <h2 className="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                Why Choose Us
              </h2>
              
              <ul className="space-y-3">
                {[
                  "Advanced AI technology for accurate data extraction",
                  "Real-time price and offer tracking",
                  "Comprehensive review summaries generated by AI",
                  "Beautiful, easy-to-navigate user interface",
                  "Secure, privacy-focused approach with no data storage"
                ].map((feature, index) => (
                  <motion.li 
                    key={index}
                    className="flex items-start space-x-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4 + index * 0.1 }}
                  >
                    <div className="mt-1 flex-shrink-0">
                      <motion.div
                        className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      />
                    </div>
                    <p className="text-gray-300">{feature}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
          
          {/* Core Features */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Core Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Product Detail Extraction",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ),
                  description: "Automatically extracts comprehensive product specs, pricing, and availability from Amazon listings."
                },
                {
                  title: "Bank Offer Analysis",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  ),
                  description: "Identifies and presents all available bank offers and discounts to maximize your savings."
                },
                {
                  title: "AI Review Summarization",
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  ),
                  description: "Leverages AI to analyze and summarize customer reviews, highlighting common praise and criticism."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 p-6 rounded-xl backdrop-blur-sm border border-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 + index * 0.2 }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
                    borderColor: "rgba(139, 92, 246, 0.4)" 
                  }}
                >
                  <div className="flex justify-center mb-4">
                    <motion.div 
                      className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-800/50 flex items-center justify-center"
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0] 
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 5 + index,
                        ease: "easeInOut" 
                      }}
                    >
                      {feature.icon}
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-center">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Team Section */}
          <motion.div
            className="mt-16 mb-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.5 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-red-400">
              Our Team
            </h2>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AboutUs;