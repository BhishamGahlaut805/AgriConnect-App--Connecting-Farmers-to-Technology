import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import authService from "../API/authService";
import Tooltip from "../Components/Tooltip";
import AlertMessage from "../Components/AlertMessage";
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
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowRight,
  FaBolt,
  FaEye,
  FaEyeSlash,
  FaShieldAlt,
  FaShoppingCart,
  FaTimes,
  FaUserCircle,
  FaSeedling,
} from "react-icons/fa";
import validator from "validator";

const AuthPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeView, setActiveView] = useState("login");
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [passwordVisibility, setPasswordVisibility] = useState({
    login: false,
    register: false,
    confirmRegister: false,
    reset: false,
    confirmReset: false,
  });
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
      console.log("");

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

  const demoAccounts = {
    farmer: {
      label: "Farmer Demo",
      description: "Explore farmer-specific features and dashboards.",
      contact: "testUserEmail@email.com",
      password: "MyPassword",
      buttonLabel: "Login as Farmer",
      icon: FaSeedling,
      gradient: "from-emerald-500 via-green-500 to-lime-500",
      glow: "shadow-emerald-500/30",
    },
    admin: {
      label: "Admin Demo",
      description: "Access administrative controls and management features.",
      contact: "AgriConnectAdmin@gmail.com",
      password: "MyPassword",
      buttonLabel: "Login as Admin",
      icon: FaShieldAlt,
      gradient: "from-slate-700 via-gray-800 to-zinc-900",
      glow: "shadow-slate-500/30",
    },
    user: {
      label: "User Demo",
      description: "Experience the platform as a standard user.",
      contact: "SAMPLEUSER8059@GMAIL.COM",
      password: "Bhisham@123",
      buttonLabel: "Login as User",
      icon: FaUserCircle,
      gradient: "from-sky-500 via-cyan-500 to-blue-500",
      glow: "shadow-sky-500/30",
    },
    trader: {
      label: "Trader Demo",
      description: "Explore trader functionalities and marketplace features.",
      contact: "SampleTrader@gmail.com",
      password: "Bhisham@123",
      buttonLabel: "Login as Trader",
      icon: FaShoppingCart,
      gradient: "from-amber-500 via-orange-500 to-rose-500",
      glow: "shadow-amber-500/30",
    },
  };

  const performLogin = async ({ contact, password }) => {
    const { user } = await authService.login({ contact, password });
    localStorage.setItem("token", user.token); // use "token"
    localStorage.setItem("userDetails", JSON.stringify(user));
    window.dispatchEvent(new Event("authChange")); //  notify Navbar

    if (user.role === "admin" || user.role === "Admin") {
      setTimeout(() => navigate(`/Admin/dashboard/${user.id}`), 1500);
    } else if (user.role === "farmer" || user.role === "Farmer") {
      setTimeout(() => navigate(`/Farmer/dashboard/${user.id}`), 1500);
    } else if (user.role === "trader" || user.role === "Trader") {
      setTimeout(() => navigate(`/harvestLink/seller-dashboard`), 1500);
    } else {
      setTimeout(() => navigate(`/user/dashboard/${user.id}`), 1500);
    }

    return user;
  };

  // Check for token in URL for password reset
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setActiveView("forgot");
      setFormData((prev) => ({ ...prev, resetToken: token }));
      showAlert(
        "Password Reset",
        "Please enter your new password below",
        "success",
      );
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isDemoModalOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsDemoModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDemoModalOpen]);

  // Initialize Google Auth on component mount
  useEffect(() => {
    authService.initGoogleAuth(
      (result) => {
        setGoogleLoading(false);
        showAlert("Welcome!", "You've successfully logged in", "success");
        // console.log(result);
        // console.log("Google login successful:", result.token);
        // console.log("Google login successful:", result.contact);
        // localStorage.setItem("token", result.user.token); // use "token"
        localStorage.setItem("userDetails", JSON.stringify(result.user));
        window.dispatchEvent(new Event("authChange"));
        //Role Wise navigation for 4 people- farmer, trader, admin, other
        if (result.user.role === "admin" || result.user.role === "Admin") {
          setTimeout(
            () => navigate(`/Admin/dashboard/${result.user.id}`),
            1500,
          );
        } else if (
          result.user.role === "farmer" ||
          result.user.role === "Farmer"
        ) {
          setTimeout(
            () => navigate(`/Farmer/dashboard/${result.user.id}`),
            1500,
          );
        } else if (
          result.user.role === "trader" ||
          result.user.role === "Trader"
        ) {
          setTimeout(() => navigate(`/harvestLink/seller-dashboard`), 1500);
        } else {
          setTimeout(() => navigate(`/user/dashboard/${result.user.id}`), 1500);
        }
      },
      (error) => {
        setGoogleLoading(false);
        showAlert("Login Failed", error.message, "error");
      },
    );
  }, [navigate]);

  const showAlert = (title, message, type) => {
    setAlert({ isOpen: true, title, message, type });
    setTimeout(() => setAlert({ ...alert, isOpen: false }), 5000);
  };

  const handleDemoLogin = async (roleKey) => {
    const account = demoAccounts[roleKey];
    if (!account) return;

    setDemoLoadingRole(roleKey);
    setIsLoading(true);
    setErrors({});
    setIsDemoModalOpen(false);

    try {
      const user = await performLogin({
        contact: account.contact,
        password: account.password,
      });
      showAlert("Welcome Back!", `Hi ${user.name}!`, "success");
    } catch (err) {
      showAlert("Demo Login Failed", err.message, "error");
    } finally {
      setIsLoading(false);
      setDemoLoadingRole("");
    }
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

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const authInputClassName =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400/15";

  const passwordInputClassName =
    "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-12 text-gray-900 shadow-sm transition-all duration-300 placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/15 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400/15";

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    try {
      const user = await performLogin({
        contact: formData.email || formData.phone,
        password: formData.password,
      });
      showAlert("Welcome Back!", `Hi ${user.name}!`, "success");
      // console.log("Login successful:", user);
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
        "success",
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
        "success",
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
        formData.confirmPassword,
      );
      showAlert(
        "Password Reset!",
        "You can now login with your new password",
        "success",
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
      className="mt-20 min-h-screen bg-gradient-to-br from-green-50 via-amber-50 to-blue-50 dark:from-green-900 dark:via-gray-800 dark:to-blue-900 flex items-center justify-center p-4"
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
              <motion.button
                type="button"
                onClick={() => setIsDemoModalOpen(true)}
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="mb-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-emerald-400/60 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-sm transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-100 dark:border-emerald-400/40 dark:bg-emerald-950/30 dark:text-emerald-200"
              >
                <FaBolt className="h-4 w-4" />
                Try Demo Accounts
                <span className="text-emerald-600 dark:text-emerald-300">
                  Explore the platform instantly
                </span>
              </motion.button>
            ) : null}

            {activeView === "login" ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                variants={itemVariants}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <div className="flex items-center mb-4">
                    <label className="block text-gray-700 dark:text-gray-300">
                      <AnimatePresence>
                        {isDemoModalOpen ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="
fixed inset-0 z-50
flex items-center justify-center
px-4 py-6

bg-gradient-to-br
from-emerald-950/70
via-green-900/60
to-lime-950/70

backdrop-blur-xl
backdrop-saturate-150

animate-in fade-in duration-300

overflow-y-auto
"
                            onClick={() => setIsDemoModalOpen(false)}
                          >
                            <motion.div
                              initial={{ opacity: 0, y: 28, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 20, scale: 0.97 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 24,
                              }}
                              onClick={(event) => event.stopPropagation()}
                              className="relative w-full overflow-scroll rounded-[28px] border border-white/10 bg-white/95 shadow-2xl dark:bg-slate-900/95"
                            >
                              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(135deg,_rgba(255,255,255,0.95),_rgba(248,250,252,0.92))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_30%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(15,23,42,0.92))]" />

                              <div className="relative flex items-start justify-between gap-4 border-b border-slate-200/70 py-5 dark:border-slate-700/70 sm:px-8">
                                <div>
                                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
                                    <FaBolt className="h-full h-full" />
                                    Quick Access
                                  </div>
                                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                                    Try demo accounts without signing up
                                  </h2>
                                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                                    Choose a role and jump directly into the
                                    matching dashboard. Credentials stay hidden
                                    and the normal authentication flow is
                                    reused.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setIsDemoModalOpen(false)}
                                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                                  aria-label="Close demo accounts dialog"
                                >
                                  <FaTimes className="h-4 w-4" />
                                </button>
                              </div>

                              <div className="relative px-6 py-6 sm:px-8 sm:py-8">
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                  {Object.entries(demoAccounts).map(
                                    ([roleKey, account], index) => {
                                      const Icon = account.icon;
                                      const isLoadingCard =
                                        demoLoadingRole === roleKey;

                                      return (
                                        <motion.div
                                          key={roleKey}
                                          custom={index}
                                          variants={{
                                            hidden: {
                                              opacity: 0,
                                              y: 16,
                                              scale: 0.98,
                                            },
                                            visible: (cardIndex) => ({
                                              opacity: 1,
                                              y: 0,
                                              scale: 1,
                                              transition: {
                                                duration: 0.35,
                                                delay: cardIndex * 0.08,
                                              },
                                            }),
                                          }}
                                          initial="hidden"
                                          animate="visible"
                                          whileHover={{ y: -6, scale: 1.01 }}
                                          className={`group relative overflow-hidden rounded-3xl border border-white/60 bg-gradient-to-br ${account.gradient} p-[1px] shadow-xl ${account.glow}`}
                                        >
                                          <div className="flex h-full flex-col rounded-[23px] bg-white/95 p-5 text-slate-900 transition-colors duration-300 dark:bg-slate-950/90 dark:text-white">
                                            <div className="flex items-start justify-between gap-3">
                                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/70 text-slate-900 shadow-md ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-110 dark:bg-white/10 dark:text-white">
                                                <Icon className="h-6 w-6" />
                                              </div>
                                              <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                                                Demo
                                              </span>
                                            </div>

                                            <div className="mt-4 space-y-2">
                                              <h3 className="text-xl font-bold tracking-tight">
                                                {account.label}
                                              </h3>
                                              <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                {account.description}
                                              </p>
                                            </div>

                                            <div className="mt-6 flex-1 rounded-2xl bg-slate-50/90 p-4 dark:bg-white/5">
                                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                Instant access
                                              </p>
                                              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                                The app will sign you in and
                                                redirect to the correct role
                                                dashboard.
                                              </p>
                                            </div>

                                            <motion.button
                                              type="button"
                                              onClick={() =>
                                                handleDemoLogin(roleKey)
                                              }
                                              whileTap={{ scale: 0.98 }}
                                              disabled={
                                                isLoading ||
                                                Boolean(demoLoadingRole)
                                              }
                                              className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                                            >
                                              {isLoadingCard ? (
                                                <LoadingSpinner
                                                  size="sm"
                                                  className="mr-1"
                                                />
                                              ) : null}
                                              {account.buttonLabel}
                                              <FaArrowRight className="h-3.5 w-3.5" />
                                            </motion.button>
                                          </div>
                                        </motion.div>
                                      );
                                    },
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
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
                    className={authInputClassName}
                    placeholder="Enter email or phone"
                    autoComplete="username"
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
                  <div className="relative">
                    <input
                      type={passwordVisibility.login ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={passwordInputClassName}
                      placeholder="Enter password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("login")}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-300 dark:hover:text-green-300"
                      aria-label={
                        passwordVisibility.login
                          ? "Hide Password"
                          : "Show Password"
                      }
                      title={
                        passwordVisibility.login
                          ? "Hide Password"
                          : "Show Password"
                      }
                    >
                      {passwordVisibility.login ? (
                        <FaEyeSlash className="h-4 w-4" />
                      ) : (
                        <FaEye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
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
                key="register"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                    className={authInputClassName}
                    placeholder="Enter your full name"
                    autoComplete="name"
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
                      className={authInputClassName}
                      placeholder="Enter email"
                      autoComplete="email"
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
                      className={authInputClassName}
                      placeholder="Enter phone number"
                      autoComplete="tel"
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
                    className={authInputClassName}
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
                  {/* <option value="admin">Admin</option> */}
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
                    <div className="relative">
                      <input
                        type={passwordVisibility.register ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={passwordInputClassName}
                        placeholder="Create password (min 8 chars)"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility("register")}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-300 dark:hover:text-green-300"
                        aria-label={
                          passwordVisibility.register
                            ? "Hide Password"
                            : "Show Password"
                        }
                        title={
                          passwordVisibility.register
                            ? "Hide Password"
                            : "Show Password"
                        }
                      >
                        {passwordVisibility.register ? (
                          <FaEyeSlash className="h-4 w-4" />
                        ) : (
                          <FaEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                    <div className="relative">
                      <input
                        type={
                          passwordVisibility.confirmRegister
                            ? "text"
                            : "password"
                        }
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={passwordInputClassName}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          togglePasswordVisibility("confirmRegister")
                        }
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-300 dark:hover:text-green-300"
                        aria-label={
                          passwordVisibility.confirmRegister
                            ? "Hide Password"
                            : "Show Password"
                        }
                        title={
                          passwordVisibility.confirmRegister
                            ? "Hide Password"
                            : "Show Password"
                        }
                      >
                        {passwordVisibility.confirmRegister ? (
                          <FaEyeSlash className="h-4 w-4" />
                        ) : (
                          <FaEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
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
                key="forgot"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
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
                      <div className="relative">
                        <input
                          type={passwordVisibility.reset ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={passwordInputClassName}
                          placeholder="Enter new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("reset")}
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-300 dark:hover:text-green-300"
                          aria-label={
                            passwordVisibility.reset
                              ? "Hide Password"
                              : "Show Password"
                          }
                          title={
                            passwordVisibility.reset
                              ? "Hide Password"
                              : "Show Password"
                          }
                        >
                          {passwordVisibility.reset ? (
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                      <div className="relative">
                        <input
                          type={
                            passwordVisibility.confirmReset
                              ? "text"
                              : "password"
                          }
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={passwordInputClassName}
                          placeholder="Confirm new password"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            togglePasswordVisibility("confirmReset")
                          }
                          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-xl text-gray-500 transition-colors hover:text-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-300 dark:hover:text-green-300"
                          aria-label={
                            passwordVisibility.confirmReset
                              ? "Hide Password"
                              : "Show Password"
                          }
                          title={
                            passwordVisibility.confirmReset
                              ? "Hide Password"
                              : "Show Password"
                          }
                        >
                          {passwordVisibility.confirmReset ? (
                            <FaEyeSlash className="h-4 w-4" />
                          ) : (
                            <FaEye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
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
                        className={authInputClassName}
                        placeholder="Enter your registered email"
                        autoComplete="email"
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
