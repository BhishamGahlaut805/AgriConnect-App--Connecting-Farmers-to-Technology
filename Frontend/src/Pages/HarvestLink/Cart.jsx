import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
const cartService = AgrimarketService.CartService;
import Loader from "../../Components/LoadingSkeleton";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.get();
      setCart(response);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setError(err.message || "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (listingId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await cartService.updateItem(listingId, newQuantity);
      await fetchCart(); // Refresh cart data
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err.message || "Failed to update quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (listingId) => {
    try {
      setUpdating(true);
      await cartService.removeItem(listingId);
      await fetchCart(); // Refresh cart data
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError(err.message || "Failed to remove item");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      setUpdating(true);
      // Remove all items individually since there's no clear endpoint
      if (cart?.items) {
        for (const item of cart.items) {
          await cartService.removeItem(item.listingId || item._id);
        }
      }
      setCart(null);
    } catch (err) {
      console.error("Failed to clear cart:", err);
      setError(err.message || "Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mt-12 container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Link
          to="/browse"
          className="flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 mr-4 transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Continue Shopping
        </Link>
        <h1 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100">
          Your Cart
        </h1>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded flex items-center">
          <FaExclamationTriangle className="mr-2" />
          <p>{error}</p>
        </div>
      )}

      {!cart || !cart.items || cart.items.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-md">
          <div className="text-indigo-400 text-6xl mb-4">
            <FaShoppingBag />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/browse"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden">
              <div className="divide-y divide-gray-200 dark:divide-slate-700">
                {cart.items.map((item) => (
                  <div key={item._id} className="p-6 flex flex-col sm:flex-row">
                    <div className="w-full sm:w-24 h-24 bg-gray-100 dark:bg-slate-700 rounded-lg flex-shrink-0 mb-4 sm:mb-0 flex items-center justify-center">
                      {item.listing?.product?.images?.[0] ? (
                        <img
                          src={item.listing.product.images[0]}
                          alt={item.listing.product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="text-2xl text-gray-400">🌾</span>
                    </div>

                    <div className="sm:ml-6 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                            {item.listing?.product?.name || "Unknown Product"}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ₹{item.pricePerUnit || 0} per{" "}
                            {item.listing?.product?.baseUnit || "unit"}
                          </p>
                          {item.listing?.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {item.listing.description}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.listingId || item._id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-2 transition-colors disabled:opacity-50"
                          disabled={updating}
                        >
                          {updating ? (
                            <FaSpinner className="animate-spin" />
                          ) : (
                            <FaTrash />
                          )}
                        </button>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.listingId || item._id,
                                item.quantity - 1
                              )
                            }
                            className="w-10 h-10 border border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            disabled={updating || item.quantity <= 1}
                          >
                            <FaMinus className="text-sm" />
                          </button>
                          <span className="mx-4 font-medium text-gray-700 dark:text-gray-300">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.listingId || item._id,
                                item.quantity + 1
                              )
                            }
                            className="w-10 h-10 border border-gray-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            disabled={updating}
                          >
                            <FaPlus className="text-sm" />
                          </button>
                        </div>

                        <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                          ₹{(item.pricePerUnit || 0) * (item.quantity || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center transition-colors disabled:opacity-50"
                disabled={updating}
              >
                {updating ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaTrash className="mr-2" />
                )}
                Clear Cart
              </button>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Subtotal
                  </span>
                  <span className="font-medium">₹{cart.subtotal || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Shipping
                  </span>
                  <span className="font-medium">₹{cart.shipping || 0}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-medium">₹{cart.tax || 0}</span>
                </div>

                <div className="border-t border-gray-200 dark:border-slate-700 pt-4 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-indigo-600 dark:text-indigo-400">
                    ₹{cart.total || 0}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  to="/checkout"
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-lg font-medium transition-colors"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
