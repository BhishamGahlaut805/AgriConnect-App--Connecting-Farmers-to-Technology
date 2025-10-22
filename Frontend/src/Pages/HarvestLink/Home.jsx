// Home.jsx - Enhanced Version
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaSearch,
  FaShoppingCart,
  FaSeedling,
  FaTractor,
  FaTags,
  FaStar,
  FaShieldAlt,
  FaTruck,
  FaRupeeSign,
  FaPlus,
  FaCheckCircle,
  FaEye,
  FaSpinner,
  FaUsers,
  FaChartLine,
  FaBoxOpen,
  FaShoppingBag,
  FaStore,
  FaArrowRight,
  FaLeaf,
  FaAward,
  FaClock,
  FaHeart,
  FaShare,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCertificate,
  FaFire,
  FaRocket,
} from "react-icons/fa";
import CartNav from "./CartNav";
import CartBar from "./Cartbar"

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [freshArrivals, setFreshArrivals] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(null), 3000);
  };

  // Enhanced stats with real data
  const [stats, setStats] = useState({
    farmers: "12.5K+",
    products: "45K+",
    transactions: "189K+",
    satisfaction: "98%",
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

  // Load homepage data with enhanced error handling
  useEffect(() => {
    if (!authChecked) return;

    const loadHomeData = async () => {
      try {
        setLoading(true);

        // Fetch featured listings, fresh arrivals, and trending products
        const [featuredRes, freshRes, trendingRes] = await Promise.allSettled([
          AgrimarketService.ListingService.listListings({
            featured: true,
            limit: 12,
            status: "active",
          }),
          AgrimarketService.ListingService.listListings({
            sortBy: "-createdAt",
            limit: 12,
            status: "active",
          }),
          AgrimarketService.ProductService.listProducts({
            sortBy: "-rating",
            limit: 12,
            status: "approved",
          }),
        ]);

        // Handle listings responses
        const featuredData =
          featuredRes.status === "fulfilled"
            ? featuredRes.value.data ||
              featuredRes.value.listings ||
              featuredRes.value ||
              []
            : [];

        const freshData =
          freshRes.status === "fulfilled"
            ? freshRes.value.data ||
              freshRes.value.listings ||
              freshRes.value ||
              []
            : [];

        // Handle products response
        const trendingData =
          trendingRes.status === "fulfilled"
            ? trendingRes.value.data ||
              trendingRes.value.products ||
              trendingRes.value ||
              []
            : [];

        setFeaturedListings(Array.isArray(featuredData) ? featuredData : []);
        setFreshArrivals(Array.isArray(freshData) ? freshData : []);
        setTrendingProducts(Array.isArray(trendingData) ? trendingData : []);
        setCategories(categoryData);
      } catch (error) {
        console.error("Error loading home data:", error);
        showToast("Failed to load content. Please try again.", "error");

        // Fallback data
        setFeaturedListings([]);
        setFreshArrivals([]);
        setTrendingProducts([]);
        setCategories(categoryData);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, [authChecked, categoryData]);

  // Search handlers
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/harvestLink/browse?search=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  const quickSearch = (query) => {
    navigate(`/harvestLink/browse?search=${encodeURIComponent(query)}`);
  };

  const searchByCategory = (category) => {
    navigate(`/harvestLink/browse?category=${encodeURIComponent(category)}`);
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
      console.log("Adding to cart:", listingId);
      await AgrimarketService.CartService.addItem(listingId, 1);
      console.log("Item added to cart successfully");
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

  // Product Card Component for trending products
  const ProductCard = ({ product }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="relative h-32 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
        {product?.images?.[0] ? (
          <img
            src={urlimage(product.images[0])}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <FaSeedling className="text-3xl text-gray-400" />
        )}
        <div className="absolute top-2 left-2">
          <span
            className={`bg-gradient-to-r ${getCategoryColor(
              product.category
            )} text-white px-2 py-1 rounded-full text-xs font-medium`}
          >
            {getCategoryDisplayName(product.category)}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
          {product.title}
        </h4>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-bold">
            {/* <FaRupeeSign className="text-sm" /> */}
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center text-amber-400 text-sm">
            <FaStar className="mr-1" />
            {product.rating || "4.8"}
          </div>
        </div>
      </div>
      {//button to view product details
      }
      <div className="p-4 pt-0">
        <Link
          to={`/harvestLink/product/${product._id}`}
          className="w-full inline-block text-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        >
          View Product
        </Link>
      </div>
    </div>
  );

  // Enhanced Category Card Component
  const CategoryCard = ({ category }) => (
    <div
      onClick={() => searchByCategory(category.value)}
      className="group bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 text-center cursor-pointer transform hover:-translate-y-1"
    >
      <div
        className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
      >
        <category.icon className="text-2xl text-white" />
      </div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">
        {category.name}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {category.count.toLocaleString()} items
      </p>
    </div>
  );

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
  const EmptyState = ({ title, description, action }) => (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <FaSeedling className="text-3xl text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      {action}
    </div>
  );

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900/20">
      {/* Navigation Header */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 fixed top-20 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaSeedling className="text-white text-lg" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-emerald-700 dark:from-white dark:to-emerald-300 bg-clip-text text-transparent">
                  HarvestLink
                </span>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex w-full">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for crops, vegetables, fruits..."
                    className="w-full pl-12 pr-4 py-3 rounded-l-2xl border border-r-0 border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-8 rounded-r-2xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <CartNav />
                  {/* <Link
                    to="/harvestLink/cart"
                    className="relative p-3 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                  >
                   Go to Cart
                  </Link> */}
                </>
              ) : (
                <div className="flex space-x-3">
                  <Link
                    to="/auth/v1/app/guest/AgriSupport/token"
                    className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/auth/v1/app/guest/AgriSupport/token"
                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="relative flex-1">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 bg-emerald-600 text-white rounded-2xl font-semibold shadow-lg"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6">
                Fresh From
                <span className="block bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  Farm to You
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Discover the finest agricultural produce directly from trusted
                farmers. Quality, freshness, and fair prices guaranteed.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {[
                  "Organic Vegetables",
                  "Fresh Fruits",
                  "Quality Grains",
                  "Farm Tools",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => quickSearch(tag)}
                    className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl border border-gray-200 dark:border-slate-600"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-6">
                <Link
                  to="/harvestLink/browse"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-2xl font-bold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center"
                >
                  Start Shopping
                  <FaArrowRight className="ml-2" />
                </Link>
                {user ? (
                  <Link
                    to="/harvestLink/create-listing"
                    className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-bold text-lg transition-all"
                  >
                    Sell Your Produce
                  </Link>
                ) : (
                  <Link
                    to="/auth/v1/app/guest/AgriSupport/token"
                    className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-bold text-lg transition-all"
                  >
                    Start Selling
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-t border-b border-gray-200 dark:border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {value}
                    </div>
                    <div className="text-sm md:text-base font-semibold text-gray-600 dark:text-gray-300 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Shop by Category
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore our wide range of farm-fresh categories
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {categories.slice(0, 8).map((category, index) => (
                <CategoryCard key={index} category={category} />
              ))}
            </div>
          </div>
        </section>
        {/** Cart Bar */}
        <CartBar />
        {/* Featured Listings */}
        <section className="py-16 bg-gray-50 dark:bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Featured Listings
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Handpicked quality from our trusted farmers
                </p>
              </div>
              <Link
                to="/harvestLink/browse?featured=true"
                className="hidden lg:flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-lg"
              >
                View all
                <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ListingSkeleton key={idx} />
                ))}
              </div>
            ) : featuredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Featured Listings"
                description="Check back later for featured agricultural listings from our trusted farmers."
                action={
                  <Link
                    to="/harvestLink/browse"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Browse All Listings
                  </Link>
                }
              />
            )}

            <div className="text-center mt-12 lg:hidden">
              <Link
                to="/harvestLink/browse?featured=true"
                className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all"
              >
                View All Featured
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Fresh Arrivals */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Fresh Arrivals
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Newly listed products from our farmers
                </p>
              </div>
              <Link
                to="/harvestLink/browse"
                className="hidden lg:flex items-center text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold text-lg"
              >
                View all
                <FaArrowRight className="ml-2" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <ListingSkeleton key={idx} />
                ))}
              </div>
            ) : freshArrivals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {freshArrivals.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Fresh Arrivals"
                description="New listings will be added soon by our farming community."
                action={
                  <Link
                    to="/harvestLink/browse"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Explore Listings
                  </Link>
                }
              />
            )}

            <div className="text-center mt-12 lg:hidden">
              <Link
                to="/harvestLink/browse"
                className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white rounded-2xl font-semibold hover:bg-emerald-700 transition-all"
              >
                Browse All Listings
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trending Products */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Trending Products
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-300">
                  Most popular among our customers
                </p>
              </div>
              <div className="flex items-center text-amber-500">
                <FaFire className="text-2xl mr-2" />
                <span className="text-lg font-semibold">Hot Picks</span>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm animate-pulse"
                  >
                    <div className="h-20 bg-gray-200 dark:bg-slate-700 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : trendingProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {trendingProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Trending Products"
                description="Popular products will appear here based on customer preferences."
                action={
                  <Link
                    to="/harvestLink/browse"
                    className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
                  >
                    Discover Products
                  </Link>
                }
              />
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Ready to Grow With Us?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers and buyers in our agricultural
              marketplace. Fresh produce, fair prices, and community support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/harvestLink/browse"
                className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-green-700 transition-all shadow-xl hover:shadow-2xl"
              >
                Start Shopping
              </Link>
              {user ? (
                <Link
                  to="/harvestLink/create-listing"
                  className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-bold text-lg transition-all"
                >
                  List Your Products
                </Link>
              ) : (
                <Link
                  to="/auth/v1/app/guest/AgriSupport/token"
                  className="px-8 py-4 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-2xl font-bold text-lg transition-all"
                >
                  Join as Farmer
                </Link>
              )}
            </div>
          </div>
        </section>
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
