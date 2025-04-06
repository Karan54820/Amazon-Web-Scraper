import React from 'react';
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const isActive = (path) => location.pathname === path;
    
    const navItemVariants = {
      hover: { scale: 1.1, y: -2 }
    };
    
  return (
    <>
        {/* Navbar */}
      <motion.nav 
        className="container relative mx-auto flex w-full items-center justify-between px-5 py-3 text-xl bg-black"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src="logo1.png" alt="Logo" className="w-30 invert" />
        </motion.div>
        <div className="flex items-center justify-around gap-10 text-white">
          <ul className="mx-3 flex space-x-6">
            <motion.li variants={navItemVariants} whileHover="hover">
              <Link to="/" className={`transition-all duration-300 ${isActive('/') ? 'text-purple-500 font-bold' : 'hover:text-purple-400'}`}>
                <motion.span
                  initial={{ backgroundSize: "0% 2px" }}
                  animate={{ backgroundSize: isActive('/') ? "100% 2px" : "0% 2px" }}
                  whileHover={{ backgroundSize: "100% 2px" }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundImage: "linear-gradient(to right, #a855f7, #ec4899)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left bottom"
                  }}
                >
                  Home
                </motion.span>
              </Link>
            </motion.li>
            <motion.li variants={navItemVariants} whileHover="hover">
              <Link to="/about" className={`transition-all duration-300 ${isActive('/about') ? 'text-purple-500 font-bold' : 'hover:text-purple-400'}`}>
                <motion.span
                  initial={{ backgroundSize: "0% 2px" }}
                  animate={{ backgroundSize: isActive('/about') ? "100% 2px" : "0% 2px" }}
                  whileHover={{ backgroundSize: "100% 2px" }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundImage: "linear-gradient(to right, #a855f7, #ec4899)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left bottom"
                  }}
                >
                  About Us
                </motion.span>
              </Link>
            </motion.li>
            <motion.li variants={navItemVariants} whileHover="hover">
              <Link to="/contact" className={`transition-all duration-300 ${isActive('/contact') ? 'text-purple-500 font-bold' : 'hover:text-purple-400'}`}>
                <motion.span
                  initial={{ backgroundSize: "0% 2px" }}
                  animate={{ backgroundSize: isActive('/contact') ? "100% 2px" : "0% 2px" }}
                  whileHover={{ backgroundSize: "100% 2px" }}
                  transition={{ duration: 0.3 }}
                  style={{
                    backgroundImage: "linear-gradient(to right, #a855f7, #ec4899)",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "left bottom"
                  }}
                >
                  Contact
                </motion.span>
              </Link>
            </motion.li>
          </ul>
          <motion.button
            className="hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-white sm:block shadow-lg"
            onClick={() => navigate("/scraper")}
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 0 15px rgba(168, 85, 247, 0.7)" 
            }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started
          </motion.button>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;