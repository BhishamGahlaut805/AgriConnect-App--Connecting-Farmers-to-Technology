import React from "react";
import { Link } from "react-router-dom";
import { FaShoppingBag, FaArrowLeft } from "react-icons/fa";

const CartHero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-yellow-100 via-green-100 to-yellow-200 dark:from-gray-900 dark:via-slate-900 dark:to-black py-20">
      {/* Subtle background blur and animation */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-yellow-400/10 via-green-300/10 to-transparent blur-3xl animate-pulse"></div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Back Link */}
        <div className="flex justify-center mb-8">
          <Link
            to="/harvestLink/browse"
            className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/70 text-yellow-700 dark:text-yellow-400 rounded-full shadow hover:shadow-lg hover:bg-white/90 dark:hover:bg-gray-800 transition-all"
          >
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>

        {/* Main Heading */}
        <div className="inline-block bg-gradient-to-r from-yellow-400 via-orange-500 to-green-500 bg-clip-text text-transparent font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg">
          Your Shopping Cart
        </div>

        {/* Icon and Description */}
        <div className="mt-6 flex flex-col items-center gap-4 text-gray-700 dark:text-gray-300">
          <FaShoppingBag className="text-5xl text-yellow-500 animate-bounce" />
          <p className="max-w-2xl text-lg sm:text-xl leading-relaxed">
            Everything you’ve picked with care is right here. Review your items,
            adjust quantities, and check out securely.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/checkout"
            className="px-8 py-3 rounded-full bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-semibold shadow-lg hover:scale-105 transition-transform"
          >
            Proceed to Checkout
          </Link>
          <Link
            to="/harvestLink/browse"
            className="px-8 py-3 rounded-full border border-yellow-500 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500 hover:text-white font-semibold shadow-md hover:scale-105 transition-transform"
          >
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Decorative bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 320"
          className="w-full h-24 text-yellow-300/40 dark:text-green-800/30"
          fill="currentColor"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,181.3C96,171,192,149,288,138.7C384,128,480,128,576,122.7C672,117,768,107,864,128C960,149,1056,203,1152,218.7C1248,235,1344,213,1392,202.7L1440,192V320H0Z"
          ></path>
        </svg>
      </div>
    </section>
  );
};

export default CartHero;
