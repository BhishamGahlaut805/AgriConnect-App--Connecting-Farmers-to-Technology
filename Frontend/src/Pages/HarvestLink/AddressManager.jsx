import React, { useEffect, useState } from "react";
// Assuming the path is correct for the service
import AddressService from "../../API/AddressService";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiHome,
  FiBriefcase,
  FiAlertTriangle,
} from "react-icons/fi";
import CartBar from "./Cartbar";

// Utility function to map address type to icon
const getTypeIcon = (type) => {
  switch (type) {
    case "work":
      return <FiBriefcase className="w-4 h-4" />;
    case "home":
      return <FiHome className="w-4 h-4" />;
    default:
      return <FiMapPin className="w-4 h-4" />;
  }
};

// Component for custom confirmation dialog (replaces window.confirm)
const CustomConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-200 dark:border-gray-700">
      <FiAlertTriangle className="w-10 h-10 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {message}
      </h3>
      <div className="flex justify-center gap-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition shadow-lg"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// Component for custom error/alert dialog (replaces alert())
const CustomAlertDialog = ({ message, onClose }) => (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl max-w-sm w-full text-center border border-gray-200 dark:border-gray-700">
      <FiXCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Operation Failed
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-500 transition shadow-lg"
      >
        Close
      </button>
    </div>
  </div>
);

const ManageAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    fullName: "",
    phone: "",
    email: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home",
    isDefault: false,
  });

  // State for custom dialogs (required to replace alert/confirm)
  const [confirmState, setConfirmState] = useState({ isOpen: false, id: null });
  const [alertState, setAlertState] = useState({ isOpen: false, message: "" });

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      // NOTE: AddressService is assumed to be available at runtime.
      const res = await AddressService.getUserAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      setError(err.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // LocalStorage access is kept as per original code
  const userDetails = localStorage.getItem("userDetails");
  const user = userDetails ? JSON.parse(userDetails) : { name: "User" };

  const openModal = (address = null) => {
    setCurrentAddress(address);
    if (address) {
      setFormData({ ...address });
    } else {
      setFormData({
        label: "",
        fullName: "",
        phone: "",
        email: "",
        street: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        type: "home",
        isDefault: false,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentAddress(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentAddress) {
        // NOTE: AddressService is assumed to be available at runtime.
        await AddressService.updateAddress(currentAddress._id, formData);
      } else {
        // NOTE: AddressService is assumed to be available at runtime.
        await AddressService.createAddress(formData);
      }
      closeModal();
      fetchAddresses();
    } catch (err) {
      // Replaced alert() with CustomAlertDialog
      setAlertState({
        isOpen: true,
        message: err.message || "Failed to save address",
      });
    }
  };

  // Implementation change: Replaced window.confirm with state-driven confirmation flow
  const handleDelete = (id) => {
    setConfirmState({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    const id = confirmState.id;
    setConfirmState({ isOpen: false, id: null });
    try {
      // NOTE: AddressService is assumed to be available at runtime.
      await AddressService.deleteAddress(id);
      fetchAddresses();
    } catch (err) {
      // Replaced alert() with CustomAlertDialog
      setAlertState({
        isOpen: true,
        message: err.message || "Failed to delete address",
      });
    }
  };

  return (
    <div className="mt-36 min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <CartBar />
        {/* Header Section */}
        <header className="mb-8 border-b border-indigo-300/50 dark:border-indigo-700/50 pb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight flex items-center gap-3">
            <FiMapPin className="w-8 h-8 sm:w-10 sm:h-10" />
            Address Manager -Powered by HarvestLink
          </h1>
          <p className="mt-2 text-xl text-gray-600 dark:text-gray-300">
            Welcome,{" "}
            <span className="font-semibold text-yellow-600 dark:text-yellow-400">
              {user.name}
            </span>
            . Manage your shipping and billing locations easily.
          </p>
        </header>

        {/* Add New Button */}
        <button
          onClick={() => openModal()}
          className="mb-8 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/50 transition duration-300 transform hover:scale-[1.02] hover:bg-indigo-500 flex items-center gap-2 ring-2 ring-indigo-400/50"
        >
          <FiPlus className="w-5 h-5" /> Add New Address
        </button>

        {/* Status Messages */}
        {loading && (
          <div className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="opacity-25"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                className="opacity-75"
              />
            </svg>
            Loading addresses...
          </div>
        )}
        {error && (
          <p className="p-4 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg">
            {error}
          </p>
        )}
        {!loading && !error && addresses.length === 0 && (
          <p className="p-4 bg-gray-200 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400">
            No addresses found. Click "Add New Address" to get started!
          </p>
        )}

        {/* Address Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-6 rounded-2xl shadow-xl transition duration-300 relative overflow-hidden ${
                address.isDefault
                  ? "bg-indigo-100 dark:bg-indigo-900/50 border-2 border-indigo-500 ring-4 ring-indigo-500/30"
                  : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/80"
              }`}
            >
              {address.isDefault && (
                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold py-1 px-4 rounded-bl-xl flex items-center gap-1 shadow-lg">
                  <FiCheckCircle className="w-3 h-3" /> DEFAULT
                </div>
              )}

              {/* Address Label & Type */}
              <div className="flex justify-between items-center mb-3">
                <h3
                  className={`text-2xl font-extrabold ${
                    address.isDefault
                      ? "text-indigo-700 dark:text-indigo-300"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {address.label}
                </h3>
                <span className="capitalize text-sm font-medium px-3 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 flex items-center gap-1">
                  {getTypeIcon(address.type)} {address.type}
                </span>
              </div>

              {/* Contact Info */}
              <div className="text-gray-600 dark:text-gray-300 mb-4 space-y-1">
                <p className="font-semibold text-gray-800 dark:text-gray-100">
                  {address.fullName}
                </p>
                <p className="text-sm">📞 {address.phone}</p>
                <p className="text-sm truncate">✉️ {address.email}</p>
              </div>

              {/* Street Address */}
              <p className="text-gray-500 dark:text-gray-400 text-sm border-t border-gray-200 dark:border-gray-700 pt-3">
                {address.street}
                {address.landmark ? (
                  <span className="block text-xs italic">
                    Landmark: {address.landmark}
                  </span>
                ) : (
                  ""
                )}
                ,
                <span className="font-medium text-gray-700 dark:text-gray-200 block mt-1">
                  {address.city}, {address.state} - {address.pincode}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {address.country}
                </span>
              </p>

              {/* Actions */}
              <div className="mt-4 flex gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={() => openModal(address)}
                  className="px-3 py-1.5 bg-yellow-600 text-white rounded-lg flex items-center gap-1 hover:bg-yellow-500 transition shadow-md shadow-yellow-600/30"
                >
                  <FiEdit className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(address._id)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg flex items-center gap-1 hover:bg-red-500 transition shadow-md shadow-red-600/30"
                >
                  <FiTrash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Address Modal (Add/Edit) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-xl relative shadow-2xl border border-indigo-300 dark:border-indigo-600/50 transform transition-all scale-100">
            <h2 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
              {currentAddress ? "Edit Address" : "Add New Address"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Label & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="label"
                  placeholder="Label (e.g., Home, Work, Cabin)"
                  value={formData.label}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name (Recipient)"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              {/* Row 2: Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              {/* Row 3: Street & Landmark */}
              <input
                type="text"
                name="street"
                placeholder="Street Address / House Number"
                value={formData.street}
                onChange={handleChange}
                required
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />
              <input
                type="text"
                name="landmark"
                placeholder="Landmark (Optional)"
                value={formData.landmark}
                onChange={handleChange}
                className="w-full bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
              />

              {/* Row 4: City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  name="state"
                  placeholder="State/Region"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              {/* Row 5: Pincode & Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="pincode"
                  placeholder="Pincode (6 digits)"
                  value={formData.pincode}
                  onChange={handleChange}
                  required
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
                <input
                  type="text"
                  name="country"
                  placeholder="Country"
                  value={formData.country}
                  onChange={handleChange}
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:placeholder-gray-400"
                />
              </div>

              {/* Row 6: Type & Default Checkbox */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="bg-gray-100 text-gray-900 border border-gray-300 p-3 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
                >
                  <option value="home">Home</option>
                  <option value="work">Work</option>
                  <option value="other">Other</option>
                </select>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="h-5 w-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
                  />
                  Set as default shipping address
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition font-medium dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/40"
                >
                  <FiCheckCircle className="inline w-5 h-5 mr-1" />{" "}
                  {currentAddress ? "Update Address" : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Dialogs */}
      {confirmState.isOpen && (
        <CustomConfirmDialog
          message="Are you sure you want to permanently delete this address?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmState({ isOpen: false, id: null })}
        />
      )}

      {alertState.isOpen && (
        <CustomAlertDialog
          message={alertState.message}
          onClose={() => setAlertState({ isOpen: false, message: "" })}
        />
      )}
    </div>
  );
};

export default ManageAddresses;
