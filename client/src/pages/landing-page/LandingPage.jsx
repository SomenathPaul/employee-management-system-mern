// src/pages/landing-page/LandingPage.jsx
import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate(); 

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="bg-blue-500 w-screen h-screen flex justify-center items-center">
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, scale: 1, rotateY: 90 }}
        animate={{ opacity: 1, scale: 0.8, rotateY: 0 }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      >
        <img src="./website-logo.png" alt="Logo" className="w-[120px]" />
        <h2 className="text-white text-xl font-bold">Welcome to HRly</h2>
      </motion.div>
    </div>
  );
}
