//NOT IN USE
import React, { useState } from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import AgrimarketService from "../../API/AgrimarketService";
import CartBar from "./Cartbar";
import Links from "./Links";
import Cart from "./Cart";
const OtpVerification = ({
  verificationId,
  email,
  productData,
  images,
  onVerified,
}) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      setMessage({ text: "Enter a valid 6-digit OTP", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "Verifying OTP...", type: "info" });

    try {
      const response = await AgrimarketService.ProductService.verifyProductOTP(
        verificationId,
        otp,
        productData,
        images
      );

      if (response.success) {
        setMessage({
          text: "Product created successfully!",
          type: "success",
        });
        if (onVerified) onVerified(); // Optional callback to navigate or reset
      } else {
        throw new Error(response.message || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setMessage({
        text: error.message || "Failed to verify OTP",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white mt-16  rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
      {/* Hello */}
      {/* <div */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Verify OTP to Complete Product Creation
      </h2>
      <p className="text-gray-600 mb-6">
        An OTP has been sent to <span className="font-medium">{email}</span>.
        Enter it below to confirm product creation.
      </p>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`p-3 mb-4 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-100 text-red-800 border border-red-200"
              : message.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-blue-100 text-blue-800 border border-blue-200"
          }`}
        >
          <div className="flex items-center">
            {message.type === "error" && (
              <FaExclamationTriangle className="mr-2" />
            )}
            {message.type === "success" && <FaCheckCircle className="mr-2" />}
            {message.text}
          </div>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 text-center tracking-widest text-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          placeholder="Enter 6-digit OTP"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
    </div>
  );
};

export default OtpVerification;
