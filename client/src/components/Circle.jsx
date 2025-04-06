import React from "react";
import { motion } from "framer-motion";

const Circle = () => {
  return (
    <>
      <motion.div 
        className="absolute bottom-[-100px] left-1/2 -translate-x-1/2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.4, 0.8, 0.4],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ 
          repeat: Infinity,
          duration: 6,
          ease: "easeInOut"
        }}
      >
        <motion.img
          src="circle1.png"
          alt="Glowing Circle"
          className="w-[80vw] opacity-80 drop-shadow-[0_0_80px_#FF00E5] blur-lg"
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity,
            duration: 30,
            ease: "linear"
          }}
        />
      </motion.div>
    </>
  );
};

export default Circle;