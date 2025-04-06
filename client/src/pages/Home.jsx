import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  
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
      
      {/* Hero Section */}
      <motion.div 
        className="relative flex flex-col items-center justify-center min-h-screen text-center z-10"
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
            Smart Scraper for Smart TVs
          </motion.h1>
          
          <motion.p 
            className="my-4 font-medium text-gray-300 text-xl"
            variants={itemVariants}
          >
            SmartScraper extracts detailed data from Amazon India's smart TV listings, including prices, offers, reviews, and specs. It streamlines product analysis, helping users make informed decisions effortlessly.
          </motion.p>
          
          <motion.div
            variants={itemVariants}
            className="mt-8"
          >
            <motion.button
              onClick={() => {
                console.log("Navigating to scraper page");
                navigate("/scraper");
              }}
              className="relative z-20 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-white text-lg font-bold shadow-lg"
              whileHover={{ 
                scale: 1.05, 
                boxShadow: "0 0 25px rgba(168, 85, 247, 0.7)" 
              }}
              whileTap={{ scale: 0.95 }}
            >
              Try It Now
            </motion.button>
          </motion.div>
        </motion.div>
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
    </div>
  );
}
