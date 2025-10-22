// BrowsePage.jsx - Enhanced Version
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaShoppingCart,
  FaSeedling,
  FaRupeeSign,
  FaStar,
  FaEye,
  FaHeart,
  FaShare,
  FaSpinner,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCertificate,
  FaBox,
  FaTruck,
  FaLeaf,
  FaShoppingBag,
  FaBoxOpen,
  FaStore,
  FaTractor,
  FaPlus,
  FaCheckCircle,
  FaSortAmountDown,
  FaSortAmountUp,
  FaFire,
  FaRocket,
  FaClock,
  FaAward,
  FaUsers,
  FaChartLine,
} from "react-icons/fa";
import CartBar from "./Cartbar";
import Cart from "./Cart";
export default function BrowsePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [listings, setListings] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [message, setMessage] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const toastTimer = useRef(null);

  // Enhanced filters state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    location: searchParams.get("location") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
    status: "active",
    featured: searchParams.get("featured") === "true",
    verifiedOnly: searchParams.get("verifiedOnly") === "true",
    inStockOnly: searchParams.get("inStockOnly") === "true",
    rating: searchParams.get("rating") || "",
  });

  // Enhanced category data
  const categoryData = useMemo(
    () => [
      {
        name: "Vegetables",
        value: "VEGETABLE",
        icon: FaLeaf,
        count: 1250,
        color: "from-green-500 to-emerald-600",
        bgColor: "bg-green-50 dark:bg-green-900/20",
      },
      {
        name: "Fruits",
        value: "FRUIT",
        icon: FaShoppingBag,
        count: 890,
        color: "from-orange-500 to-red-500",
        bgColor: "bg-orange-50 dark:bg-orange-900/20",
      },
      {
        name: "Grains",
        value: "GRAIN",
        icon: FaBoxOpen,
        count: 650,
        color: "from-amber-500 to-yellow-500",
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
      },
      {
        name: "Dairy",
        value: "DAIRY",
        icon: FaStore,
        count: 320,
        color: "from-blue-400 to-cyan-500",
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
      },
      {
        name: "Machinery",
        value: "MACHINERY",
        icon: FaTractor,
        count: 150,
        color: "from-gray-600 to-gray-800",
        bgColor: "bg-gray-50 dark:bg-gray-900/20",
      },
      {
        name: "Fertilizers",
        value: "FERTILIZER",
        count: 280,
        icon: FaSeedling,
        color: "from-lime-500 to-green-500",
        bgColor: "bg-lime-50 dark:bg-lime-900/20",
      },
      {
        name: "Seeds",
        value: "SEED",
        count: 420,
        icon: FaPlus,
        color: "from-teal-500 to-cyan-500",
        bgColor: "bg-teal-50 dark:bg-teal-900/20",
      },
      {
        name: "Tools",
        value: "TOOLS",
        count: 190,
        icon: FaTractor,
        color: "from-purple-500 to-indigo-500",
        bgColor: "bg-purple-50 dark:bg-purple-900/20",
      },
    ],
    []
  );

  // Sort options
  const sortOptions = [
    { value: "createdAt", label: "Newest First", icon: FaClock },
    { value: "-createdAt", label: "Oldest First", icon: FaCalendarAlt },
    {
      value: "pricePerUnit",
      label: "Price: Low to High",
      icon: FaSortAmountUp,
    },
    {
      value: "-pricePerUnit",
      label: "Price: High to Low",
      icon: FaSortAmountDown,
    },
    { value: "-rating", label: "Highest Rated", icon: FaStar },
    { value: "title", label: "Name: A to Z", icon: FaSortAmountUp },
    { value: "-title", label: "Name: Z to A", icon: FaSortAmountDown },
    { value: "-availableQty", label: "Most Stock", icon: FaBox },
  ];

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(null), 3000);
  };

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = JSON.parse(
          localStorage.getItem("userDetails") || "null"
        );
        setUser(userData);
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
    return () => clearTimeout(toastTimer.current);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [filters, setSearchParams]);

  // Load listings with enhanced error handling
  const loadListings = async (pageNum = 1, reset = false) => {
    if (!authChecked) return;

    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const queryParams = {
        page: pageNum,
        limit: 12,
        status: "active",
        ...filters,
      };

      // Clean up empty filters
      Object.keys(queryParams).forEach((key) => {
        if (
          queryParams[key] === "" ||
          queryParams[key] === null ||
          queryParams[key] === undefined
        ) {
          delete queryParams[key];
        }
      });

      const response = await AgrimarketService.ListingService.listListings(
        queryParams
      );

      // Handle different response structures
      const listingsData =
        response?.data || response?.listings || response || [];
      const total = response?.total || response?.count || listingsData.length;

      if (reset) {
        setListings(Array.isArray(listingsData) ? listingsData : []);
      } else {
        setListings((prev) => [
          ...prev,
          ...(Array.isArray(listingsData) ? listingsData : []),
        ]);
      }

      setTotalCount(total);
      setHasMore(listingsData.length === 12); // Assuming 12 items per page
      setPage(pageNum);
    } catch (error) {
      console.error("Error loading listings:", error);
      showToast("Failed to load listings. Please try again.", "error");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and filter changes
  useEffect(() => {
    loadListings(1, true);
  }, [filters, authChecked]);

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      location: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      status: "active",
      featured: false,
      verifiedOnly: false,
      inStockOnly: false,
      rating: "",
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadListings(1, true);
  };

  // Add to cart handler
  const addToCart = async (listingId) => {
    if (!user) {
      showToast("Please login to add items to cart", "error");
      navigate("/auth/v1/app/guest/AgriSupport/token");
      return;
    }

    try {
      setAddingToCart((prev) => ({ ...prev, [listingId]: true }));
      await AgrimarketService.CartService.addItem(listingId, 1);
      showToast("Added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast(error?.message || "Failed to add to cart", "error");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [listingId]: false }));
    }
  };

  // Utility functions
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const getCategoryDisplayName = (category) => {
    const found = categoryData.find((cat) => cat.value === category);
    return found ? found.name : category;
  };

  const getCategoryColor = (category) => {
    const found = categoryData.find((cat) => cat.value === category);
    return found ? found.color : "from-gray-500 to-gray-700";
  };

  const getCategoryBgColor = (category) => {
    const found = categoryData.find((cat) => cat.value === category);
    return found ? found.bgColor : "bg-gray-50 dark:bg-gray-900/20";
  };
  const urlimage = (imagePath) => {
    if(imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };
  // Enhanced Listing Card Component
  const ListingCard = ({ listing }) => {
    const product = listing.product || {};
    const hasCertification = product.specs?.certification;
    const harvestDate = product.specs?.harvestDate;

    return (
      <div className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden transform hover:-translate-y-1">
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
          {product?.images?.[0] ? (
            <img
              src={urlimage(product.images[0])}
              alt={product?.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center text-gray-400 ${
              product?.images?.[0] ? "hidden" : "flex"
            }`}
          >
            <FaSeedling className="text-4xl mb-2 opacity-50" />
            <span className="text-sm">No Image</span>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`bg-gradient-to-r ${getCategoryColor(
                product.category
              )} text-white px-2 py-1 rounded-full text-xs font-medium`}
            >
              {getCategoryDisplayName(product.category)}
            </span>
          </div>

          {/* Stock Badge */}
          <div className="absolute top-3 right-3">
            <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
              Stock: {listing.availableQty}
            </span>
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={() => navigate(`/listing/${listing._id}`)}
                className="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
              >
                <FaEye className="text-sm" />
              </button>
              <button className="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <FaHeart className="text-sm" />
              </button>
              <button className="bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                <FaShare className="text-sm" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1 flex-1 text-lg">
              {product?.title || "Product Name"}
            </h3>
            <div className="flex items-center text-amber-400 ml-2">
              <FaStar className="text-sm" />
              <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
                {product.rating || "4.8"}
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 min-h-[40px] leading-relaxed">
            {listing?.description ||
              product?.description ||
              "High quality farm produce directly from trusted farmers"}
          </p>

          {/* Product Specifications */}
          <div className="space-y-2 mb-4">
            {hasCertification && (
              <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                <FaCertificate className="mr-1" />
                <span>{product.specs.certification}</span>
              </div>
            )}

            {harvestDate && (
              <div className="flex items-center text-xs text-green-600 dark:text-green-400">
                <FaCalendarAlt className="mr-1" />
                <span>
                  Harvested: {new Date(harvestDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {listing.location?.district && (
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <FaMapMarkerAlt className="mr-1" />
                <span>
                  {listing.location.district}, {listing.location.state}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {/* <FaRupeeSign className="text-emerald-600 dark:text-emerald-400 mr-1" /> */}
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xl">
                {formatPrice(listing.pricePerUnit)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                /{product?.unit?.toLowerCase() || "unit"}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-full mb-1">
                Min Order: {listing.minOrderQty} {product.unit}
              </span>
              {listing.availableQty < 10 && (
                <span className="text-xs text-red-600 dark:text-red-400">
                  Low Stock!
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              to={`/harvestLink/listing/${listing._id}`}
              className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
            >
              <FaEye className="mr-2" />
              View Details
            </Link>

            <button
              onClick={() => addToCart(listing._id)}
              disabled={
                addingToCart[listing._id] ||
                listing.availableQty < listing.minOrderQty
              }
              className="flex-1 flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:shadow-none"
            >
              {addingToCart[listing._id] ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaShoppingCart className="mr-2" />
              )}
              {listing.availableQty < listing.minOrderQty
                ? "Out of Stock"
                : addingToCart[listing._id]
                ? "Adding..."
                : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Loading Skeleton
  const ListingSkeleton = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-slate-700"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-3"></div>
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded mb-4 w-3/4"></div>
        <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded mb-4"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-10 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
          <div className="flex-1 h-10 bg-gray-200 dark:bg-slate-700 rounded-xl"></div>
        </div>
      </div>
    </div>
  );

  // Empty State Component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
        <FaSeedling className="text-5xl text-gray-400" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        No Listings Found
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
        {filters.search || filters.category
          ? "Try adjusting your search criteria or browse different categories."
          : "No listings available at the moment. Check back later for new arrivals."}
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={clearFilters}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
        >
          Clear Filters
        </button>
        <Link
          to="/harvestLink/browse"
          className="px-6 py-3 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl font-semibold transition-all"
        >
          Browse All
        </Link>
      </div>
    </div>
  );

  return (
    <div className="mt-20 min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20">
     <CartBar />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Browse Listings
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Discover {totalCount.toLocaleString()} quality products from
                trusted farmers
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-2xl px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <FaSortAmountDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-3 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-2xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all"
              >
                <FaFilter className="mr-2" />
                Filters
                {Object.values(filters).filter(
                  (val) =>
                    val &&
                    val !== "" &&
                    val !== "createdAt" &&
                    val !== "desc" &&
                    val !== "active"
                ).length > 0 && (
                  <span className="ml-2 bg-emerald-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {
                      Object.values(filters).filter(
                        (val) =>
                          val &&
                          val !== "" &&
                          val !== "createdAt" &&
                          val !== "desc" &&
                          val !== "active"
                      ).length
                    }
                  </span>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div
              className={`lg:w-80 flex-shrink-0 ${
                showFilters ? "block" : "hidden lg:block"
              }`}
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
                  >
                    Clear All
                  </button>
                </div>

                {/* Categories Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Categories
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {categoryData.map((category) => (
                      <button
                        key={category.value}
                        onClick={() =>
                          handleFilterChange(
                            "category",
                            filters.category === category.value
                              ? ""
                              : category.value
                          )
                        }
                        className={`flex items-center justify-between w-full p-3 rounded-xl text-left transition-all ${
                          filters.category === category.value
                            ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
                            : "bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`w-8 h-8 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center mr-3`}
                          >
                            <category.icon className="text-white text-sm" />
                          </div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {category.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Price Range
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Min Price
                      </label>
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          handleFilterChange("minPrice", e.target.value)
                        }
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Max Price
                      </label>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          handleFilterChange("maxPrice", e.target.value)
                        }
                        placeholder="10000"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                <CartBar />
                {/* Additional Filters */}
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) =>
                        handleFilterChange("featured", e.target.checked)
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Featured Listings
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.verifiedOnly}
                      onChange={(e) =>
                        handleFilterChange("verifiedOnly", e.target.checked)
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      Verified Farmers Only
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        handleFilterChange("inStockOnly", e.target.checked)
                      }
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">
                      In Stock Only
                    </span>
                  </label>
                </div>

                {/* Location Filter */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Location
                  </h4>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder="Enter city or state"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Listings Grid */}
            <div className="flex-1">
              {/* Active Filters */}
              <div className="flex flex-wrap gap-2 mb-6">
                {filters.search && (
                  <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200 rounded-full text-sm">
                    Search: "{filters.search}"
                    <button
                      onClick={() => handleFilterChange("search", "")}
                      className="ml-2 hover:text-emerald-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.category && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    Category: {getCategoryDisplayName(filters.category)}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="ml-2 hover:text-blue-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm">
                    Price: {filters.minPrice || "0"} - {filters.maxPrice || "∞"}
                    <button
                      onClick={() => {
                        handleFilterChange("minPrice", "");
                        handleFilterChange("maxPrice", "");
                      }}
                      className="ml-2 hover:text-purple-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
                {filters.featured && (
                  <span className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 rounded-full text-sm">
                    Featured
                    <button
                      onClick={() => handleFilterChange("featured", false)}
                      className="ml-2 hover:text-orange-600"
                    >
                      <FaTimes className="text-xs" />
                    </button>
                  </span>
                )}
              </div>

              {/* Results Grid */}
              {loading && page === 1 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <ListingSkeleton key={idx} />
                  ))}
                </div>
              ) : listings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {listings.map((listing) => (
                      <ListingCard key={listing._id} listing={listing} />
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="text-center mt-12">
                      <button
                        onClick={() => loadListings(page + 1)}
                        disabled={loading}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-2xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
                      >
                        {loading ? (
                          <div className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Loading...
                          </div>
                        ) : (
                          "Load More Listings"
                        )}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Toast Message */}
      {message && (
        <div
          className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-2xl shadow-2xl font-semibold text-white transition-all duration-300 ${
            message.type === "error" ? "bg-red-500" : "bg-emerald-500"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
