import React, { useState } from 'react';
import { motion } from "framer-motion";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(null);
  
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setFormStatus('submitting');
    
    setTimeout(() => {
      console.log('Form submitted:', formData);
      setFormStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      // Reset status after 3 seconds
      setTimeout(() => setFormStatus(null), 3000);
    }, 1500);
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
      
      {/* Content Section */}
      <motion.div 
        className="relative flex flex-col items-center justify-center text-center z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="relative max-w-5xl font-Manrope px-4 mb-32 w-full"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-5xl font-extrabold sm:text-7xl mb-10"
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
            Contact Us
          </motion.h1>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
            variants={itemVariants}
          >
            {/* Contact Form */}
            <motion.div
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700"
              whileHover={{ 
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.2)",
                borderColor: "rgba(168, 85, 247, 0.4)" 
              }}
            >
              <h2 className="text-2xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Get in Touch
              </h2>
              
              <motion.p 
                className="mb-6 text-gray-300"
                variants={itemVariants}
              >
                Have questions about our product or service? We'd love to hear from you. Fill out the form below and we'll get back to you as soon as possible.
              </motion.p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <motion.div 
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <motion.input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      required
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                      whileFocus={{ scale: 1.01, boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
                    />
                  </motion.div>
                </div>
                
                <div>
                  <motion.div 
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <motion.input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your Email"
                      required
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                      whileFocus={{ scale: 1.01, boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
                    />
                  </motion.div>
                </div>
                
                <div>
                  <motion.div 
                    className="relative"
                    whileFocus={{ scale: 1.02 }}
                  >
                    <motion.textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your Message"
                      required
                      rows={5}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                      whileFocus={{ scale: 1.01, boxShadow: "0 0 10px rgba(168, 85, 247, 0.5)" }}
                    />
                  </motion.div>
                </div>
                
                <motion.button
                  type="submit"
                  disabled={formStatus === 'submitting'}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-white text-lg font-bold shadow-lg w-full"
                  whileHover={{ 
                    scale: 1.02, 
                    boxShadow: "0 0 25px rgba(168, 85, 247, 0.7)" 
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  {formStatus === 'submitting' ? 'Sending...' : 'Send Message'}
                </motion.button>
                
                {formStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300"
                  >
                    Message sent successfully! We'll get back to you soon.
                  </motion.div>
                )}
              </form>
            </motion.div>
            
            {/* Contact Info */}
            <motion.div className="space-y-8">
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700"
                whileHover={{ 
                  boxShadow: "0 0 30px rgba(236, 72, 153, 0.2)",
                  borderColor: "rgba(236, 72, 153, 0.4)" 
                }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-pink-400">Phone</h3>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-pink-400">Email</h3>
                      <p className="text-gray-300">info@smartscraper.com</p>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.2 }}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-pink-400">Address</h3>
                      <p className="text-gray-300">123 Innovation Drive<br />Tech Valley, CA 94043</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
              
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 p-8 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700"
                whileHover={{ 
                  boxShadow: "0 0 30px rgba(129, 140, 248, 0.2)",
                  borderColor: "rgba(129, 140, 248, 0.4)" 
                }}
              >
                <h2 className="text-2xl font-bold mb-6 text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-600">
                  Connect With Us
                </h2>
                
                <div className="flex space-x-4 justify-center">
                  {['twitter', 'facebook', 'instagram', 'linkedin'].map((platform, index) => (
                    <motion.a
                      key={platform}
                      href={`#${platform}`}
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/30 to-pink-500/30 flex items-center justify-center"
                      whileHover={{ 
                        scale: 1.2,
                        background: 'linear-gradient(to right, rgba(168, 85, 247, 0.8), rgba(236, 72, 153, 0.8))'
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.4 + index * 0.1 }}
                    >
                      <SocialIcon platform={platform} />
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

const SocialIcon = ({ platform }) => {
  switch (platform) {
    case 'twitter':
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
        </svg>
      );
    case 'facebook':
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    default:
      return null;
  }
};

export default Contact; 