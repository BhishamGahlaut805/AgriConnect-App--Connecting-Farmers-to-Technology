// MyProducts.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaFilter,
  FaBoxOpen,
  FaSpinner,
  FaExclamationTriangle,
  FaSync,
  FaChartBar,
} from "react-icons/fa";
  const urlimage = (imagePath) => {
    if(imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };
  import CartBar from "./Cartbar";
  import Links from "./Links";

const MyProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleting, setDeleting] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await AgrimarketService.ProductService.getMyProducts();
     console.log(response);
      // Handle different response structures
      const productsData = response.data || response.products || response || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(
        err.message || "Failed to load your products. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshProducts = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const deleteProduct = async (productId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting((prev) => ({ ...prev, [productId]: true }));
      await AgrimarketService.ProductService.deleteProduct(productId);
      setProducts(products.filter((product) => product._id !== productId));
      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(err.message || "Failed to delete product");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleting((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Under Review",
      },
      approved: { color: "bg-green-100 text-green-800", label: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
      draft: { color: "bg-gray-100 text-gray-800", label: "Draft" },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      VEGETABLE: "Vegetables",
      FRUIT: "Fruits",
      GRAIN: "Grains",
      DAIRY: "Dairy",
      MACHINERY: "Machinery",
      FERTILIZER: "Fertilizers",
      SEED: "Seeds",
      PESTICIDE: "Pesticides",
      TOOLS: "Tools",
      OTHER: "Other",
    };
    return categoryMap[category] || category;
  };

  // Get unique categories for filter
  const categories = [
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || product.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: products.length,
    approved: products.filter((p) => p.status === "approved").length,
    pending: products.filter((p) => p.status === "pending").length,
    rejected: products.filter((p) => p.status === "rejected").length,
  };

  if (loading && products.length === 0) {
    return (
      <div className="mt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CartBar />
        {/* Header */}
        <div className="mt-16 flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-2">
              Manage your agricultural products and inventory
            </p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={refreshProducts}
              disabled={refreshing}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 flex items-center transition-colors"
            >
              <FaSync className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              to="/harvestLink/create-product"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg flex items-center justify-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Add New Product
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Products</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {getCategoryDisplayName(category)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
            {success}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <FaBoxOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "No products match your filters"
                : "No products found"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search criteria or filters to find what you're looking for."
                : "Get started by creating your first agricultural product to sell on HarvestLink."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/harvestLink/create-product"
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaPlus className="mr-2" />
                Create Your First Product
              </Link>
              {(searchTerm ||
                statusFilter !== "all" ||
                categoryFilter !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setCategoryFilter("all");
                  }}
                  className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-gray-200"
              >
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={urlimage(product.images[0])}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <FaBoxOpen className="text-4xl" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    {getStatusBadge(product.status)}
                  </div>
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                    {getCategoryDisplayName(product.category)}
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                      {product.title}
                    </h3>
                    <div className="text-xl font-bold text-indigo-600 ml-3">
                      ₹{product.price}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Unit:</span>
                      <p className="font-medium">{product.unit}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <p className="font-medium">{product.stock}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Min Order:</span>
                      <p className="font-medium">{product.minOrderQuantity}</p>
                    </div>
                    {product.specs?.certification && (
                      <div>
                        <span className="text-gray-500">Certified:</span>
                        <p className="font-medium text-green-600">Yes</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        navigate(`/harvestLink/product/${product._id}`)
                      }
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <FaEye className="mr-2" />
                      View
                    </button>
                    <button
                      onClick={() =>
                        navigate(`/harvestLink/edit-product/${product._id}`)
                      }
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaEdit className="mr-2" />
                      Edit
                    </button>
                    {/* <div className="w-px bg-gray-300" /> */}

                    <button
                      onClick={() => deleteProduct(product._id)}
                      disabled={deleting[product._id]}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                      {deleting[product._id] ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaTrash />
                      )}
                    </button>
                  </div>
                  <div className="px-3 py-2 font-bold text-gray-600">
                    Stock Left :{product.stock} {product.unit}
                  </div>

                  {/* Create Listing Button */}
                  {product.status === "approved" && (
                    <button
                      onClick={() =>
                        navigate("/harvestLink/create-listing", {
                          state: { productId: product._id },
                        })
                      }
                      className="w-full mt-3 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FaPlus className="mr-2" />
                      Create Listing
                    </button>
                  )}
                </div>
                <Links />
              </div>
            ))}
          </div>
        )}

        {/* Results Info */}
        {filteredProducts.length > 0 && (
          <div className="mt-6 text-center text-gray-600">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
