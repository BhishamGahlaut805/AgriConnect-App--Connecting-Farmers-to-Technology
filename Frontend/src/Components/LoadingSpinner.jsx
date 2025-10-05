import React from "react";
import { motion } from "framer-motion";

const LoadingSpinner = ({ size = 50, color = "#198754" }) => {
  return (
    <div
      className="d-flex justify-content-center align-items-center w-100"
      style={{ height: "100px" }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: size,
          height: size,
          border: `4px solid ${color}`,
          borderTop: "4px solid transparent",
          borderRadius: "50%",
        }}
      ></motion.div>
    </div>
  );
};

export default LoadingSpinner;
