import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./Util/ThemeContext";

// Layout Components
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";

// Authentication
import Login from "./Pages/Authentication";

// AgriConnect Pages
import AgriConnectHome from "./Pages/AgriConnectHome";
import CropDiseasePage from "./Pages/CropDiseasePage";
import YieldPredictionPage from "./Pages/CropYieldPage";
import WeatherPage from "./Pages/WeatherPage";
import WeedDetectionPage from "./Pages/WeedDetection/CropDashboard";
import AgriConnectFlowchart from "./Pages/flowchart";
import ResultPage from "./Pages/CropDiseasePage/ResultPage";

// HarvestLink Pages
import Home from "./Pages/HarvestLink/Home";
import Browse from "./Pages/HarvestLink/Browse";
import MyProducts from "./Pages/HarvestLink/MyProducts";
import Cart from "./Pages/HarvestLink/Cart";
import CreateProduct from "./Pages/HarvestLink/CreateProduct";
import CreateListing from "./Pages/HarvestLink/CreateListing";
import Orders from "./Pages/HarvestLink/Orders";
import MyListings from "./Pages/HarvestLink/MyListing";
import ViewProductAdmin from "./Pages/HarvestLink/ViewProductAdmin";
import ViewListing from "./Pages/HarvestLink/ViewListing";
import SellerDashboard from "./Pages/HarvestLink/SellerDashboard";
import UserDashboard from "./Pages/userDashboard";
import CheckOut from "./Pages/HarvestLink/CheckOut";
import AddressManager from "./Pages/HarvestLink/AddressManager";
import OrderDetails from "./Pages/HarvestLink/OrderDetail";
import PendingOrdersOTP from "./Pages/HarvestLink/PendingOrdersOTP";
import OrderOTPVerification from "./Pages/HarvestLink/OrderOTPVerification";

// Admin Pages
import AdminDashboard from "./Pages/AdminDashboard";
import PendingProducts from "./Pages/HarvestLink/PendingProducts";
import PendingListings from "./Pages/HarvestLink/PendingListing";
import UserManagement from "./Pages/HarvestLink/UserManagement";

// Agribot Pages
import HomeAgribot from "./Pages/Agribot/Home";
import ChatPage from "./Pages/Agribot/chatPage";
import AdminPage from "./Pages/Agribot/AdminPage";

// Dashboard
import FarmerDashboard from "./Pages/FarmerDashboard";

function App() {
  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <ThemeProvider>
        <GoogleOAuthProvider
          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
          onScriptLoadError={() =>
            console.error("Failed to load Google OAuth script")
          }
          onScriptLoadSuccess={() =>
            console.log("Google OAuth script loaded successfully")
          }
        >
          <BrowserRouter>
            <Navbar />
            <Routes>
              {/* ===== PUBLIC ROUTES ===== */}

              {/* Main Landing */}
              <Route path="/" element={<AgriConnectHome />} />

              {/* Authentication */}
              <Route
                path="/auth/v1/app/:id/AgriSupport/:token"
                element={<Login />}
              />

              {/* AgriConnect Features */}
              <Route path="/crop-disease" element={<CropDiseasePage />} />
              <Route path="/crop-yield" element={<YieldPredictionPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/weed-detection" element={<WeedDetectionPage />} />
              <Route path="/flowchart" element={<AgriConnectFlowchart />} />
              <Route path="/:farmId/results" element={<ResultPage />} />

              {/* HarvestLink Public Routes */}
              <Route path="/harvestLink/v1/agriConnect" element={<Home />} />
              <Route path="harvestLink/browse" element={<Browse />} />

              {/* Error Pages */}
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* ===== PROTECTED ROUTES ===== */}

              {/* HarvestLink User Routes */}
              <Route
                path="/harvestLink/my-products"
                element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/create-product"
                element={
                  <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                    <CreateProduct />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/create-listing"
                element={
                  <ProtectedRoute requiredRoles={["Farmer", "trader", "admin"]}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/addresses"
                element={
                  <ProtectedRoute>
                    <AddressManager />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/checkout"
                element={
                  <ProtectedRoute>
                    <CheckOut />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/users/orders/:orderId/verify"
                element={
                  <ProtectedRoute>
                    <OrderOTPVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/users/orders/pending"
                element={
                  <ProtectedRoute>
                    <PendingOrdersOTP />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/my-listings"
                element={
                  <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                    <MyListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/seller-dashboard"
                element={
                  <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                    <SellerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/orders/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/product/:productId"
                element={
                  // <ProtectedRoute requiredRoles={["admin", "trader", "farmer"]}>
                    <ViewProductAdmin />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/listing/:listingId"
                element={
                  // <ProtectedRoute requiredRoles={["admin", "trader", "farmer"]}>
                    <ViewListing />
                  // </ProtectedRoute>
                }
              />
              {/* HarvestLink Admin Routes */}
              <Route
                path="Admin/dashboard/:userid"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/admin/products/pending"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <PendingProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/admin/listings/pending"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <PendingListings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/harvestLink/admin/users"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />

              {/* Agribot Routes */}
              <Route
                path="/agribot"
                element={
                  <ProtectedRoute>
                    <HomeAgribot />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agribot/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/agribot/admin"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              {/* User Dashboard */}
              <Route
                path="/user/dashboard/:userid"
                element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Farmer Dashboard */}
              <Route
                path="/Farmer/dashboard/:userid"
                element={
                  <ProtectedRoute>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* ===== 404 ROUTE ===== */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        404
                      </h1>
                      <p className="text-xl text-gray-600 dark:text-gray-400">
                        Page not found
                      </p>
                    </div>
                  </div>
                }
              />
            </Routes>
            <Footer />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
