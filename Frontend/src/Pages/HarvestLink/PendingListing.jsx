// Fixed PendingListings.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminService from "../../API/AdminService";
import {
  FaCheck,
  FaTimes,
  FaSpinner,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaExclamationTriangle,
  FaBox,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";

// Confirmation Dialog Component
const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor = "red",
  type = "reject",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div
            className={`p-2 rounded-full ${
              type === "reject"
                ? "bg-red-100 dark:bg-red-900"
                : "bg-green-100 dark:bg-green-900"
            }`}
          >
            <FaExclamationTriangle
              className={`text-lg ${
                type === "reject"
                  ? "text-red-600 dark:text-red-400"
                  : "text-green-600 dark:text-green-400"
              }`}
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
            {title}
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 bg-${confirmColor}-600 text-white rounded-lg hover:bg-${confirmColor}-700 transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const PendingListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    listingId: null,
    action: null,
    rejectionReason: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadPendingListings();
  }, []);

  const loadPendingListings = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getPendingListings();
      console.log("Pending listings response:", response);

      // Ensure we have the data in the correct format
      const listingsData = response.data || response.listings || [];
      console.log("Processed listings data:", listingsData);

      setListings(listingsData);
    } catch (error) {
      console.error("Failed to load pending listings:", error);
      setError(error.message || "Failed to load pending listings");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId) => {
    try {
      setProcessing((prev) => ({ ...prev, [listingId]: "approving" }));
      await AdminService.approveListing(listingId);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (error) {
      console.error("Failed to approve listing:", error);
      setError(error.message || "Failed to approve listing");
    } finally {
      setProcessing((prev) => ({ ...prev, [listingId]: null }));
    }
  };

  const handleReject = async (listingId, reason) => {
    try {
      setProcessing((prev) => ({ ...prev, [listingId]: "rejecting" }));
      await AdminService.rejectListing(listingId, reason);
      setListings((prev) => prev.filter((l) => l._id !== listingId));
    } catch (error) {
      console.error("Failed to reject listing:", error);
      setError(error.message || "Failed to reject listing");
    } finally {
      setProcessing((prev) => ({ ...prev, [listingId]: null }));
    }
  };

  const showApproveConfirmation = (listingId) => {
    setConfirmationDialog({
      isOpen: true,
      listingId,
      action: "approve",
      rejectionReason: "",
    });
  };

  const showRejectConfirmation = (listingId) => {
    setConfirmationDialog({
      isOpen: true,
      listingId,
      action: "reject",
      rejectionReason: "",
    });
  };

  const handleConfirmation = () => {
    const { listingId, action, rejectionReason } = confirmationDialog;

    if (action === "approve") {
      handleApprove(listingId);
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason");
        return;
      }
      handleReject(listingId, rejectionReason);
    }

    setConfirmationDialog({
      isOpen: false,
      listingId: null,
      action: null,
      rejectionReason: "",
    });
  };

 const handleViewListing = (listingId) => {
   // Only navigate if listingId is a valid ObjectId
   if (listingId && /^[0-9a-fA-F]{24}$/.test(listingId)) {
     navigate(`/harvestLink/listing/${listingId}`);
   } else {
     console.warn("Attempted to view listing with invalid ID:", listingId);
     setError("Cannot view this listing. Invalid ID.");
   }
 };


  const handleViewProduct = (productId) => {
    // Validate that productId is a valid ObjectId format
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (objectIdRegex.test(productId)) {
      navigate(`/harvestLink/product/${productId}`);
    } else {
      console.error("Invalid product ID format:", productId);
      setError("Invalid product ID. Cannot view this product.");
    }
  };

  const filteredListings = listings.filter((listing) => {
    const productTitle = listing.product?.title || listing.title || "";
    return productTitle.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const urlimage = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  // Helper function to safely get product images
  const getProductImages = (listing) => {
    return listing.product?.images || listing.images || [];
  };

  // Helper function to safely get product title
  const getProductTitle = (listing) => {
    return listing.product?.title || listing.title || "Untitled Listing";
  };

  // Helper function to safely get product description
  const getProductDescription = (listing) => {
    return (
      listing.product?.description ||
      listing.description ||
      "No description available"
    );
  };

  // Helper function to safely get product category
  const getProductCategory = (listing) => {
    return listing.product?.category || listing.category || "Unknown";
  };

  if (loading) {
    return (
      <div className="mt-32 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading pending listings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-32 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pending Listings Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and approve marketplace listings ({listings.length} pending)
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FaExclamationTriangle className="mr-2" />
                {error}
              </div>
              <button
                onClick={() => setError("")}
                className="text-red-700 dark:text-red-200 hover:text-red-800 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FaFilter className="mr-2" />
              Showing {filteredListings.length} of {listings.length} listings
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <FaCheck className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {listings.length === 0
                ? "No Pending Listings"
                : "No Matching Listings"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {listings.length === 0
                ? "All listings have been reviewed and approved."
                : "Try adjusting your search terms."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredListings.map((listing) => {
              const images = getProductImages(listing);
              const title = getProductTitle(listing);
              const description = getProductDescription(listing);
              const category = getProductCategory(listing);
              const isValidListingId = /^[0-9a-fA-F]{24}$/.test(listing._id);
              const isValidProductId =
                listing.product?._id &&
                /^[0-9a-fA-F]{24}$/.test(listing.product._id);

              return (
                <div
                  key={listing._id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Listing Image */}
                    <div className="lg:w-1/4">
                      <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center relative">
                        {images.length > 0 ? (
                          <img
                            src={urlimage(images[0])}
                            alt={title}
                            className="h-full w-full object-cover rounded-lg"
                          />
                        ) : (
                          <FaBox className="text-gray-400 dark:text-gray-500 text-3xl" />
                        )}
                        <div className="absolute top-3 right-3">
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs px-2 py-1 rounded-full">
                            Pending
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Listing Details */}
                    <div className="lg:w-2/4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                            {title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                            {description}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {isValidListingId && (
                            <button
                              onClick={() => handleViewListing(listing._id)}
                              className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors p-2"
                              title="View Listing Details"
                            >
                              <FaExternalLinkAlt />
                            </button>
                          )}
                          {isValidProductId && (
                            <button
                              onClick={() =>
                                handleViewProduct(listing.product._id)
                              }
                              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-2"
                              title="View Product Details"
                            >
                              <FaBox />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">
                            Price
                          </label>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ₹{listing.pricePerUnit || listing.price || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">
                            Available Qty
                          </label>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {listing.availableQty || listing.stock || "N/A"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">
                            Min Order
                          </label>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {listing.minOrderQty || 1}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-500 dark:text-gray-400">
                            Category
                          </label>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {category}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                        {listing.location && (
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-1" />
                            <span>
                              {listing.location.district ||
                                listing.location.city}
                              , {listing.location.state}
                            </span>
                          </div>
                        )}
                        {listing.farmer && (
                          <div className="flex items-center">
                            <FaUser className="mr-1" />
                            <span>
                              Farmer: {listing.farmer.name || "Unknown"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lg:w-1/4 flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2">
                      <button
                        onClick={() => showApproveConfirmation(listing._id)}
                        disabled={processing[listing._id]}
                        className="flex-1 lg:flex-none bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        {processing[listing._id] === "approving" ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaCheck className="mr-2" />
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => showRejectConfirmation(listing._id)}
                        disabled={processing[listing._id]}
                        className="flex-1 lg:flex-none bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        {processing[listing._id] === "rejecting" ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <>
                            <FaTimes className="mr-2" />
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={confirmationDialog.isOpen}
        onClose={() =>
          setConfirmationDialog({ ...confirmationDialog, isOpen: false })
        }
        onConfirm={handleConfirmation}
        title={
          confirmationDialog.action === "approve"
            ? "Approve Listing"
            : "Reject Listing"
        }
        message={
          confirmationDialog.action === "approve" ? (
            "Are you sure you want to approve this listing? It will become visible to all users."
          ) : (
            <div>
              <p className="mb-3">
                Are you sure you want to reject this listing?
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rejection Reason (required):
                </label>
                <textarea
                  value={confirmationDialog.rejectionReason}
                  onChange={(e) =>
                    setConfirmationDialog({
                      ...confirmationDialog,
                      rejectionReason: e.target.value,
                    })
                  }
                  placeholder="Provide reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  rows="3"
                  required
                />
              </div>
            </div>
          )
        }
        confirmText={
          confirmationDialog.action === "approve" ? "Approve" : "Reject"
        }
        confirmColor={confirmationDialog.action === "approve" ? "green" : "red"}
        type={confirmationDialog.action}
      />
    </div>
  );
};

export default PendingListings;
