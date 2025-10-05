import { Link } from "react-router-dom";
import { useCart } from "../Context/cartContext";
import Button from "../ui/Button";
import { formatCurrency } from "../utils/formatters";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = async (e) => {
    e.preventDefault();
    await addToCart(product._id, 1);
  };

  return (
    <Link
      to={`/products/${product._id}`}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        {product.images?.[0] ? (
          <img
            src={product.images[0].url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-400">No image</span>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-2 line-clamp-2">
          {product.description || "No description"}
        </p>

        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(product.pricePerUnit)}
          </span>
          <Button size="sm" onClick={handleAddToCart} className="ml-2">
            Add to Cart
          </Button>
        </div>
      </div>
    </Link>
  );
}
