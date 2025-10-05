// File: FixedMyListings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
const listingService = AgrimarketService.ListingService;
import {
  FaEdit,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaPlus,
  FaEye,
  FaSearch,
  FaExclamationTriangle,
  FaSync,
  FaBoxOpen,
} from "react-icons/fa";

export default function MyListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listingService.mine();

      // Handle standardized response
      const listingsData = response.success ? response.data : [];
      setListings(Array.isArray(listingsData) ? listingsData : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch listings. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshListings = () => {
    setRefreshing(true);
    fetchListings();
  };

  const toggleListingStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    try {
      await listingService.toggleStatus(id, newStatus);
      setListings(
        listings.map((listing) =>
          listing._id === id ? { ...listing, status: newStatus } : listing
        )
      );
      setSuccess("Listing status updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update listing status");
      setTimeout(() => setError(""), 3000);
    }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    try {
      await listingService.delete(id);
      setListings(listings.filter((listing) => listing._id !== id));
      setSuccess("Listing deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete listing");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Get unique categories for filter
  const categories = [
    ...new Set(
      listings
        .map((listing) => listing.product?.category || listing.category)
        .filter(Boolean)
    ),
  ];

  const filteredListings = listings.filter((listing) => {
    const product = listing.product || listing;
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || listing.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-16 container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-2">
            My Listings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your product listings and inventory
          </p>
        </div>
        <div className="flex space-x-3 mt-4 md:mt-0">
          <button
            onClick={refreshListings}
            disabled={refreshing}
            className="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 disabled:opacity-50 flex items-center"
          >
            <FaSync className={`mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <Link
            to="/create-product"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center justify-center"
          >
            <FaPlus className="mr-2" /> Add New Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search listings by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="sold">Sold Out</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            {error}
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          {success}
        </div>
      )}

      {/* Listings Grid */}
      {filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <FaBoxOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            No listings found
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== "all" || categoryFilter !== "all"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first product listing"}
          </p>
          <div className="mt-6">
            <Link
              to="/create-product"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" />
              Create Listing
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const product = listing.product || listing;
            return (
              <div
                key={listing._id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="relative">
                  <img
                    src={product.images?.[0] || "/api/placeholder/400/250"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        listing.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : listing.status === "sold"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                      }`}
                    >
                      {listing.status?.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {product.name}
                    </h3>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ₹{listing.pricePerUnit || product.price}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        Category:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {product.category || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        Stock:
                      </span>
                      <p className="text-gray-900 dark:text-white">
                        {listing.availableQty || product.availableQuantity}{" "}
                        {product.baseUnit}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      to={`/listing/${listing._id}`}
                      className="flex-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded text-center hover:bg-gray-300 dark:hover:bg-slate-600"
                    >
                      <FaEye className="inline mr-1" /> View
                    </Link>
                    <Link
                      to={`/edit-listing/${listing._id}`}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-center hover:bg-blue-700"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </Link>
                    <button
                      onClick={() =>
                        toggleListingStatus(listing._id, listing.status)
                      }
                      className={`px-3 py-2 rounded ${
                        listing.status === "active"
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-green-600 hover:bg-green-700 text-white"
                      }`}
                    >
                      {listing.status === "active" ? (
                        <FaToggleOff className="inline mr-1" />
                      ) : (
                        <FaToggleOn className="inline mr-1" />
                      )}
                      {listing.status === "active" ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => deleteListing(listing._id)}
                      className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                    >
                      <FaTrash className="inline" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
