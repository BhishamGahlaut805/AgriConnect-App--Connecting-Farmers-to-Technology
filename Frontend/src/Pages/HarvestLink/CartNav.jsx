import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaBoxOpen } from "react-icons/fa";
import AgrimarketService from "../../API/AgrimarketService";

const cartService = AgrimarketService.CartService;

const CartNav = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await cartService.getCart();
      setCart(response.cart);
    } catch (err) {
      console.error("Failed to load cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.qty, 0) || 0;
  const total = cart?.items?.reduce(
    (sum, i) => sum + (i.listing?.pricePerUnit || 0) * (i.qty || 0),
    0
  );

  return (
    <div className="relative">
      {/* Cart Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white rounded-full p-3 shadow-md transition-all"
      >
        <FaShoppingCart className="text-2xl" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-semibold px-2 py-[1px] rounded-full shadow">
            {itemCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          onMouseLeave={() => setOpen(false)}
          className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-yellow-50 to-green-50 dark:from-slate-800 dark:to-slate-900">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <FaBoxOpen className="text-yellow-500" /> My Cart
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {itemCount} item{itemCount !== 1 && "s"} • ₹{total}
            </p>
          </div>

          {/* Cart Items */}
          <div className="max-h-64 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-300 animate-pulse">
                Loading...
              </div>
            ) : cart?.items?.length ? (
              cart.items.slice(0, 3).map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
                >
                  <img
                    src={item.product?.images?.[0]}
                    alt={item.product?.title}
                    className="w-14 h-14 object-cover rounded-lg bg-gray-100 dark:bg-slate-700"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                      {item.product?.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ₹{item.listing?.pricePerUnit} × {item.qty}
                    </p>
                  </div>
                  <p className="font-semibold text-green-600 dark:text-green-400 text-sm">
                    ₹{(item.listing?.pricePerUnit || 0) * (item.qty || 0)}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-300">
                Your cart is empty.
              </div>
            )}
          </div>

          {/* Footer */}
          {cart?.items?.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
              <div className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/harvestLink/cart"
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-green-500 hover:from-yellow-500 hover:to-green-600 text-white font-semibold text-center py-2 rounded-lg transition-all"
                >
                  View Cart
                </Link>
                <Link
                  to="/harvestLink/checkout"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold text-center py-2 rounded-lg transition-all"
                >
                  Checkout
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartNav;
