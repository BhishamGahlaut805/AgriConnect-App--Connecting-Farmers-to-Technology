// pages/MyProducts.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import AgrimarketService from "../API/AgrimarketService";
const productService=AgrimarketService.ProductService;
import Sidebar from "../Layout/Sidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaSearch,
  FaBox,
  FaSeedling,
  FaRupeeSign,
  FaFilter,
  FaSort,
} from "react-icons/fa";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user] = useState(
    JSON.parse(localStorage.getItem("userDetails") || "{}")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [msg, setMsg] = useState(null);
  const toastTimer = useRef(null);

  const showToast = (text, type = "success") => {
    setMsg({ text, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setMsg(null), 2500);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.list();
      setProducts(response.data || response);
    } catch (error) {
      console.error("Error fetching products:", error);
      showToast("Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productService.delete(productId);
      showToast("Product deleted successfully");
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error("Error deleting product:", error);
      showToast("Failed to delete product", "error");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name?.localeCompare(b.name);
      case "price":
        return (a.basePrice || 0) - (b.basePrice || 0);
      case "date":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  const ProductCard = ({ product }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4">
      <div className="h-40 bg-gray-100 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-4">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover rounded-lg"
          />
        ) : (
          <FaSeedling className="text-4xl text-gray-400" />
        )}
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
          {product.name}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {product.description || "No description available"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-indigo-600 dark:text-indigo-400 font-bold">
            <FaRupeeSign className="mr-1" />
            {product.basePrice || "0.00"}
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
              /{product.baseUnit || "unit"}
            </span>
          </div>

          <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs rounded-full">
            {product.category || "Uncategorized"}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Created: {new Date(product.createdAt).toLocaleDateString()}
          </span>

          <div className="flex space-x-2">
            <Link
              to={`/product/${product._id}`}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
              title="View"
            >
              <FaEye />
            </Link>

            <Link
              to={`/edit-product/${product._id}`}
              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg"
              title="Edit"
            >
              <FaEdit />
            </Link>

            <button
              onClick={() => handleDelete(product._id)}
              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
              title="Delete"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        user={user}
      />

      <div className="mt-16 flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/90 dark:bg-slate-800/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 mr-3 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 md:hidden"
              >
                <FaSearch />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Products
              </h1>
            </div>

            <Link
              to="/create-product"
              className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
            >
              <FaPlus className="mr-2" />
              Add Product
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {msg && (
            <div
              role="status"
              className={`fixed z-40 top-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg shadow text-sm ${
                msg.type === "error"
                  ? "bg-red-600 text-white"
                  : "bg-emerald-600 text-white"
              }`}
            >
              {msg.text}
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">All Categories</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="grains">Grains</option>
                <option value="dairy">Dairy</option>
                <option value="poultry">Poultry</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="date">Sort by Date</option>
              </select>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length} products
                </span>
              </div>
            </div>
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
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl shadow-md">
              <FaBox className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || filterCategory
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first product"}
              </p>
              <Link
                to="/create-product"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
              >
                <FaPlus className="mr-2" />
                Add Your First Product
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
