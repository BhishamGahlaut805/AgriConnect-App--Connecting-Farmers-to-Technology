import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import authService from "../API/authService";
import Tooltip from "../components/Tooltip";
import AlertMessage from "../components/AlertMessage";
import { useParams } from "react-router-dom";
import {
  GoogleIcon,
  FarmerIcon,
  LeafIcon,
  SunIcon,
  RainIcon,
  MarketIcon,
  InfoIcon,
} from "../icons/icon";
import LoadingSpinner from "../Components/LoadingSpinner";
import { motion } from "framer-motion";
import validator from "validator";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    role: "farmer",
    resetToken: searchParams.get("token") || "",
    resetEmail: "",
  });
  const { token } = useParams();

  useEffect(() => {
    // Verify token validity or set state if needed
    if (token) {
      console.log("Login token received:");

      // If you want to validate or use token, do it here
    }
  }, [token]);

  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });
  const [showTooltip, setShowTooltip] = useState(null);

  // Check for token in URL for password reset
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setActiveView("forgot");
      setFormData((prev) => ({ ...prev, resetToken: token }));
      showAlert(
        "Password Reset",
        "Please enter your new password below",
        "success"
      );
    }
  }, [searchParams]);

  // Initialize Google Auth on component mount
  useEffect(() => {
    authService.initGoogleAuth(
      (result) => {
        setGoogleLoading(false);
        showAlert("Welcome!", "You've successfully logged in", "success");
        localStorage.setItem("token", result.token); // use "token"
        localStorage.setItem("userDetails", JSON.stringify(result.user));
        window.dispatchEvent(new Event("authChange"));
        setTimeout(() => navigate(`/dashboard/${result.user.id}`), 1500);
      },
      (error) => {
        setGoogleLoading(false);
        showAlert("Login Failed", error.message, "error");
      }
    );
  }, [navigate]);

  const showAlert = (title, message, type) => {
    setAlert({ isOpen: true, title, message, type });
    setTimeout(() => setAlert({ ...alert, isOpen: false }), 5000);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "email":
        if (!validator.isEmail(value)) error = "Invalid email address";
        break;
      case "phone":
        if (value && !/^\d{10}$/.test(value))
          error = "10-digit phone number required";
        break;
      case "password":
        if (value.length < 8) error = "Minimum 8 characters required";
        break;
      case "confirmPassword":
        if (value !== formData.password) error = "Passwords don't match";
        break;
      case "resetEmail":
        if (!validator.isEmail(value)) error = "Invalid email address";
        break;
      default:
        if (!value.trim() && name !== "phone") error = "This field is required";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      const { user } = await authService.login({
        contact: formData.email || formData.phone,
        password: formData.password,
      });
      showAlert("Welcome Back!", `Hi ${user.name}!`, "success");
      localStorage.setItem("token", user.token); // use "token"
      localStorage.setItem("userDetails", JSON.stringify(user));
      window.dispatchEvent(new Event("authChange")); //  notify Navbar
      console.log("Login successful:", user);
      setTimeout(() => navigate(`/dashboard/${user.id}`), 1500);
    } catch (err) {
      showAlert("Login Failed", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      await authService.register({
        name: formData.name,
        Address: formData.address,
        contact: formData.email || formData.phone,
        password: formData.password,
        role: formData.role,
      });
      showAlert(
        "Registration Successful!",
        "You can now login with your credentials",
        "success"
      );
      setActiveView("login");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err) {
      showAlert("Registration Failed", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      await authService.forgotPassword(formData.resetEmail);
      showAlert(
        "Reset Link Sent",
        "Check your email for password reset instructions",
        "success"
      );
      setFormData((prev) => ({ ...prev, resetEmail: "" }));
    } catch (err) {
      showAlert("Request Failed", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      await authService.resetPassword(
        formData.resetToken,
        formData.password,
        formData.confirmPassword
      );
      showAlert(
        "Password Reset!",
        "You can now login with your new password",
        "success"
      );
      setActiveView("login");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
        resetToken: "",
      }));
    } catch (err) {
      showAlert("Reset Failed", err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    setGoogleLoading(true);
    setErrors({});
    window.google.accounts.id.prompt();
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-blue-50 dark:from-green-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4"
    >
      <AlertMessage
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />

      <motion.div
        variants={itemVariants}
        className="w-full max-w-6xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-green-200/50 dark:border-gray-700"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side - Visual Panel */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-green-600 via-blue-600 to-purple-600 dark:from-green-800 dark:via-blue-800 dark:to-purple-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-white/20 dark:bg-black/20 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-white/20 dark:bg-black/20 animate-pulse delay-100"></div>
            <div className="absolute top-1/4 -right-10 w-32 h-32 rounded-full bg-amber-400/30 dark:bg-amber-600/30 animate-pulse delay-200"></div>

            <div className="relative z-10 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-32 h-32 bg-white/30 dark:bg-black/30 rounded-full flex items-center justify-center mx-auto shadow-lg"
              >
                <FarmerIcon className="w-20 h-20 text-white dark:text-amber-200" />
              </motion.div>

              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold text-white mb-2"
              >
                AgriConnect
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-white/90 dark:text-amber-100 text-lg"
              >
                {activeView === "forgot"
                  ? "We'll help you reset your password"
                  : "Connecting farmers to the digital ecosystem"}
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center space-x-4"
              >
                <Tooltip content="Get personalized weather forecasts for your farm location">
                  <div className="w-12 h-12 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shadow-md">
                    <SunIcon className="w-6 h-6 text-white" />
                  </div>
                </Tooltip>

                <Tooltip content="Receive crop-specific growing advice and alerts">
                  <div className="w-12 h-12 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shadow-md">
                    <LeafIcon className="w-6 h-6 text-white" />
                  </div>
                </Tooltip>

                <Tooltip content="Access real-time market prices for your produce">
                  <div className="w-12 h-12 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shadow-md">
                    <MarketIcon className="w-6 h-6 text-white" />
                  </div>
                </Tooltip>

                <Tooltip content="Smart irrigation recommendations based on soil moisture">
                  <div className="w-12 h-12 bg-white/20 dark:bg-black/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors shadow-md">
                    <RainIcon className="w-6 h-6 text-white" />
                  </div>
                </Tooltip>
              </motion.div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col">
            <div className="flex justify-center mb-8 space-x-1">
              <button
                onClick={() => {
                  setActiveView("login");
                  setErrors({});
                }}
                className={`px-6 py-2 rounded-l-full font-medium transition-colors ${
                  activeView === "login"
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => {
                  setActiveView("register");
                  setErrors({});
                }}
                className={`px-6 py-2 font-medium transition-colors ${
                  activeView === "register"
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Register
              </button>
              <button
                onClick={() => {
                  setActiveView("forgot");
                  setErrors({});
                }}
                className={`px-6 py-2 rounded-r-full font-medium transition-colors ${
                  activeView === "forgot"
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Forgot
              </button>
            </div>

            {activeView === "login" ? (
              <motion.form
                variants={itemVariants}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center mb-1">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Email or Phone
                    </label>
                    <Tooltip content="You can login with either your email or phone number">
                      <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Enter email or phone"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveView("forgot");
                        setErrors({});
                      }}
                      className="text-sm text-green-600 dark:text-green-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Login
                </button>

                <div className="relative my-6">
                  {/* Divider */}
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                      Or continue with
                    </span>
                  </div>
                </div>

                {/* Google Button Container */}
                <div className="w-full flex justify-center">
                  {googleLoading ? (
                    <LoadingSpinner size="md" className="my-3" />
                  ) : (
                    <div
                      id="googleBtn"
                      className="w-full flex justify-center"
                      style={{
                        minHeight: "48px", // Ensures height before render
                        transition: "all 0.3s ease-in-out",
                      }}
                    ></div>
                  )}
                </div>
              </motion.form>
            ) : activeView === "register" ? (
              <motion.form
                variants={itemVariants}
                onSubmit={handleRegister}
                className="space-y-4"
              >
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <label className="block text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <Tooltip content="We'll use this for important notifications">
                        <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                      </Tooltip>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Enter email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center mb-1">
                      <label className="block text-gray-700 dark:text-gray-300">
                        Phone (Optional)
                      </label>
                      <Tooltip content="For SMS alerts and verification">
                        <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                      </Tooltip>
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <label className="block text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <Tooltip content="Used for localized weather and market data">
                      <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                    </Tooltip>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                    placeholder="Enter your address"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/*For selecting user role - "farmer", "trader", "other", "admin"*/}
                <div className="flex items-center mb-1">
                  <label className="block text-gray-700 dark:text-gray-300">
                    Select Your Role
                  </label>
                  <Tooltip content="Used for personalized recommendations">
                    <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                  </Tooltip>
                </div>
                <select
                  value={formData.role}
                  onChange={handleChange}
                  name="role"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                >
                  <option value="">Select your role</option>
                  <option value="farmer">Farmer</option>
                  <option value="trader">Trader</option>
                  <option value="other">Other</option>
                  <option value="admin">Admin</option>
                </select>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-1">
                      <label className="block text-gray-700 dark:text-gray-300">
                        Password
                      </label>
                      <Tooltip content="Minimum 8 characters, include numbers and symbols for better security">
                        <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                      </Tooltip>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Create password (min 8 chars)"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-500"
                  />
                  <label
                    htmlFor="terms"
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300"
                  >
                    I agree to the{" "}
                    <Tooltip content="Read our terms and conditions">
                      <Link
                        to="/terms"
                        className="text-green-500 hover:underline"
                      >
                        Terms
                      </Link>
                    </Tooltip>{" "}
                    and{" "}
                    <Tooltip content="Review our privacy policy">
                      <Link
                        to="/privacy"
                        className="text-green-500 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                    </Tooltip>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  Register
                </button>
              </motion.form>
            ) : (
              <motion.form
                variants={itemVariants}
                onSubmit={
                  formData.resetToken
                    ? handleResetPassword
                    : handleForgotPassword
                }
                className="space-y-4"
              >
                {formData.resetToken ? (
                  <>
                    <div className="mb-4 text-center">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Reset Your Password
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Enter your new password below
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <label className="block text-gray-700 dark:text-gray-300">
                          New Password
                        </label>
                        <Tooltip content="Choose a strong password you haven't used before">
                          <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                        </Tooltip>
                      </div>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Enter new password"
                      />
                      {errors.password && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Confirm new password"
                      />
                      {errors.confirmPassword && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <input
                      type="hidden"
                      name="resetToken"
                      value={formData.resetToken}
                    />
                  </>
                ) : (
                  <>
                    <div className="mb-4 text-center">
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">
                        Forgot Password
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Enter your email to receive a reset link
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center mb-1">
                        <label className="block text-gray-700 dark:text-gray-300">
                          Email Address
                        </label>
                        <Tooltip content="Enter the email you used to register">
                          <InfoIcon className="w-4 h-4 ml-1 text-gray-400 dark:text-gray-500" />
                        </Tooltip>
                      </div>
                      <input
                        type="email"
                        name="resetEmail"
                        value={formData.resetEmail}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                        placeholder="Enter your registered email"
                      />
                      {errors.resetEmail && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.resetEmail}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <LoadingSpinner size="sm" className="mr-2" />
                  ) : null}
                  {formData.resetToken ? "Reset Password" : "Send Reset Link"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveView("login");
                      setErrors({});
                    }}
                    className="text-sm text-green-600 dark:text-green-400 hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthPage;
