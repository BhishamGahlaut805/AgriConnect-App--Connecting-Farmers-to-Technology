// Browse.jsx
import React, { useEffect, useState, useRef} from "react";
import { useLocation, Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import Sidebar from "../../Layout/Sidebar";
import {
  FaSearch,
  FaShoppingCart,
  FaRupeeSign,
  FaStar,
  FaFilter,
  FaSeedling,
  FaEye,
  FaSpinner,
  FaTimes,
  FaSortAmountDown,
  FaBoxOpen
} from "react-icons/fa";

export default function BrowseProducts() {
  const location = useLocation();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(
    JSON.parse(localStorage.getItem("userDetails") || "{}")
  );
  const [message, setMessage] = useState({ text: "", type: "" });
  const [cartCount, setCartCount] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "-createdAt",
    limit: 20,
    page: 1,
  });

  const [activeFilters, setActiveFilters] = useState([]);
  const toastTimer = useRef(null);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMessage(null), 2500);
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const initialFilters = {
      search: params.get("search") || "",
      category: params.get("category") || "",
      minPrice: params.get("minPrice") || "",
      maxPrice: params.get("maxPrice") || "",
      sortBy: params.get("sortBy") || "-createdAt",
      limit: parseInt(params.get("limit")) || 20,
      page: parseInt(params.get("page")) || 1,
    };

    setFilters(initialFilters);
    updateActiveFilters(initialFilters);
    fetchData(initialFilters);
    loadCartCount();
  }, [location.search]);

  const updateActiveFilters = (filterParams) => {
    const active = [];
    if (filterParams.search) active.push(`Search: "${filterParams.search}"`);
    if (filterParams.category) active.push(`Category: ${filterParams.category}`);
    if (filterParams.minPrice) active.push(`Min: ₹${filterParams.minPrice}`);
    if (filterParams.maxPrice) active.push(`Max: ₹${filterParams.maxPrice}`);
    if (filterParams.sortBy !== "-createdAt") active.push(`Sorted`);

    setActiveFilters(active);
  };

  const fetchData = async (filterParams) => {
    try {
      setLoading(true);

      // Clean up filters - remove empty values
      const cleanFilters = Object.fromEntries(
        Object.entries(filterParams).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      const response = await AgrimarketService.ProductService.listProducts(cleanFilters);
      setProducts(response.data || response.products || response || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast(error.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadCartCount = async () => {
    try {
      if (AgrimarketService.AuthService.isAuthenticated()) {
        const cart = await AgrimarketService.CartService.getCart();
        setCartCount(cart.items?.length || 0);
      }
    } catch (error) {
      console.error("Error loading cart count:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateActiveFilters(newFilters);

    // Update URL without page reload
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "") params.set(k, v);
    });

    const newUrl = `/browse?${params.toString()}`;
    window.history.replaceState({}, "", newUrl);

    // Debounced search
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => fetchData(newFilters), 500);
  };

  const clearFilter = (filterType) => {
    const newFilters = { ...filters, [filterType]: "", page: 1 };
    setFilters(newFilters);
    updateActiveFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v && v !== "" && k !== filterType) params.set(k, v);
    });

    navigate(`/browse?${params.toString()}`);
  };

  const clearAllFilters = () => {
    const newFilters = {
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      sortBy: "-createdAt",
      limit: 20,
      page: 1,
    };
    setFilters(newFilters);
    setActiveFilters([]);
    navigate("/browse");
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      setAdding((prev) => ({ ...prev, [productId]: true }));
      await AgrimarketService.CartService.addItem(productId, quantity);
      showToast("Added to cart successfully");
      await loadCartCount();
    } catch (error) {
      console.error("Error adding to cart:", error);
      showToast(error.message || "Failed to add to cart", "error");
    } finally {
      setAdding((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const ProductCard = ({ product }) => (
    <div className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center overflow-hidden">
        {product?.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : null}
        <div className="flex items-center justify-center w-full h-full">
          <FaSeedling className="text-4xl text-gray-400" />
        </div>

        {product.category && (
          <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {product.category}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1">
            {product?.name || "Unnamed Product"}
          </h3>
          <div className="flex items-center text-amber-400 ml-2">
            <FaStar className="text-sm" />
            <span className="text-xs ml-1 text-gray-600 dark:text-gray-400">
              {product.rating || "4.8"}
            </span>
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 min-h-[40px]">
          {product?.description || "Fresh farm produce"}
        </p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FaRupeeSign className="text-emerald-600 dark:text-emerald-400 mr-1" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
              {product.pricePerUnit || product.price || 0}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              /{product?.baseUnit || "unit"}
            </span>
          </div>

          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">
            Min: {product.minOrderQty || 1}
          </span>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
          >
            <FaEye className="mr-2" />
            View Details
          </Link>

          <button
            onClick={() => addToCart(product._id, product.minOrderQty || 1)}
            disabled={adding[product._id]}
            className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:from-emerald-400 disabled:to-green-400 text-white rounded-lg transition-all text-sm font-medium"
          >
            {adding[product._id] ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaShoppingCart className="mr-2" />
            )}
            {adding[product._id] ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 mr-3 lg:hidden"
                >
                  <FaFilter />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Browse Products
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <Link
                  to="/cart"
                  className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <FaShoppingCart className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {message.text && (
              <div
                className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg transform transition-all duration-300 ${
                  message.type === "error"
                    ? "bg-red-500 text-white"
                    : "bg-emerald-500 text-white"
                }`}
              >
                <div className="flex items-center">
                  {message.type === "error" ? (
                    <FaSpinner className="animate-spin mr-2" />
                  ) : (
                    <FaCheckCircle className="mr-2" />
                  )}
                  {message.text}
                </div>
              </div>
            )}

            {/* Enhanced Filters Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <input
                  type="number"
                  placeholder="Min Price"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  min="0"
                  step="0.01"
                  className="px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />

                <input
                  type="number"
                  placeholder="Max Price"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  min="0"
                  step="0.01"
                  className="px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="px-3 py-3 rounded-xl border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="-createdAt">Newest First</option>
                  <option value="createdAt">Oldest First</option>
                  <option value="pricePerUnit">Price: Low to High</option>
                  <option value="-pricePerUnit">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                  <option value="-name">Name: Z to A</option>
                </select>

                <button
                  onClick={clearAllFilters}
                  className="px-4 py-3 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                  {activeFilters.map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300"
                    >
                      {filter}
                      <button
                        onClick={() => clearFilter(filter.split(':')[0].toLowerCase())}
                        className="ml-2 hover:text-emerald-600"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-80 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {products.length} products
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FaSortAmountDown className="mr-2" />
                    Sorted by {filters.sortBy === '-createdAt' ? 'newest' : filters.sortBy.includes('price') ? 'price' : 'name'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {products.length >= filters.limit && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => handleFilterChange("page", filters.page + 1)}
                      className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl font-semibold transition-all"
                    >
                      Load More Products
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <FaBoxOpen className="text-6xl text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  Try adjusting your search criteria or filters to find what you're looking for.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}