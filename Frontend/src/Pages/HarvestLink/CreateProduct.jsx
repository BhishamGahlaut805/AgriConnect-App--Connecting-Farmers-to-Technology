// CreateProduct.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaUpload,
  FaCheck,
  FaTimes,
  FaArrowLeft,
  FaSeedling,
  FaInfoCircle,
  FaImage,
  FaTag,
  FaMapMarkerAlt,
  FaExclamationTriangle,
  FaRedoAlt,
} from "react-icons/fa";

/**
 * CreateProduct - full page with step validation, image handling and inline OTP verification.
 *
 * Notes:
 * - This file contains the inline OtpVerification component for simplicity.
 * - AgrimarketService.ProductService should expose:
 *    - initiateProductCreation(productArray, contact) => { verificationId }
 *    - verifyProductOTP(verificationId, otp, productData, imagesFormData) => { success, message }
 *    - resendProductOTP(verificationId) => { success, verificationId? }
 *
 * Adjust method names/shape to match your backend.
 */

const OtpVerification = ({
  verificationId,
  email,
  productData,
  images,
  onSuccess,
  onCancel,
}) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [verId, setVerId] = useState(verificationId);
  const resendTimeout = useRef(null);
  const [canResend, setCanResend] = useState(true);

  useEffect(() => {
    setVerId(verificationId);
    return () => {
      if (resendTimeout.current) clearTimeout(resendTimeout.current);
    };
  }, [verificationId]);

  const handleVerify = async (e) => {
    e?.preventDefault();
    setMsg({ text: "", type: "" });

    if (!otp || otp.trim().length < 4) {
      setMsg({ text: "Enter the correct OTP.", type: "error" });
      return;
    }

    setLoading(true);
    setMsg({ text: "Verifying OTP...", type: "info" });

    try {
      // Build a FormData to send images if your backend expects multipart
      const formData = new FormData();
      formData.append("title", productData.title);
      formData.append("description", productData.description);
      formData.append("category", productData.category);
      formData.append("price", productData.price);
      formData.append("unit", productData.unit);
      formData.append("stock", productData.stock);
      formData.append("minOrderQuantity", productData.minOrderQuantity);
      formData.append("specs", JSON.stringify(productData.specs));
      formData.append("location", JSON.stringify(productData.location));
      formData.append("otp", otp);
      formData.append("verificationId", verId);

      images.forEach((file, idx) => {
        formData.append("images", file, file.name || `image-${idx}`);
      });

      console.log("Submitting FormData as in CreateProduct: ", formData.get("verificationId"), formData.get("otp"), formData.getAll("images"));
      // call backend verify endpoint
      const res =
        await AgrimarketService.ProductService.verifyAndCreateProducts(
          verId,
          otp,
          images
        );
        console.log("OTP verify response:", res);
      // Expected: res = { success: true/false, message, productId? }
      if (res?.success) {
        setMsg({
          text: res.message || "Product created successfully.",
          type: "success",
        });
        onSuccess && onSuccess(res);
      } else {
        throw new Error(res?.message || "OTP verification failed.");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      setMsg({ text: err.message || "Failed to verify OTP", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setMsg({ text: "Resending OTP...", type: "info" });
    setCanResend(false);
    try {
      const res = await AgrimarketService.ProductService.resendProductOTP(
        verId
      );
      if (res?.success) {
        setMsg({ text: "OTP resent. Check your email.", type: "success" });
        // optionally update verificationId if backend returns a new one
        if (res.verificationId) setVerId(res.verificationId);
      } else {
        throw new Error(res?.message || "Failed to resend OTP");
      }
    } catch (err) {
      setMsg({ text: err.message || "Resend failed", type: "error" });
    } finally {
      // allow resend after 30s
      resendTimeout.current = setTimeout(() => setCanResend(true), 30000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6 border border-gray-200 max-w-2xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Verify OTP</h3>
          <p className="text-sm text-gray-600 mt-1">
            Enter the code sent to <span className="font-medium">{email}</span>
          </p>
        </div>
        <button
          onClick={() => onCancel && onCancel()}
          className="text-sm text-gray-500 hover:text-gray-700"
          title="Cancel verification"
        >
          Cancel
        </button>
      </div>

      {msg.text && (
        <div
          className={`mt-4 p-3 rounded-md text-sm ${
            msg.type === "error"
              ? "bg-red-50 text-red-700 border border-red-100"
              : msg.type === "success"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-blue-50 text-blue-700 border border-blue-100"
          }`}
        >
          {msg.text}
        </div>
      )}

      <form onSubmit={handleVerify} className="mt-4 space-y-3">
        <input
          value={otp}
          onChange={(e) =>
            setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          maxLength={6}
          inputMode="numeric"
          className="w-full text-center p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter 4-6 digit OTP"
        />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? (
              "Verifying..."
            ) : (
              <>
                <FaCheck /> Verify
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className="px-4 py-2 inline-flex items-center gap-2 border rounded-lg text-sm hover:bg-gray-100 disabled:opacity-50"
          >
            <FaRedoAlt /> Resend
          </button>
        </div>
      </form>
    </div>
  );
};

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [globalMsg, setGlobalMsg] = useState({ text: "", type: "" });
  const [currentStep, setCurrentStep] = useState(1);
  const [otpState, setOtpState] = useState(null); // { verificationId, email, productData, images }

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    unit: "kg",
    stock: "",
    minOrderQuantity: 1,
    specs: {
      certification: "",
      harvestDate: "",
      shelfLife: "",
      usageInstructions: "",
    },
    location: {
      pincode: "",
      district: "",
      state: "",
      geo: { coordinates: [] },
    },
  });

  const [images, setImages] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // object URLs

  const categories = [
    "VEGETABLE",
    "FRUIT",
    "GRAIN",
    "DAIRY",
    "MACHINERY",
    "FERTILIZER",
    "SEED",
    "PESTICIDE",
    "TOOLS",
    "OTHER",
  ];

  const units = ["kg", "g", "ton", "L", "mL", "acre", "piece", "pack", "UNIT"];

  // cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setMessage = (text, type = "error") => {
    setGlobalMsg({ text, type });
    // clear after 6 seconds for non-error messages
    if (type !== "error") {
      setTimeout(() => setGlobalMsg({ text: "", type: "" }), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("specs.")) {
      const key = name.split(".")[1];
      setFormData((p) => ({ ...p, specs: { ...p.specs, [key]: value } }));
    } else if (name.startsWith("location.")) {
      const key = name.split(".")[1];
      setFormData((p) => ({ ...p, location: { ...p.location, [key]: value } }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    setGlobalMsg({ text: "", type: "" });
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    if (files.length + images.length > 5) {
      setMessage("Maximum 5 images allowed", "error");
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        setMessage(`File ${file.name} is not an image`, "error");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage(`File ${file.name} exceeds 5MB limit`, "error");
        continue;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages((p) => [...p, ...validFiles]);
    setImagePreviews((p) => [...p, ...newPreviews]);
    e.target.value = null;
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]);

    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  // Per-step validation
  const validateStep = (step = currentStep) => {
    // Clear previous errors
    setGlobalMsg({ text: "", type: "" });

    if (step === 1) {
      if (!formData.title.trim()) {
        setMessage("Product title is required", "error");
        return false;
      }
      if (
        !formData.description.trim() ||
        formData.description.trim().length < 10
      ) {
        setMessage("Description must be at least 10 characters", "error");
        return false;
      }
      if (!formData.category) {
        setMessage("Category is required", "error");
        return false;
      }
    }

    if (step === 2) {
      if (!formData.unit) {
        setMessage("Unit of measure is required", "error");
        return false;
      }
      // other spec-level validations can go here
    }

    if (step === 3) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        setMessage("Valid price is required", "error");
        return false;
      }
      if (formData.stock === "" || Number(formData.stock) < 0) {
        setMessage("Valid stock quantity is required", "error");
        return false;
      }
      if (!formData.minOrderQuantity || Number(formData.minOrderQuantity) < 1) {
        setMessage("Minimum order quantity must be at least 1", "error");
        return false;
      }
    }

    if (step === 4) {
      if (
        !formData.location.pincode ||
        formData.location.pincode.trim().length < 3
      ) {
        setMessage("Enter a valid pincode", "error");
        return false;
      }
    }

    if (step === 5) {
      if (images.length === 0) {
        setMessage("At least one product image is required", "error");
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep((s) => Math.min(s + 1, 5));
  };

  const goPrev = () => {
    setGlobalMsg({ text: "", type: "" });
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  // Final submit initiates OTP flow, but does not finalize product until OTP verified
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps before initiating
    for (let s = 1; s <= 5; s++) {
      if (!validateStep(s)) {
        setCurrentStep(s);
        return;
      }
    }

    setLoading(true);
    setMessage("Initiating product creation and sending OTP...", "info");

    try {
      const user = JSON.parse(localStorage.getItem("userDetails") || "{}");
      if (!user?.contact) {
        throw new Error("User contact missing. Please login again.");
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock, 10),
        minOrderQuantity: parseInt(formData.minOrderQuantity, 10),
        specs: formData.specs,
        location: formData.location,
      };

      const initiation =
        await AgrimarketService.ProductService.initiateProductCreation(
          [payload],
          user.contact
        );

      if (!initiation?.verificationId) {
        throw new Error(initiation?.message || "Failed to start verification.");
      }

      setMessage(
        "OTP sent. Enter the OTP below to complete creation.",
        "success"
      );

      // Show OTP component inline
      setOtpState({
        verificationId: initiation.verificationId,
        email: user.contact,
        productData: payload,
        images,
      });
      // keep current form visible; OTP is shown below
    } catch (err) {
      console.error("init error:", err);
      setMessage(err.message || "Failed to initiate product creation", "error");
    } finally {
      setLoading(false);
    }
  };

  // Called when OTP verification completed successfully
  const handleOtpSuccess = (res) => {
    // Show success and optionally redirect to my-products after short delay
    setMessage(res.message || "Product created successfully.", "success");
    // clear form/state
    setOtpState(null);
    // optionally navigate
    setTimeout(() => {
      navigate("/harvestLink/my-products");
    }, 1200);
  };

  const stepItems = [
    { number: 1, title: "Basic Info", icon: <FaInfoCircle /> },
    { number: 2, title: "Details", icon: <FaSeedling /> },
    { number: 3, title: "Pricing", icon: <FaTag /> },
    { number: 4, title: "Location", icon: <FaMapMarkerAlt /> },
    { number: 5, title: "Images", icon: <FaImage /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button
              onClick={() => navigate("/harvestLink/my-products")}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
            >
              <FaArrowLeft className="mr-2" /> Back to Products
            </button>
            <h1 className="text-3xl font-semibold text-gray-900">
              Create New Product
            </h1>
            <p className="text-gray-600 mt-1">
              List your agricultural product for buyers to discover.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border">
          <div className="flex items-center gap-3">
            {stepItems.map((s, idx) => (
              <React.Fragment key={s.number}>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 flex items-center justify-center rounded-full border-2 ${
                        currentStep > s.number
                          ? "bg-green-600 border-green-600 text-white"
                          : currentStep === s.number
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "border-gray-300 text-gray-500"
                      }`}
                    >
                      {currentStep > s.number ? <FaCheck /> : s.icon}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{s.title}</div>
                      <div className="text-xs text-gray-500">
                        Step {s.number}
                      </div>
                    </div>
                  </div>
                </div>
                {idx < stepItems.length - 1 && (
                  <div
                    className={`w-10 h-px ${
                      currentStep > s.number ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Global message */}
        {globalMsg.text && (
          <div
            className={`p-4 rounded-md mb-6 ${
              globalMsg.type === "error"
                ? "bg-red-50 text-red-700 border border-red-100"
                : globalMsg.type === "success"
                ? "bg-green-50 text-green-700 border border-green-100"
                : "bg-blue-50 text-blue-700 border border-blue-100"
            }`}
          >
            <div className="flex items-center gap-2">
              {globalMsg.type === "error" && <FaExclamationTriangle />}
              <div>{globalMsg.text}</div>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border"
        >
          {/* Step 1 */}
          {currentStep === 1 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., Organic Wheat Seeds"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Describe the product..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </section>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Specifications
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification
                  </label>
                  <select
                    name="specs.certification"
                    value={formData.specs.certification}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Certification</option>
                    <option value="Organic Certified">Organic Certified</option>
                    <option value="Non-GMO">Non-GMO</option>
                    <option value="Fair Trade">Fair Trade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harvest Date
                  </label>
                  <input
                    type="date"
                    name="specs.harvestDate"
                    value={formData.specs.harvestDate}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shelf Life (days)
                  </label>
                  <input
                    type="number"
                    name="specs.shelfLife"
                    value={formData.specs.shelfLife}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Usage Instructions
                </label>
                <textarea
                  name="specs.usageInstructions"
                  value={formData.specs.usageInstructions}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                  placeholder="Instructions or key features..."
                />
              </div>
            </section>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h2>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit (₹) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Stock *
                  </label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Qty *
                  </label>
                  <input
                    name="minOrderQuantity"
                    type="number"
                    min="1"
                    value={formData.minOrderQuantity}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Location</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    maxLength={6}
                    placeholder="6-digit pincode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="District"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="State"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Images
              </h2>

              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <FaUpload className="mx-auto text-3xl text-gray-400 mb-3" />
                <p className="text-gray-700 mb-2">
                  Upload product images (1-5)
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PNG/JPG/JPEG. Max 5MB each.
                </p>

                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-indigo-700"
                >
                  Choose Files
                </label>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imagePreviews.map((src, i) => (
                    <div
                      key={i}
                      className="relative rounded-md overflow-hidden border"
                    >
                      <img
                        src={src}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-28 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 1}
                className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 inline-flex items-center"
                >
                  {loading ? "Processing..." : "Create Product"}
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Inline OTP verification when initiated */}
        {otpState && (
          <div className="mt-6">
            <OtpVerification
              verificationId={otpState.verificationId}
              email={otpState.email}
              productData={otpState.productData}
              images={otpState.images}
              onSuccess={handleOtpSuccess}
              onCancel={() => setOtpState(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;
