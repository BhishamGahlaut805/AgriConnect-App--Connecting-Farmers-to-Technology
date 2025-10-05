import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../Context/authContext";
import { useCart } from "../Context/cartContext";
import Button from "../ui/Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="text-xl font-bold text-primary-600 dark:text-primary-400"
            >
              HarvestLink
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/browse"
              className="text-gray-700 dark:text-gray-300 hover:text-primary-600"
            >
              Marketplace
            </Link>

            <Link
              to="/cart"
              className="relative text-gray-700 dark:text-gray-300 hover:text-primary-600"
            >
              Cart
              {cart?.items?.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.items.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600"
                >
                  Profile
                </Link>
                <Button onClick={handleLogout} variant="outline">
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-primary-600"
                >
                  Login
                </Link>
                <Link to="/register">
                  <Button>Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
