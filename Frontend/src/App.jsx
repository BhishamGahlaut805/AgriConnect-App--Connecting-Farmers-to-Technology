import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Pages/Authentication";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "./Util/ThemeContext";
import FarmerDashboard from "./Pages/FarmerDashboard";
import ProtectedRoute from "./Components/ProtectedRoute";
import Unauthorized from "./Components/Unauthorized";
import CropDiseasePage from "./Pages/CropDiseasePage";
import YieldPredictionPage from "./Pages/CropYieldPage";
import WeatherPage from "./Pages/WeatherPage";
import Home from "./Pages/HarvestLink/Home";
import Browse from "./Pages/HarvestLink/Browse";
import MyProducts from "./HarvestLink/MyProducts";
import Cart from "./Pages/HarvestLink/Cart";
import CreateProduct from "./Pages/HarvestLink/CreateProduct";
import CreateListing from "./Pages/HarvestLink/CreateListing";
import Orders from "./Pages/HarvestLink/Orders";
import MyListings from "./Pages/HarvestLink/MyListing";
import WeedDetectionPage from "./Pages/WeedDetection/CropDashboard";
import AgriConnectFlowchart from "./Pages/flowchart";
import HomeAgribot from "./Pages/Agribot/Home";
import ChatPage from "./Pages/Agribot/chatPage";
import AdminPage from "./Pages/Agribot/AdminPage";

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
              {/* Public Routes */}
              {/* <Route path="/" element={<Home />} /> */}
              <Route
                path="/auth/v1/app/:id/AgriSupport/:token"
                element={<Login />}
              />
              <Route path="/crop-disease" element={<CropDiseasePage />} />
              <Route path="/crop-yield" element={<YieldPredictionPage />} />
              <Route path="/weather" element={<WeatherPage />} />
              <Route path="/harvestLink/v1/agriConnect" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/WeedDetection" element={<WeedDetectionPage />} />
              <Route path="/flowchart" element={<AgriConnectFlowchart />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes - Require Authentication */}
              <Route path="/agribot"
              element={<ProtectedRoute><HomeAgribot /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />

              {/* To do to make it accessible only to admin */}
              <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />

              <Route
                path="/dashboard/:userid"
                element={
                  <ProtectedRoute>
                    <FarmerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-products"
                element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-product"
                element={
                  // <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                  <CreateProduct />
                  // </ProtectedRoute>
                }
              />
              <Route
                path="/create-listing"
                element={
                  <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                    <CreateListing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-listings"
                element={
                  <ProtectedRoute requiredRoles={["farmer", "trader", "admin"]}>
                    <MyListings />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
            <Footer />
          </BrowserRouter>
        </GoogleOAuthProvider>
      </ThemeProvider>
    </div>
  );
}

export default App;
