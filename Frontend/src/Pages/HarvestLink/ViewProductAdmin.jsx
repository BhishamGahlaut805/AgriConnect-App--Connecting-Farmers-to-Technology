// ViewProduct.jsx - Modern Product View Page
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import AgrimarketService from "../../API/AgrimarketService";
import {
  FaShoppingCart,
  FaSpinner,
  FaBox,
  FaCheckCircle,
  FaTag,
  FaSeedling,
  FaUser,
  FaFilter,
  FaStar,
  FaRegStar,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLeaf,
  FaShieldAlt,
  FaClock,
  FaChartLine,
  FaUsers,
  FaComment,
  FaThumbsUp,
  FaShippingFast,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CartBar from "./Cartbar";

// Helper component for a cleaner Related Product Card
const RelatedProductCard = ({ product, urlImage }) => (
  <Link
    to={`/product/${product._id}`}
    key={product._id}
    className="block group bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-lg transition-all transform hover:scale-[1.02] overflow-hidden"
    onClick={() => window.scrollTo(0, 0)}
  >
    <div className="relative h-32 overflow-hidden">
      <img
        src={urlImage(product.images?.[0] || "")}
        alt={product.title}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-80"
      />
      <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
        Fresh
      </span>
    </div>
    <div className="p-3">
      <h4 className="text-sm font-semibold text-gray-800 truncate group-hover:text-green-600">
        {product.title}
      </h4>
      <p className="text-xs text-gray-500 flex items-center mt-1">
        <FaTag className="mr-1 text-green-400" />
        {product.category}
      </p>
      <div className="flex justify-between items-center mt-2">
        <p className="text-lg font-bold text-green-700">₹{product.price}</p>
        <p className="text-xs text-gray-500">/{product.unit}</p>
      </div>
    </div>
  </Link>
);

// Review Component
const ReviewCard = ({ review }) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(review.likes || 0);

  const handleLike = () => {
    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);

    // Store in localStorage
    const likedReviews = JSON.parse(
      localStorage.getItem("likedReviews") || "{}"
    );
    likedReviews[review.id] = !liked;
    localStorage.setItem("likedReviews", JSON.stringify(likedReviews));
  };

  // Check if already liked on component mount
  useEffect(() => {
    const likedReviews = JSON.parse(
      localStorage.getItem("likedReviews") || "{}"
    );
    setLiked(!!likedReviews[review.id]);
  }, [review.id]);

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold">
            {review.user.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="font-semibold text-gray-800">{review.user}</p>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) =>
                i < review.rating ? (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ) : (
                  <FaRegStar key={i} className="text-gray-300 text-sm" />
                )
              )}
            </div>
          </div>
        </div>
        <span className="text-xs text-gray-500">{review.date}</span>
      </div>
      <p className="mt-2 text-gray-700">{review.comment}</p>
      <div className="mt-3 flex items-center text-sm text-gray-500">
        <button
          onClick={handleLike}
          className={`flex items-center mr-4 ${
            liked ? "text-green-600" : "text-gray-500"
          }`}
        >
          {liked ? (
            <FaThumbsUp className="mr-1" />
          ) : (
            <FaThumbsUp className="mr-1" />
          )}
          {likes} Helpful
        </button>
        <button className="flex items-center">
          <FaComment className="mr-1" />
          Reply
        </button>
      </div>
    </div>
  );
};

// Add Review Component
const AddReview = ({ onAddReview }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [user, setUser] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !user.trim()) {
      toast.error("Please fill all fields and select a rating");
      return;
    }

    const newReview = {
      id: Date.now().toString(),
      user,
      rating,
      comment,
      date: new Date().toLocaleDateString(),
      likes: 0,
    };

    onAddReview(newReview);
    setRating(0);
    setComment("");
    setUser("");
    toast.success("Review added successfully!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Add Your Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Name</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Enter your name"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Rating</label>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl mr-1 focus:outline-none"
              >
                {star <= rating ? (
                  <FaStar className="text-yellow-400" />
                ) : (
                  <FaRegStar className="text-gray-300" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Your Review</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Share your experience with this product..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

const ViewProduct = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  // Mock reviews - in a real app, these would come from an API
  const mockReviews = [
    {
      id: "1",
      user: "Rajesh Kumar",
      rating: 5,
      comment:
        "Excellent product! My crops have shown significant improvement in just 2 weeks.",
      date: "2025-10-15",
      likes: 12,
    },
    {
      id: "2",
      user: "Priya Sharma",
      rating: 4,
      comment:
        "Good quality fertilizer. Packaging could be better but the product itself is effective.",
      date: "2025-10-10",
      likes: 5,
    },
    {
      id: "3",
      user: "Amit Patel",
      rating: 5,
      comment:
        "Best organic fertilizer I have used. Will definitely purchase again.",
      date: "2025-10-05",
      likes: 8,
    },
  ];

  const urlImage = useCallback(
    (imagePath) =>
      imagePath?.startsWith("http")
        ? imagePath
        : `${import.meta.env.VITE_BACKEND_URL}${imagePath}`,
    []
  );

 useEffect(() => {
   const fetchData = async () => {
     setLoading(true);
     try {
       const allResponse =
         await AgrimarketService.ProductService.listProducts();
       // console.log("All Products Response:", allResponse.data);
       const productsData = allResponse.data || [];
       setAllProducts(productsData);

       const current = productsData.find((p) => p._id === productId);
       setProduct(current);

       const cartResponse = await AgrimarketService.CartService.getCart();
       setCart(cartResponse.cart);
     } catch (err) {
       console.error(err);
       toast.error("Failed to load product details.");
     } finally {
       setLoading(false);
     }
   };
   fetchData();
 }, [productId]);

  const addToCart = async () => {
    if (!product || adding) return;
    try {
      setAdding(true);
      console.log("Adding to cart:", product._id);
      await AgrimarketService.CartService.addItem(product._id, 1);
      toast.success(
        <div className="flex items-center">
          <FaCheckCircle className="text-xl mr-2" />
          <span>"{product.title}" added to cart!</span>
        </div>,
        { autoClose: 2000 }
      );
    } catch (err) {
      toast.error(err.message || "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isFavorite) {
      const newFavorites = favorites.filter((id) => id !== productId);
      localStorage.setItem("favorites", JSON.stringify(newFavorites));
      setIsFavorite(false);
      toast.info("Removed from favorites");
    } else {
      favorites.push(productId);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setIsFavorite(true);
      toast.success("Added to favorites!");
    }
  };

  const handleAddReview = (newReview) => {
    setReviews([newReview, ...reviews]);
  };

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts.filter((p) => p._id !== product._id).slice(0, 15);
  }, [product, allProducts]);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        ).toFixed(1)
      : 4.8;

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-5xl text-green-600" />
        <p className="ml-4 text-xl text-gray-700">Loading Product...</p>
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-20 p-10 bg-white shadow-lg max-w-lg mx-auto rounded-xl">
        <FaBox className="text-6xl text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
        <p className="text-gray-600 mt-2">
          The item you are looking for may have been removed or is temporarily
          unavailable.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Go to Marketplace
        </Link>
      </div>
    );

  return (
    <div className="mt-36 min-h-screen bg-gray-50">
      <CartBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">{product.title}</h1>
              <p className="text-green-100 text-lg">
                {product.description.substring(0, 100)}...
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className="bg-white text-green-800 px-4 py-2 rounded-lg flex items-center">
                <FaStar className="text-yellow-500 mr-1" />
                <span className="font-bold">{averageRating}</span>
                <span className="ml-1">({reviews.length > 0 ? reviews.length : 0} reviews)</span>
              </div>
              <button
                onClick={toggleFavorite}
                className="bg-white text-green-800 px-4 py-2 rounded-lg flex items-center hover:bg-green-100 transition"
              >
                {isFavorite ? (
                  <FaHeart className="text-red-500 mr-1" />
                ) : (
                  <FaRegHeart className="mr-1" />
                )}
                {isFavorite ? "Favorited" : "Add to Favorites"}
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
                src={urlImage(product.images?.[0] || "")}
                alt={product.title}
                className="w-full h-80 object-cover rounded-2xl shadow-xl border-4 border-white"
              />
              {product.stock < 20 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Low Stock
                </span>
              )}
              <span className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {product.status === "approved" ? "Verified" : product.status}
              </span>
            </div>

            <div className="flex space-x-2 mt-4 overflow-x-auto">
              {product.images?.map((img, i) => (
                <img
                  key={i}
                  src={urlImage(img)}
                  alt={`${product.title}-${i}`}
                  className="h-16 w-16 object-cover rounded-lg cursor-pointer opacity-70 hover:opacity-100 transition border-2 border-gray-200"
                />
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-xl text-center">
                <FaLeaf className="text-green-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Organic</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl text-center">
                <FaShieldAlt className="text-blue-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Certified</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-xl text-center">
                <FaClock className="text-yellow-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Shelf Life: {product.specs?.shelfLife} months
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl text-center">
                <FaShippingFast className="text-purple-600 text-xl mx-auto mb-2" />
                <p className="text-sm text-gray-600">Fast Delivery</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-2 flex items-center">
                    <FaSeedling className="inline mr-1" /> {product.category}
                  </p>
                  <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                    {product.title}
                  </h1>
                </div>
                <button className="text-gray-500 hover:text-green-600 transition">
                  <FaShare className="text-xl" />
                </button>
              </div>

              <div className="flex items-baseline space-x-3 mb-6">
                <span className="text-5xl font-extrabold text-green-700">
                  ₹{product.price}
                </span>
                <span className="text-xl text-gray-500">/ {product.unit}</span>
                {product.stock > 0 ? (
                  <span className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                    In Stock
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Rating Summary */}
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  {[...Array(5)].map((_, i) =>
                    i < Math.floor(averageRating) ? (
                      <FaStar key={i} className="text-yellow-400" />
                    ) : (
                      <FaRegStar key={i} className="text-gray-300" />
                    )
                  )}
                  <span className="ml-2 font-bold text-gray-700">
                    {averageRating}
                  </span>
                </div>
                <span className="text-gray-500">
                  ({reviews.length > 0 ? reviews.length : 12} reviews)
                </span>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                  {["description", "specifications", "reviews", "usage"].map(
                    (tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                          activeTab === tab
                            ? "border-green-500 text-green-600"
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
                {activeTab === "description" && (
                  <div>
                    <p className="text-gray-700 text-lg mb-6 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                      <h3 className="font-bold text-green-800 mb-2 flex items-center">
                        <FaChartLine className="mr-2" />
                        Key Benefits
                      </h3>
                      <ul className="list-disc list-inside text-green-700 space-y-1">
                        <li>Improves soil fertility and structure</li>
                        <li>Boosts microbial activity in soil</li>
                        <li>Enhances crop yield sustainably</li>
                        <li>Reduces dependency on chemical inputs</li>
                        <li>Suitable for all major crops</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "specifications" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center">
                      <FaLeaf className="text-green-500 mr-2" />
                      <strong>Category:</strong>
                      <span className="ml-2">{product.category}</span>
                    </div>
                    <div className="flex items-center">
                      <FaBox className="text-green-500 mr-2" />
                      <strong>Stock:</strong>
                      <span className="ml-2">
                        {product.stock} {product.unit}s
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaTag className="text-green-500 mr-2" />
                      <strong>Minimum Order:</strong>
                      <span className="ml-2">
                        {product.minOrderQuantity} {product.unit}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-green-500 mr-2" />
                      <strong>Expiry Date:</strong>
                      <span className="ml-2">
                        {new Date(
                          product.specs?.expiryDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-green-500 mr-2" />
                      <strong>Harvest Date:</strong>
                      <span className="ml-2">
                        {new Date(
                          product.specs?.harvestDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaShieldAlt className="text-green-500 mr-2" />
                      <strong>Certification:</strong>
                      <span className="ml-2">
                        {product.specs?.certification}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaClock className="text-green-500 mr-2" />
                      <strong>Shelf Life:</strong>
                      <span className="ml-2">
                        {product.specs?.shelfLife} months
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-green-500 mr-2" />
                      <strong>Location:</strong>
                      <span className="ml-2">
                        {product.location?.district}, {product.location?.state}
                      </span>
                    </div>
                    <div className="md:col-span-2 flex items-center">
                      <FaUsers className="text-green-500 mr-2" />
                      <strong>Recommended For:</strong>
                      <span className="ml-2">
                        {product.specs?.recommendedFor?.join(", ")}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <strong>Attributes:</strong>
                      <p className="mt-1 text-gray-700">
                        {product.specs?.attributes}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "reviews" && (
                  <div>
                    <div className="mb-6">
                      <AddReview onAddReview={handleAddReview} />
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Customer Reviews ({reviews.length})
                      </h3>
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No reviews yet. Be the first to review this product!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "usage" && (
                  <div>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-6">
                      <h3 className="font-bold text-blue-800 mb-2">
                        Usage Instructions
                      </h3>
                      <p className="text-blue-700">
                        {product.specs?.usageInstructions}
                      </p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                      <h3 className="font-bold text-yellow-800 mb-2">
                        Storage Guidelines
                      </h3>
                      <ul className="list-disc list-inside text-yellow-700 space-y-1">
                        <li>
                          Store in a cool, dry place away from direct sunlight
                        </li>
                        <li>Keep container tightly closed when not in use</li>
                        <li>Avoid contact with moisture to prevent clumping</li>
                        <li>Keep out of reach of children and pets</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={addToCart}
                disabled={adding || product.stock === 0}
                className={`flex-1 ${
                  adding
                    ? "bg-green-400 cursor-not-allowed"
                    : product.stock === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } text-white font-bold py-3 px-6 rounded-xl shadow-lg transition transform hover:scale-[1.01] flex items-center justify-center space-x-2`}
              >
                {adding ? (
                  <FaSpinner className="animate-spin text-xl" />
                ) : (
                  <FaShoppingCart className="text-xl" />
                )}
                <span className="text-lg">
                  {adding
                    ? "Adding to Cart..."
                    : product.stock === 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </span>
              </button>

              <button className="bg-white border border-green-600 text-green-600 hover:bg-green-50 font-bold py-3 px-6 rounded-xl shadow-lg transition flex items-center justify-center space-x-2">
                <FaCheckCircle className="text-xl" />
                <span className="text-lg">Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        <hr className="my-12 border-gray-200" />

        {/* Related Products */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
            <FaFilter className="text-green-500 mr-3" /> Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {relatedProducts.length ? (
              relatedProducts.map((rp) => (
                <RelatedProductCard
                  key={rp._id}
                  product={rp}
                  urlImage={urlImage}
                />
              ))
            ) : (
              <p className="text-lg text-gray-500 col-span-5 text-center">
                No related products found.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProduct;
