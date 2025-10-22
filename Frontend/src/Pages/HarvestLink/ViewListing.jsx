// ViewListing.jsx - Modern Listing View Page
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ListingService, CartService } from "../../API/AgrimarketService";
import {
  Loader2,
  ShoppingCart,
  CheckCircle,
  Star,
  MapPin,
  Calendar,
  Shield,
  Clock,
  Users,
  ThumbsUp,
  MessageCircle,
  Share2,
  Heart,
} from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartBar from "./Cartbar";

const ViewListing = () => {
  const { productId: paramId } = useParams();
  const location = useLocation();
  const productId = paramId || window.location.pathname.split("/").pop();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [activeTab, setActiveTab] = useState("details");

  // Mock reviews data
  const [reviews] = useState([
    {
      id: 1,
      user: "Farm Equipment Co.",
      rating: 5,
      comment:
        "Consistent quality and reliable supply. Our spice manufacturing unit has been using this turmeric for 2 years.",
      date: "2025-10-12",
      likes: 8,
    },
    {
      id: 2,
      user: "Spice Exporters Ltd",
      rating: 4,
      comment:
        "Good quality product with high curcumin content as promised. Packaging could be improved for bulk orders.",
      date: "2025-10-05",
      likes: 5,
    },
  ]);

  useEffect(() => {
    const fetchListing = async () => {
      if (!productId || productId === "undefined") {
        setError("Invalid product ID in URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await ListingService.getListing(productId);
        console.log("Fetched Listing:", response?.data || response);
        setListing(response?.data?.data || response?.data);
      } catch (err) {
        setError("Failed to load listing details.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [productId, location]);

  const addToCart = async () => {
    if (!listing || adding) return;
    try {
      setAdding(true);
      console.log("Adding to cart:", listing._id);
      await CartService.addItem(listing._id, listing.minOrderQty);
      toast.success(
        <div className="flex items-center">
          <CheckCircle className="text-xl mr-2" />
          <span>"{listing.product.title}" added to cart!</span>
        </div>,
        { autoClose: 2000 }
      );
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleLike = () => {
    const likedListings = JSON.parse(
      localStorage.getItem("likedListings") || "{}"
    );

    if (isLiked) {
      delete likedListings[listing._id];
      setLikes(likes - 1);
      setIsLiked(false);
      toast.info("Removed from favorites");
    } else {
      likedListings[listing._id] = true;
      setLikes(likes + 1);
      setIsLiked(true);
      toast.success("Added to favorites!");
    }

    localStorage.setItem("likedListings", JSON.stringify(likedListings));
  };

  const shareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.product.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="animate-spin text-5xl text-green-600" />
        <p className="ml-4 text-xl text-gray-700">Loading Listing...</p>
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-20 p-10 bg-white shadow-lg max-w-lg mx-auto rounded-xl">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800">Listing Not Found</h2>
        <p className="text-gray-600 mt-2">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Go Back
        </button>
      </div>
    );

  if (!listing) return null;

  return (
    <div className="mt-40 min-h-screen bg-gray-50">
      <CartBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {listing.product.title}
              </h1>
              <p className="text-amber-100 text-lg">
                Premium quality from verified farmer
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white text-amber-800 px-4 py-2 rounded-lg flex items-center">
                <Star className="text-yellow-500 mr-1" fill="currentColor" />
                <span className="font-bold">4.8</span>
                <span className="ml-1">({reviews.length} reviews)</span>
              </div>
              <button
                onClick={toggleLike}
                className="bg-white text-amber-800 px-4 py-2 rounded-lg flex items-center hover:bg-amber-100 transition"
              >
                <Heart
                  className={`mr-1 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                {isLiked ? "Favorited" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 bg-white p-6 md:p-10 rounded-3xl shadow-2xl">
          <div className="lg:col-span-1">
            <div className="relative">
              <img
                src={listing.product.images?.[0] || "/placeholder-image.jpg"}
                alt={listing.product.title}
                className="w-full h-80 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              {listing.availableQty < 100 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Low Stock
                </span>
              )}
              <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {listing.status === "active" ? "Verified" : listing.status}
              </span>
            </div>

            {/* Farmer Info */}
            <div className="mt-6 bg-amber-50 p-4 rounded-xl border border-amber-200">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center">
                <Users className="mr-2" size={18} />
                Farmer Information
              </h3>
              <p className="text-amber-700 font-semibold">
                {listing.farmer.name}
              </p>
              <p className="text-amber-600 text-sm mt-1">Verified Farmer</p>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <Shield className="text-green-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Verified</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <Clock className="text-blue-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Fresh Stock</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <MapPin className="text-purple-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Direct from Farm</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <Calendar className="text-yellow-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Recent Harvest</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">
                    {listing.product.category}
                  </p>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    {listing.product.title}
                  </h1>
                </div>
                <button
                  onClick={shareListing}
                  className="text-gray-500 hover:text-amber-600 transition"
                >
                  <Share2 size={20} />
                </button>
              </div>

              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-5xl font-extrabold text-amber-700">
                  ₹{listing.pricePerUnit}
                </span>
                <span className="text-xl text-gray-500">
                  / {listing.product.unit}
                </span>
                {listing.availableQty > 0 ? (
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    In Stock ({listing.availableQty} {listing.product.unit}s)
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                {listing.description}
              </p>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {["details", "specifications", "reviews", "farmer"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                          activeTab === tab
                            ? "border-amber-500 text-amber-600"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="mb-8">
                {activeTab === "details" && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h3 className="font-bold text-gray-800 mb-2">
                        Product Description
                      </h3>
                      <p className="text-gray-700">
                        {listing.product.description}
                      </p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                      <h3 className="font-bold text-amber-800 mb-2">
                        Key Features
                      </h3>
                      <ul className="list-disc list-inside text-amber-700 space-y-1">
                        <li>Guaranteed high curcumin content (5%+)</li>
                        <li>Sun-cured and properly dried</li>
                        <li>Ideal for industrial spice processing</li>
                        <li>Consistent quality and reliable supply</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <strong>Category:</strong>
                      <span className="ml-2">{listing.product.category}</span>
                    </div>
                    <div className="flex items-center">
                      <strong>Available Quantity:</strong>
                      <span className="ml-2">
                        {listing.availableQty} {listing.product.unit}s
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong>Minimum Order:</strong>
                      <span className="ml-2">
                        {listing.minOrderQty} {listing.product.unit}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-amber-500" />
                      <strong>Expiry Date:</strong>
                      <span className="ml-2">
                        {new Date(
                          listing.product.specs?.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-amber-500" />
                      <strong>Harvest Date:</strong>
                      <span className="ml-2">
                        {new Date(
                          listing.product.specs?.harvestDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-2 text-amber-500" />
                      <strong>Shelf Life:</strong>
                      <span className="ml-2">
                        {listing.product.specs?.shelfLife} months
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Curcumin Content:</strong>
                      <span className="ml-2 font-semibold text-amber-700">
                        {listing.product.specs?.curcumin}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Attributes:</strong>
                      <p className="mt-1 text-gray-700">
                        {listing.product.specs?.attributes}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Recommended For:</strong>
                      <p className="mt-1 text-gray-700">
                        {listing.product.specs?.recommendedFor?.join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-800">
                        Customer Reviews ({reviews.length})
                      </h3>
                      <div className="flex items-center">
                        <Star
                          className="text-yellow-400 mr-1"
                          fill="currentColor"
                        />
                        <span className="font-bold">4.8</span>
                        <span className="ml-1 text-gray-500">
                          average rating
                        </span>
                      </div>
                    </div>

                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-gray-50 p-4 rounded-lg mb-4"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                                {review.user.charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <p className="font-semibold text-gray-800">
                                  {review.user}
                                </p>
                                <div className="flex items-center">
                                  {[...Array(5)].map((_, i) =>
                                    i < review.rating ? (
                                      <Star
                                        key={i}
                                        size={16}
                                        className="text-yellow-400"
                                        fill="currentColor"
                                      />
                                    ) : (
                                      <Star
                                        key={i}
                                        size={16}
                                        className="text-gray-300"
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500">
                              {review.date}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700">{review.comment}</p>
                          <div className="mt-3 flex items-center text-sm text-gray-500">
                            <button className="flex items-center mr-4">
                              <ThumbsUp size={16} className="mr-1" />
                              {review.likes} Helpful
                            </button>
                            <button className="flex items-center">
                              <MessageCircle size={16} className="mr-1" />
                              Reply
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-8">
                        No reviews yet. Be the first to review this listing!
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "farmer" && (
                  <div className="space-y-6">
                    <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
                      <h3 className="text-xl font-bold text-amber-800 mb-4">
                        About the Farmer
                      </h3>
                      <div className="flex items-center mb-4">
                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xl">
                          {listing.farmer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <p className="text-lg font-semibold text-amber-800">
                            {listing.farmer.name}
                          </p>
                          <p className="text-amber-600">Verified Farmer</p>
                        </div>
                      </div>
                      <p className="text-amber-700">
                        This listing comes directly from {listing.farmer.name},
                        a trusted farmer on our platform. All products are
                        sourced directly from their farm, ensuring freshness and
                        quality.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 mb-2">
                        Quality Assurance
                      </h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        <li>Direct from farm to ensure freshness</li>
                        <li>Quality verified by our team</li>
                        <li>Proper storage and handling</li>
                        <li>Transparent sourcing information</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={addToCart}
                disabled={adding || listing.availableQty === 0}
                className={`flex-1 ${
                  adding
                    ? "bg-amber-400 cursor-not-allowed"
                    : listing.availableQty === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-amber-600 hover:bg-amber-700"
                } text-white font-bold py-3 px-6 rounded-xl shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center space-x-2`}
              >
                {adding ? (
                  <Loader2 className="animate-spin text-xl" />
                ) : (
                  <ShoppingCart className="text-xl" />
                )}
                <span className="text-lg">
                  {adding
                    ? "Adding to Cart..."
                    : listing.availableQty === 0
                    ? "Out of Stock"
                    : `Add ${listing.minOrderQty} ${listing.product.unit} to Cart`}
                </span>
              </button>

              <button className="bg-white border border-amber-600 text-amber-600 hover:bg-amber-50 font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-2">
                <CheckCircle className="text-xl" />
                <span className="text-lg">Contact Farmer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewListing;
