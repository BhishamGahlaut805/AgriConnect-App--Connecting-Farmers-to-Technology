// Enhanced PendingProducts.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminService from "../../API/AdminService";
import {
  FaCheck,
  FaTimes,
  FaEye,
  FaSpinner,
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaExternalLinkAlt,
  FaInfoCircle,
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

const PendingProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [confirmationDialog, setConfirmationDialog] = useState({
    isOpen: false,
    productId: null,
    action: null,
    rejectionReason: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadPendingProducts();
  }, []);

  const loadPendingProducts = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getPendingProducts();
      console.log("Pending products response:", response);
      setProducts(response.data || []);
    } catch (err) {
      console.error("Failed to load pending products:", err);
      setError(err.message || "Failed to load pending products");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      setProcessing((prev) => ({ ...prev, [productId]: "approving" }));
      await AdminService.approveProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Failed to approve product:", err);
      setError(err.message || "Failed to approve product");
    } finally {
      setProcessing((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const handleReject = async (productId, reason) => {
    try {
      setProcessing((prev) => ({ ...prev, [productId]: "rejecting" }));
      await AdminService.rejectProduct(productId, reason.trim());
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("Failed to reject product:", err);
      setError(err.message || "Failed to reject product");
    } finally {
      setProcessing((prev) => ({ ...prev, [productId]: null }));
    }
  };

  const showApproveConfirmation = (productId) => {
    setConfirmationDialog({
      isOpen: true,
      productId,
      action: "approve",
      rejectionReason: "",
    });
  };

  const showRejectConfirmation = (productId) => {
    setConfirmationDialog({
      isOpen: true,
      productId,
      action: "reject",
      rejectionReason: "",
    });
  };

  const handleConfirmation = () => {
    const { productId, action, rejectionReason } = confirmationDialog;

    if (action === "approve") {
      handleApprove(productId);
    } else if (action === "reject") {
      if (!rejectionReason.trim()) {
        alert("Please provide a rejection reason");
        return;
      }
      handleReject(productId, rejectionReason);
    }

    setConfirmationDialog({
      isOpen: false,
      productId: null,
      action: null,
      rejectionReason: "",
    });
  };

  const handleViewProduct = (productId) => {
    navigate(`/harvestLink/product/${productId}`);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory
      ? product.category === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const urlimage = (imagePath) => {
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  if (loading) {
    return (
      <div className="mt-16 min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 dark:text-indigo-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading pending products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Pending Products Approval
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Review and approve products submitted by users
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              <FaFilter className="mr-2" />
              {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <FaCheck className="mx-auto text-4xl text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Pending Products
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All products have been reviewed and approved.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Product Image */}
                <div className="h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center relative">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={urlimage(product.images[0])}
                      alt={product.title}
                      className="h-full w-full object-cover"
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

                {/* Product Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate flex-1 mr-2">
                      {product.title}
                    </h3>
                    <button
                      onClick={() => handleViewProduct(product._id)}
                      className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      title="View Product Details"
                    >
                      <FaExternalLinkAlt />
                    </button>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Category:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Price:
                      </span>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        ₹{product.price} / {product.unit}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">
                        Stock:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {product.stock}
                      </span>
                    </div>
                    {product.specs?.certification && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">
                          Certification:
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {product.specs.certification}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => showApproveConfirmation(product._id)}
                      disabled={processing[product._id]}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                    >
                      {processing[product._id] === "approving" ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <>
                          <FaCheck className="mr-2" />
                          Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => showRejectConfirmation(product._id)}
                      disabled={processing[product._id]}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                    >
                      {processing[product._id] === "rejecting" ? (
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
            ))}
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
            ? "Approve Product"
            : "Reject Product"
        }
        message={
          confirmationDialog.action === "approve" ? (
            "Are you sure you want to approve this product? It will become visible to all users."
          ) : (
            <div>
              <p className="mb-3">
                Are you sure you want to reject this product?
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

export default PendingProducts;
