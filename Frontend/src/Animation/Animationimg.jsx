// src/components/Animation1.jsx
import React from "react";
import Lottie from "lottie-react";
import animationData from "../assets/animation1.json";

const Animation1 = () => {
  return (
    <div
      id="animation-container"
      className="w-full h-full flex justify-center items-center"
    >
      <Lottie animationData={animationData} loop={true} />
    </div>
  );
};

export default Animation1;
