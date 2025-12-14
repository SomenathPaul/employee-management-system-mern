// client/src/components/PageWrapper.jsx
import React from "react";
import { motion } from "framer-motion";

const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}          // Start invisible
      animate={{ opacity: 1 }}          // Fade in
      exit={{ opacity: 0 }}             // Fade out when leaving
      transition={{ duration: 0.8 }}    // duration
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
