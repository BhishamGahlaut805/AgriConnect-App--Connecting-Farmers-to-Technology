// File: FixedOrders.jsx
import React, { useEffect, useState } from "react";
import AgrimarketService from "../../API/AgrimarketService";
const orderService = AgrimarketService.OrderService;
import {
  FaBox,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaSearch,
  FaRupeeSign,
  FaEye,
  FaDownload,
} from "react-icons/fa";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.my();
      setOrders(response.success ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FaBox className="text-yellow-500" />;
      case "confirmed":
        return <FaInfoCircle className="text-blue-500" />;
      case "shipped":
        return <FaShippingFast className="text-indigo-500" />;
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="mt-12 container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-indigo-900 dark:text-indigo-100 mb-4 md:mb-0">
          My Orders
        </h2>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-md">
          <div className="text-indigo-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            {filter === "all" ? "No orders yet" : `No ${filter} orders`}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === "all"
              ? "Your orders will appear here once you make a purchase."
              : `You don't have any ${filter} orders at the moment.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center">
                    <span className="mr-2">{getStatusIcon(order.status)}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mt-2 text-gray-800 dark:text-white">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 text-right">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-end">
                    <FaRupeeSign className="mr-1" />
                    {order.amount || order.totalAmount}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {order.items.length} item(s)
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Items:
                </h4>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.quantity} x {item.product?.name || "Product"}
                      </span>
                      <span className="text-gray-800 dark:text-gray-200">
                        ₹{(item.price || item.pricePerUnit) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="mb-4 sm:mb-0">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">
                    Delivery Address:
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {order.shippingAddress?.addressLine1},{" "}
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm flex items-center"
                  >
                    <FaEye className="mr-2" /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl mx-4">
            <h3 className="text-xl font-semibold mb-4">Order Details</h3>
            <div className="space-y-4">
              <p>
                <strong>Order ID:</strong> {selectedOrder._id}
              </p>
              <p>
                <strong>Status:</strong> {selectedOrder.status}
              </p>
              <p>
                <strong>Total Amount:</strong> ₹
                {selectedOrder.amount || selectedOrder.totalAmount}
              </p>
              <p>
                <strong>Order Date:</strong>{" "}
                {new Date(selectedOrder.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
