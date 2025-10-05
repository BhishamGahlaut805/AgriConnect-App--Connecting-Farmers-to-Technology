// CreateProduct.jsx
import React, { useState } from "react";
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
} from "react-icons/fa";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [currentStep, setCurrentStep] = useState(1);

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

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("specs.")) {
      const specField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        specs: { ...prev.specs, [specField]: value },
      }));
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        location: { ...prev.location, [locationField]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 5) {
      setMessage({
        text: "Maximum 5 images allowed",
        type: "error",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({
          text: `File ${file.name} exceeds 5MB limit`,
          type: "error",
        });
        return false;
      }
      if (!file.type.startsWith("image/")) {
        setMessage({
          text: `File ${file.name} is not an image`,
          type: "error",
        });
        return false;
      }
      return true;
    });

    setImages((prev) => [...prev, ...validFiles]);

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];

    URL.revokeObjectURL(newPreviews[index]);
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);

    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setMessage({ text: "Product title is required", type: "error" });
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setMessage({
        text: "Description must be at least 10 characters",
        type: "error",
      });
      return false;
    }
    if (!formData.category) {
      setMessage({ text: "Category is required", type: "error" });
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage({ text: "Valid price is required", type: "error" });
      return false;
    }
    if (!formData.stock || parseInt(formData.stock) < 0) {
      setMessage({ text: "Valid stock quantity is required", type: "error" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setMessage({ text: "Creating product...", type: "info" });

    try {
      const user = JSON.parse(localStorage.getItem("userDetails"));
      if (!user?.email) {
        throw new Error("User authentication required");
      }

      // Prepare product data
      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock: parseInt(formData.stock),
        minOrderQuantity: parseInt(formData.minOrderQuantity),
        specs: formData.specs,
        location: formData.location,
      };

      // Use OTP verification flow
      const initiation =
        await AgrimarketService.ProductService.initiateProductCreation(
          [productData],
          user.email
        );

      setMessage({
        text: "OTP sent to your email. Please verify to complete product creation.",
        type: "success",
      });

      // Redirect to OTP verification page
      navigate("/verify-product", {
        state: {
          verificationId: initiation.verificationId,
          email: user.email,
          productData: productData,
          images: images,
        },
      });
    } catch (error) {
      console.error("Product creation error:", error);
      setMessage({
        text: error.message || "Failed to create product",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Basic Info", icon: <FaInfoCircle /> },
    { number: 2, title: "Details", icon: <FaSeedling /> },
    { number: 3, title: "Pricing", icon: <FaTag /> },
    { number: 4, title: "Location", icon: <FaMapMarkerAlt /> },
    { number: 5, title: "Images", icon: <FaImage /> },
  ];

  return (
    <div className="mt-16 min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/my-products")}
              className="flex items-center text-indigo-600 hover:text-indigo-800 mb-2"
            >
              <FaArrowLeft className="mr-2" />
              Back to Products
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Create New Product
            </h1>
            <p className="text-gray-600 mt-2">
              List your agricultural products for sale
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      currentStep >= step.number
                        ? "bg-indigo-600 border-indigo-600 text-white"
                        : "border-gray-300 text-gray-500"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <FaCheck size={14} />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span className="text-xs mt-2 text-gray-600">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number
                        ? "bg-indigo-600"
                        : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-lg mb-6 ${
              message.type === "error"
                ? "bg-red-100 text-red-800 border border-red-200"
                : message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            <div className="flex items-center">
              {message.type === "error" && (
                <FaExclamationTriangle className="mr-2" />
              )}
              {message.text}
            </div>
          </div>
        )}

        {/* Product Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="e.g., Organic Wheat Seeds"
                  required
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Describe your product in detail..."
                  required
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Product Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Product Specifications
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification
                  </label>
                  <select
                    name="specs.certification"
                    value={formData.specs.certification}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shelf Life (Days)
                  </label>
                  <input
                    type="number"
                    name="specs.shelfLife"
                    value={formData.specs.shelfLife}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g., 90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit of Measure *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  >
                    {units.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
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
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Provide usage instructions or key features..."
                />
              </div>
            </div>
          )}

          {/* Step 3: Pricing & Stock */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Pricing & Inventory
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Unit (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0.01"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Stock *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Order Qty *
                  </label>
                  <input
                    type="number"
                    name="minOrderQuantity"
                    value={formData.minOrderQuantity}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Location Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="location.pincode"
                    value={formData.location.pincode}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="6-digit pincode"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    District
                  </label>
                  <input
                    type="text"
                    name="location.district"
                    value={formData.location.district}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="District"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="State"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Images */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">
                Product Images
              </h3>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaUpload className="mx-auto text-gray-400 text-3xl mb-4" />
                <p className="text-gray-600 mb-2">Upload product images</p>
                <p className="text-sm text-gray-500 mb-4">
                  Maximum 5 images, 5MB each. PNG, JPG, JPEG supported.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-indigo-700"
                >
                  Choose Files
                </label>
              </div>

              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300"
            >
              Previous
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 hover:bg-green-700 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create Product"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
