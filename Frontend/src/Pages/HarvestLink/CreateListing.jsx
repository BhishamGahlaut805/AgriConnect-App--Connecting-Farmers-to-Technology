// CreateListing.jsx - Enhanced with Bulk Listing Creation
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaArrowLeft,
  FaEnvelope,
  FaShieldAlt,
  FaCopy,
  FaInfoCircle,
  FaRupeeSign,
  FaBox,
  FaTag,
  FaList,
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
  const [otpResendTimer, setOtpResendTimer] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [listings, setListings] = useState([]);
  const [bulkProgress, setBulkProgress] = useState(null);

  // Initialize with one empty listing
  useEffect(() => {
    setListings([createEmptyListing()]);
    fetchProducts();
  }, []);

  // OTP resend timer effect
  useEffect(() => {
    let timer;
    if (otpResendTimer > 0) {
      timer = setTimeout(() => setOtpResendTimer(otpResendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpResendTimer]);

  const createEmptyListing = () => ({
    id: Date.now() + Math.random(),
    product: "",
    pricePerUnit: "",
    availableQty: "",
    minOrderQty: "1",
    description: "",
    status: "active",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await AgrimarketService.ProductService.getMyProducts();
      console.log("Fetched products:", response.data);

      const approvedProducts =
        response.data?.filter(
          (product) => product.status === "approved" || !product.status
        ) || [];

      setProducts(approvedProducts);

      if (approvedProducts.length === 0) {
        setMessage({
          text: "No approved products found. Please create and get products approved first.",
          type: "warning",
        });
      }
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

  // Auto-fill product details when product is selected
  const handleProductSelect = (listingIndex, productId) => {
    const product = products.find((p) => p._id === productId);
    if (!product) return;

    setListings((prev) =>
      prev.map((listing, index) => {
        if (index === listingIndex) {
          return {
            ...listing,
            product: productId,
            pricePerUnit: product.price || "",
            availableQty: product.stock || "",
            minOrderQty: product.minOrderQuantity?.toString() || "1",
            description: product.description || "",
          };
        }
        return listing;
      })
    );

    setSelectedProducts((prev) => new Set([...prev, productId]));
  };

  const addListing = () => {
    setListings((prev) => [...prev, createEmptyListing()]);
  };

  const removeListing = (index) => {
    if (listings.length <= 1) {
      setMessage({
        text: "You need at least one listing to proceed.",
        type: "warning",
      });
      return;
    }

    const listingToRemove = listings[index];
    if (listingToRemove.product) {
      setSelectedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(listingToRemove.product);
        return newSet;
      });
    }

    setListings((prev) => prev.filter((_, i) => i !== index));
  };

  const updateListing = (index, field, value) => {
    setListings((prev) =>
      prev.map((listing, i) =>
        i === index ? { ...listing, [field]: value } : listing
      )
    );
  };

  const validateListings = () => {
    const errors = [];

    listings.forEach((listing, index) => {
      if (!listing.product) {
        errors.push(`Listing ${index + 1}: Please select a product`);
      }
      if (!listing.pricePerUnit || parseFloat(listing.pricePerUnit) <= 0) {
        errors.push(
          `Listing ${index + 1}: Please enter a valid price per unit`
        );
      }
      if (!listing.availableQty || parseInt(listing.availableQty) <= 0) {
        errors.push(
          `Listing ${index + 1}: Please enter a valid available quantity`
        );
      }
      if (parseInt(listing.minOrderQty) <= 0) {
        errors.push(
          `Listing ${index + 1}: Minimum order quantity must be at least 1`
        );
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }

    // Check for duplicate products
    const productIds = listings.map((l) => l.product).filter(Boolean);
    const uniqueProducts = new Set(productIds);
    if (uniqueProducts.size !== productIds.length) {
      throw new Error(
        "Duplicate products detected. Please select different products for each listing."
      );
    }

    return true;
  };

  const initiateBulkListingWithOTP = async () => {
    try {
      validateListings();

      const user = JSON.parse(localStorage.getItem("userDetails"));
      if (!user?.contact) {
        throw new Error("User authentication required");
      }

      // Prepare bulk listing data
      const bulkListingData = {
        listings: listings.map((listing) => ({
          product: listing.product,
          pricePerUnit: parseFloat(listing.pricePerUnit),
          availableQty: parseInt(listing.availableQty),
          minOrderQty: parseInt(listing.minOrderQty),
          description: listing.description,
          status: "pending",
        })),
        email: user.contact,
        totalListings: listings.length,
      };

      console.log("Initiating bulk listing creation:", bulkListingData);

      // Use the new bulk initiation endpoint
      const initiation =
        await AgrimarketService.ListingService.initiateBulkListingCreation(
          bulkListingData
        );

      console.log("Bulk OTP initiation response:", initiation);

      if (!initiation.verificationId) {
        throw new Error(
          "Failed to initiate OTP verification for bulk listings"
        );
      }

      setVerificationId(initiation.verificationId);
      setShowOTPModal(true);
      setOtpResendTimer(30);
      setMessage({
        text: `OTP sent to your registered email. Verify to create ${listings.length} listing(s).`,
        type: "success",
      });

      return true;
    } catch (error) {
      throw error;
    }
  };

  const verifyAndCreateBulkListings = async () => {
    if (!otp || otp.length !== 6) {
      setMessage({ text: "Please enter a valid 6-digit OTP", type: "error" });
      return;
    }

    setSubmitting(true);
    setBulkProgress({
      total: listings.length,
      completed: 0,
      current: null,
      results: [],
    });

    try {
      console.log("Verifying bulk listings with OTP:", verificationId, otp);

      // Use the new bulk verification endpoint
      const response =
        await AgrimarketService.ListingService.verifyAndCreateBulkListings(
          verificationId,
          otp
        );

      console.log("Bulk listing creation response:", response);

      if (response.success) {
        setMessage({
          text: `Successfully created ${listings.length} listing(s)! Waiting for admin approval.`,
          type: "success",
        });

        setBulkProgress((prev) => ({
          ...prev,
          completed: listings.length,
          results: listings.map((listing, index) => ({
            success: true,
            index,
            product: products.find((p) => p._id === listing.product)?.title,
            listingId: response.listingIds?.[index] || `pending-${index}`,
          })),
        }));

        setShowOTPModal(false);
        resetForm();

        // Redirect to listings page after success
        setTimeout(() => {
          navigate("/harvestLink/my-listings");
        }, 3000);
      } else {
        throw new Error(response.message || "Bulk listing creation failed");
      }
    } catch (error) {
      console.error("Bulk OTP verification failed:", error);
      setMessage({
        text:
          error.message || "Bulk listing creation failed. Please try again.",
        type: "error",
      });
      setBulkProgress(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Alternative: Sequential creation if bulk endpoint is not available
  const createListingsSequentially = async (verificationId, otp) => {
    const results = [];
    setBulkProgress({
      total: listings.length,
      completed: 0,
      current: null,
      results: [],
    });

    for (let i = 0; i < listings.length; i++) {
      const listing = listings[i];
      const product = products.find((p) => p._id === listing.product);

      try {
        setBulkProgress((prev) => ({
          ...prev,
          current: `Creating: ${product?.title || `Listing ${i + 1}`}`,
        }));

        console.log(`Creating listing ${i + 1} of ${listings.length}`);

        // Use single listing creation for each listing
        const listingData = {
          product: listing.product,
          pricePerUnit: parseFloat(listing.pricePerUnit),
          availableQty: parseInt(listing.availableQty),
          minOrderQty: parseInt(listing.minOrderQty),
          description: listing.description,
          status: "pending",
          verificationId: verificationId,
          otp: otp,
        };

        const response =
          await AgrimarketService.ListingService.initiateListingCreation(
            listingData
          );

        results.push({
          success: true,
          index: i,
          product: product?.title,
          data: response,
        });

        setBulkProgress((prev) => ({
          ...prev,
          completed: i + 1,
          results: [
            ...prev.results,
            {
              success: true,
              index: i,
              product: product?.title,
            },
          ],
        }));

        // Small delay between requests
        if (i < listings.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Failed to create listing ${i + 1}:`, error);
        results.push({
          success: false,
          index: i,
          product: product?.title,
          error: error.message,
        });

        setBulkProgress((prev) => ({
          ...prev,
          completed: i + 1,
          results: [
            ...prev.results,
            {
              success: false,
              index: i,
              product: product?.title,
              error: error.message,
            },
          ],
        }));
      }
    }

    return results;
  };

  const resendOTP = async () => {
    if (otpResendTimer > 0) return;

    try {
      const user = JSON.parse(localStorage.getItem("userDetails"));
      await AgrimarketService.OTPService.resendOTP(
        verificationId,
        user.contact
      );
      setOtpResendTimer(30);
      setMessage({ text: "OTP resent successfully", type: "success" });
    } catch (error) {
      setMessage({
        text: error.message || "Failed to resend OTP",
        type: "error",
      });
    }
  };

  const resetForm = () => {
    setListings([createEmptyListing()]);
    setSelectedProducts(new Set());
    setOtp("");
    setBulkProgress(null);
  };

  const cancelListingCreation = () => {
    setShowOTPModal(false);
    setOtp("");
    setBulkProgress(null);
    setMessage({
      text: "Listing creation cancelled",
      type: "info",
    });
  };

  const getAvailableProducts = (currentListingIndex) => {
    return products.filter((product) => {
      const isSelectedElsewhere = Array.from(selectedProducts).some(
        (productId, index) =>
          index !== currentListingIndex && productId === product._id
      );
      return (
        !isSelectedElsewhere ||
        product._id === listings[currentListingIndex]?.product
      );
    });
  };

  const getProductDetails = (productId) => {
    return products.find((p) => p._id === productId);
  };

  const copyListing = (index) => {
    const listingToCopy = listings[index];
    const newListing = {
      ...listingToCopy,
      id: Date.now() + Math.random(),
      availableQty: "",
    };
    setListings((prev) => [...prev, newListing]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      await initiateBulkListingWithOTP();
    } catch (error) {
      console.error("Bulk listing creation failed:", error);
      setMessage({
        text: error.message || "Failed to create listings",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-16 min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/harvestLink/my-listings")}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Back to Listings
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create Multiple Listings
            </h1>
            <p className="text-gray-600 mt-2">
              List multiple products at once with single OTP verification
            </p>
          </div>
          <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            <FaShieldAlt className="mr-2" />
            Single OTP for All Listings
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Listing Summary
              </h3>
              <p className="text-gray-600">
                {listings.length} listing(s) ready for creation
              </p>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">
                <FaCheck className="inline mr-1" />
                Single OTP Verification
              </span>
              <span className="text-blue-600">
                <FaInfoCircle className="inline mr-1" />
                Auto-fill from Products
              </span>
            </div>
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : message.type === "warning"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              {message.type === "error" ? (
                <FaExclamationTriangle className="mr-2" />
              ) : message.type === "success" ? (
                <FaCheck className="mr-2" />
              ) : message.type === "warning" ? (
                <FaExclamationTriangle className="mr-2" />
              ) : null}
              <div className="whitespace-pre-line">{message.text}</div>
            </div>
          </div>
        )}

        {/* Bulk Progress Indicator */}
        {bulkProgress && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Creating Listings...
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>
                  Progress: {bulkProgress.completed} of {bulkProgress.total}
                </span>
                <span>
                  {Math.round(
                    (bulkProgress.completed / bulkProgress.total) * 100
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      (bulkProgress.completed / bulkProgress.total) * 100
                    }%`,
                  }}
                ></div>
              </div>
              {bulkProgress.current && (
                <p className="text-sm text-gray-600">{bulkProgress.current}</p>
              )}
            </div>
          </div>
        )}

        {/* Multiple Listing Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-sm p-6 relative"
            >
              {/* Listing Header */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Listing {index + 1}
                </h3>
                <div className="flex items-center space-x-2">
                  {listings.length > 1 && (
                    <button
                      type="button"
                      onClick={() => copyListing(index)}
                      className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Duplicate this listing"
                    >
                      <FaCopy className="text-sm" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeListing(index)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={listings.length <= 1}
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Product Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product *
                  </label>
                  <select
                    value={listing.product}
                    onChange={(e) => handleProductSelect(index, e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                    disabled={loading}
                  >
                    <option value="">
                      Choose a product from your inventory
                    </option>
                    {getAvailableProducts(index).map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.title} - {product.category}
                        {product.stock
                          ? ` (Stock: ${product.stock} ${product.unit})`
                          : ""}
                        {product.price ? ` - ₹${product.price}` : ""}
                      </option>
                    ))}
                  </select>

                  {/* Product Details Preview */}
                  {listing.product && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {getProductDetails(listing.product)?.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Category:{" "}
                            {getProductDetails(listing.product)?.category}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {getProductDetails(listing.product)?.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            <FaRupeeSign className="inline mr-1" />
                            {getProductDetails(listing.product)?.price}
                          </p>
                          <p className="text-sm text-gray-600">
                            <FaBox className="inline mr-1" />
                            Stock: {
                              getProductDetails(listing.product)?.stock
                            }{" "}
                            {getProductDetails(listing.product)?.unit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Price and Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Unit (₹) *
                    </label>
                    <div className="relative">
                      <FaRupeeSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={listing.pricePerUnit}
                        onChange={(e) =>
                          updateListing(index, "pricePerUnit", e.target.value)
                        }
                        step="0.01"
                        min="0.01"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Quantity *
                    </label>
                    <div className="relative">
                      <FaBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={listing.availableQty}
                        onChange={(e) =>
                          updateListing(index, "availableQty", e.target.value)
                        }
                        min="1"
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Order Quantity
                    </label>
                    <input
                      type="number"
                      value={listing.minOrderQty}
                      onChange={(e) =>
                        updateListing(index, "minOrderQty", e.target.value)
                      }
                      min="1"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Listing Status
                    </label>
                    <select
                      value={listing.status}
                      onChange={(e) =>
                        updateListing(index, "status", e.target.value)
                      }
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
                    Listing Description
                  </label>
                  <textarea
                    value={listing.description}
                    onChange={(e) =>
                      updateListing(index, "description", e.target.value)
                    }
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Additional details about this listing..."
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add More Listing Button */}
          <div className="text-center">
            <button
              type="button"
              onClick={addListing}
              className="px-6 py-3 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center justify-center mx-auto"
            >
              <FaPlus className="mr-2" />
              Add Another Listing
            </button>
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {listings.length} listing(s) ready • Single OTP verification
            </div>
            <button
              type="submit"
              disabled={submitting || loading || products.length === 0}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 flex items-center font-medium"
            >
              {submitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Preparing...
                </>
              ) : (
                <>
                  <FaList className="mr-2" />
                  Create {listings.length} Listing(s) with OTP
                </>
              )}
            </button>
          </div>
        </form>

        {/* Enhanced OTP Verification Modal */}
        {showOTPModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <FaEnvelope className="text-indigo-600 text-2xl" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Verify Bulk Creation
                </h3>
                <p className="text-gray-600 mb-1">
                  Enter the 6-digit OTP to create {listings.length} listing(s)
                </p>
                <p className="text-sm text-gray-500">
                  All listings will be created at once
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
                    className="w-full p-3 border border-gray-300 rounded-lg text-center text-xl font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={cancelListingCreation}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAndCreateBulkListings}
                    disabled={submitting || otp.length !== 6}
                    className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-700 font-medium flex items-center justify-center"
                  >
                    {submitting ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      `Verify & Create ${listings.length}`
                    )}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resendOTP}
                    disabled={otpResendTimer > 0}
                    className="text-indigo-600 hover:text-indigo-800 text-sm disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {otpResendTimer > 0
                      ? `Resend OTP in ${otpResendTimer}s`
                      : "Didn't receive OTP? Resend"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
