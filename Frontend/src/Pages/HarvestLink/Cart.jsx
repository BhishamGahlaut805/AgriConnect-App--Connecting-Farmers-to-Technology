import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import Loader from "../../Components/LoadingSkeleton";
import CartNav from "./CartNav";
import CartHero from "./CartHero";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingBag,
  FaArrowLeft,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

const cartService = AgrimarketService.CartService;

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cartService.getCart();
      setCart(response.cart);
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
      setUpdatingItemId(listingId);
      await cartService.updateItem(listingId, newQuantity);
      await fetchCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
      setError(err.message || "Failed to update quantity");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (listingId) => {
    try {
      setUpdatingItemId(listingId);
      await cartService.removeItem(listingId);
      await fetchCart();
    } catch (err) {
      console.error("Failed to remove item:", err);
      setError(err.message || "Failed to remove item");
    } finally {
      setUpdatingItemId(null);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mt-4 min-h-screen bg-gradient-to-br from-yellow-100 via-green-100 to-yellow-200 dark:from-gray-900 dark:via-slate-900 dark:to-black pt-20 pb-16">
      {/* Header */}
      <div className="flex justify-end mr-12">
        <CartNav />
      </div>
      <CartHero />
      <div className="container mx-auto px-6">
        <div className="flex items-center mb-10">
          {/* <Link
            to="/harvestLink/browse"
            className="flex items-center text-yellow-700 dark:text-yellow-400 hover:underline font-medium transition-all"
          >
            <FaArrowLeft className="mr-2" /> Continue Shopping
          </Link> */}
        </div>
        <div className="max-w-7xl mx-auto my-6">
          <div className="relative flex items-center justify-center bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-2xl shadow-lg overflow-hidden py-6 px-8">
            {/* Subtle glowing animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 opacity-30 blur-3xl animate-pulse"></div>

            <h2 className="relative text-3xl sm:text-4xl font-extrabold text-white drop-shadow-md tracking-wide text-center">
              🛍️ Thank You for Shopping With Us!
            </h2>
          </div>

          <p className="text-center text-gray-600 dark:text-gray-300 mt-4 text-lg">
            We appreciate your trust in us — your satisfaction means everything.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/40 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded flex items-center shadow-md">
            <FaExclamationTriangle className="mr-2" />
            <p>{error}</p>
          </div>
        )}

        {/* Empty Cart */}
        {!cart?.items?.length ? (
          <div className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-md rounded-2xl p-12 text-center shadow-2xl">
            <div className="text-yellow-400 text-6xl mb-4">
              <FaShoppingBag />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Looks like you haven’t added any items yet.
            </p>
            <Link
              to="/harvestLink/browse"
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white rounded-lg font-medium transition-all shadow-md"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-start sm:items-center hover:scale-[1.01] transition-all"
                >
                  {/* Product Image */}
                  <div className="w-full sm:w-32 h-32 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex items-center justify-center mb-4 sm:mb-0">
                    {item.product?.images?.[0] ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl">🌿</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="sm:ml-6 flex-1 w-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                          {item.product?.title}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          ₹{item.listing?.pricePerUnit} per {item.product?.unit}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Added: {new Date(item.addedAt).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                          {item.listing?.description ||
                            item.product?.description}
                        </p>
                        <Link
                          to={`/harvestLink/product/${item.product?._id}`}
                          className="inline-block mt-2 text-yellow-600 dark:text-yellow-400 text-sm font-medium hover:underline"
                        >
                          View Product Details →
                        </Link>
                      </div>

                      <button
                        onClick={() => removeItem(item.listing?._id)}
                        className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                        disabled={updatingItemId === item.listing?._id}
                      >
                        {updatingItemId === item.listing?._id ? (
                          <FaSpinner className="animate-spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center bg-gray-50 dark:bg-slate-700 rounded-lg shadow-inner">
                        <button
                          onClick={() =>
                            updateQuantity(item.listing?._id, item.qty - 1)
                          }
                          className="w-10 h-10 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-l-lg transition"
                          disabled={
                            updatingItemId === item.listing?._id ||
                            item.qty <= 1
                          }
                        >
                          <FaMinus />
                        </button>
                        <span className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800">
                          {item.qty}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.listing?._id, item.qty + 1)
                          }
                          className="w-10 h-10 text-lg font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-r-lg transition"
                          disabled={updatingItemId === item.listing?._id}
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        ₹{(item.listing?.pricePerUnit || 0) * (item.qty || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

           {/* Order Summary */}
<div className="bg-white/90 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-6 sticky top-6">
  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-5 border-b pb-2">
    Order Summary
  </h2>

  {/* Itemized Breakdown */}
  <div className="space-y-4 mb-6">
    {cart.items.map((item) => {
      const price = item.listing?.pricePerUnit || 0;
      const qty = item.qty || 0;
      const subtotal = price * qty;
      return (
        <div
          key={item._id}
          className="flex justify-between text-gray-700 dark:text-gray-300 text-sm border-b border-gray-200 dark:border-gray-600 pb-2"
        >
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-gray-100">
              {item.product?.title || item.listing?.product?.title || "Item"}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {qty} × ₹{price.toLocaleString()} = ₹{subtotal.toLocaleString()}
            </span>
          </div>
          <span className="font-semibold text-gray-800 dark:text-gray-100">
            ₹{subtotal.toLocaleString()}
          </span>
        </div>
      );
    })}
  </div>

  {/* Summary of Costs */}
  <div className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
    {/* Subtotal */}
    <div className="flex justify-between">
      <span>Subtotal</span>
      <span className="font-semibold">
        ₹
        {cart.items
          .reduce(
            (sum, i) =>
              sum + (i.listing?.pricePerUnit || 0) * (i.qty || 0),
            0
          )
          .toLocaleString()}
      </span>
    </div>

    {/* Shipping */}
    <div className="flex justify-between">
      <span>Shipping</span>
      <span className="font-semibold text-green-600">Free</span>
    </div>

    {/* Taxes */}
    <div className="flex justify-between">
      <span>Estimated Tax (5%)</span>
      <span className="font-semibold">
        ₹
        {(
          0.05 *
          cart.items.reduce(
            (sum, i) =>
              sum + (i.listing?.pricePerUnit || 0) * (i.qty || 0),
            0
          )
        ).toFixed(2)}
      </span>
    </div>

    {/* Discount */}
    <div className="flex justify-between">
      <span>Seasonal Discount</span>
      <span className="font-semibold text-red-500">− ₹150.00</span>
    </div>

    {/* Packaging Fee */}
    <div className="flex justify-between">
      <span>Packaging & Handling</span>
      <span className="font-semibold">₹50.00</span>
    </div>
  </div>

  <hr className="my-5 border-gray-300 dark:border-slate-600" />

  {/* Total */}
  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
    <span>Total</span>
    <span>
      ₹
      {(
        cart.items.reduce(
          (sum, i) =>
            sum + (i.listing?.pricePerUnit || 0) * (i.qty || 0),
          0
        ) *
          1.05 -
        150 +
        50
      ).toLocaleString()}
    </span>
  </div>

  {/* Checkout Button */}
  <Link
    to="/harvestLink/checkout"
    className="block w-full mt-6 py-3 bg-gradient-to-r from-yellow-500 to-green-500 hover:from-yellow-600 hover:to-green-600 text-white font-semibold rounded-lg shadow-lg transition-all text-center"
  >
    Proceed to Checkout
  </Link>

  {/* Notes */}
  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
    <p>
      <FaExclamationTriangle className="inline mr-1 text-yellow-500" />
      Please review your order carefully before proceeding.
    </p>
    <p className="italic mt-1">* Demo checkout — payment coming soon.</p>
  </div>
</div>
          </div>
        )}
      </div>
    </div>
  );
}
