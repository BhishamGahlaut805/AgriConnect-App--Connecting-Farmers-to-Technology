// CreateListing.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaPlus,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEnvelope,
} from "react-icons/fa";

const CreateListing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [pendingListing, setPendingListing] = useState(null);

  const [form, setForm] = useState({
    product: "",
    pricePerUnit: "",
    availableQty: "",
    minOrderQty: "1",
    description: "",
    status: "active",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await AgrimarketService.ProductService.getMyProducts();
      setProducts(response.data || response || []);
    } catch (error) {
      console.error("Failed to load products:", error);
      setMessage({
        text: error.message || "Failed to load products",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      // Validate form
      if (!form.product || !form.pricePerUnit || !form.availableQty) {
        throw new Error("Please fill in all required fields");
      }

      if (parseFloat(form.pricePerUnit) <= 0) {
        throw new Error("Price must be greater than 0");
      }

      if (parseInt(form.availableQty) <= 0) {
        throw new Error("Available quantity must be greater than 0");
      }

      const user = JSON.parse(localStorage.getItem("userDetails"));
      if (!user?.email) {
        throw new Error("User authentication required");
      }

      const listingData = {
        product: form.product,
        pricePerUnit: parseFloat(form.pricePerUnit),
        availableQty: parseInt(form.availableQty),
        minOrderQty: parseInt(form.minOrderQty),
        description: form.description,
        status: form.status,
        email: user.email,
      };

      // Initiate OTP verification
      const initiation = await AgrimarketService.ListingService.createListing(
        listingData
      );

      setVerificationId(initiation.verificationId);
      setPendingListing(listingData);
      setShowOTPModal(true);
      setMessage({
        text: "OTP sent to your email. Please verify to create listing.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create listing:", error);
      setMessage({
        text: error.message || "Failed to create listing",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ text: "Please enter a valid 6-digit OTP", type: "error" });
      return;
    }

    try {
      setSubmitting(true);

      const response =
        await AgrimarketService.ListingService.verifyAndCreateListing(
          verificationId,
          otp
        );

      setMessage({
        text: "Listing created successfully! Waiting for admin approval.",
        type: "success",
      });

      setShowOTPModal(false);

      // Redirect after success
      setTimeout(() => {
        navigate("/my-listings");
      }, 2000);
    } catch (error) {
      console.error("OTP verification failed:", error);
      setMessage({
        text: error.message || "OTP verification failed",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resendOTP = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("userDetails"));
      await AgrimarketService.OTPService.resendOTP(verificationId, user.email);
      setMessage({ text: "OTP resent successfully", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to resend OTP", type: "error" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="mt-24 min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/my-listings")}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Back to Listings
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Listing</h1>
            <p className="text-gray-600 mt-2">
              List your agricultural products for sale
            </p>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : "bg-green-100 text-green-800 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              {message.type === "error" && (
                <FaExclamationTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Listing Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product *
              </label>
              <select
                name="product"
                value={form.product}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={products.length === 0 || loading}
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.title} ({product.unit}) - Stock: {product.stock}
                  </option>
                ))}
              </select>
              {products.length === 0 && !loading && (
                <p className="text-sm text-gray-500 mt-1">
                  No products found.{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/create-product")}
                    className="text-indigo-600 hover:underline"
                  >
                    Create a product first
                  </button>
                </p>
              )}
            </div>

            {/* Price and Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price per Unit (₹) *
                </label>
                <input
                  type="number"
                  name="pricePerUnit"
                  value={form.pricePerUnit}
                  onChange={handleInputChange}
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  name="availableQty"
                  value={form.availableQty}
                  onChange={handleInputChange}
                  min="1"
                  required
                  placeholder="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Minimum Order and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity *
                </label>
                <input
                  type="number"
                  name="minOrderQty"
                  value={form.minOrderQty}
                  onChange={handleInputChange}
                  min="1"
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe your listing (quality, special features, etc.)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={submitting || products.length === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <FaPlus className="mr-2" />
                  Create Listing
                </>
              )}
            </button>
          </div>
        </form>

        {/* OTP Verification Modal */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <FaEnvelope className="mx-auto text-indigo-600 text-3xl mb-3" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verify Your Email
                </h3>
                <p className="text-gray-600">
                  Enter the 6-digit OTP sent to your email address
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    placeholder="000000"
                    maxLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg text-center text-xl font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowOTPModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleOTPVerification}
                    disabled={submitting || otp.length !== 6}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 flex items-center justify-center"
                  >
                    {submitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      "Verify OTP"
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={resendOTP}
                  className="w-full text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  Didn't receive OTP? Resend
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
