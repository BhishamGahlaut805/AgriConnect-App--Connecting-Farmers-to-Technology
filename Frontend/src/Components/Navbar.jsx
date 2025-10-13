import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../Util/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import authService from "../API/authService";
import { generateToken, generateTokenSmall } from "../utilJs/generateToken";
import logo from "../assets/images/logo1.png";
import avatar from "../assets/images/podcast.gif";
import logoutimg from "../assets/images/logout.gif";
import translateIcon from "../assets/images/translate.gif";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [language, setLanguage] = useState("en");
  const [translateReady, setTranslateReady] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  // Sync auth state with localStorage + backend
  useEffect(() => {
    const syncAuthState = async () => {
      try {
        const token = localStorage.getItem("token");
        const storedUser = localStorage.getItem("userDetails");

        if (token && storedUser) {
          setIsLoggedIn(true);
          setUser(JSON.parse(storedUser));
        } else if (token) {
          const currentUser = await authService.getCurrentUser();
          setIsLoggedIn(true);
          setUser(currentUser);
          localStorage.setItem("userDetails", JSON.stringify(currentUser));
        } else {
          setIsLoggedIn(false);
          setUser(null);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
        handleLogout();
      }
    };

    syncAuthState();
    window.addEventListener("authChange", syncAuthState);
    return () => window.removeEventListener("authChange", syncAuthState);
  }, []);

  const handleLogin = () => {
    const token = generateToken();
    const id = generateTokenSmall();

    document.cookie = `auth_token=${token}; path=/; max-age=86400`;
    document.cookie = `role=farmer; path=/; max-age=86400`;
    localStorage.setItem("token", token);
    localStorage.setItem("id", id);

    navigate(`/auth/v1/app/${id}/AgriSupport/${token}`);
  };

  const handleRegister = () => {
    navigate("/auth/v1/app/${id}/AgriSupport/${token}?view=register");
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userDetails");
      localStorage.removeItem("id");
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "role=; path=/; max-age=0";
      setIsLoggedIn(false);
      setUser(null);
      navigate("/");
      window.dispatchEvent(new Event("authChange"));
    }
  };

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  // Google Translate setup
  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (window.google && window.google.translate) {
        initializeTranslate();
        return;
      }

      const existingScript = document.querySelector(
        'script[src*="translate.google.com"]'
      );
      if (existingScript) {
        existingScript.addEventListener("load", initializeTranslate);
        return;
      }

      const script = document.createElement("script");
      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      window.googleTranslateElementInit = initializeTranslate;
    };

    const initializeTranslate = () => {
      const checkReady = () => {
        if (
          window.google &&
          window.google.translate &&
          window.google.translate.TranslateElement
        ) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,te,ta,bn,mr,gu,kn,ml,pa",
              layout:
                window.google.translate.TranslateElement.InlineLayout
                  .HORIZONTAL,
              autoDisplay: false,
            },
            "google_translate_element"
          );
          setTranslateReady(true);
          hideGoogleBanner();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    };

    const hideGoogleBanner = () => {
      const style = document.createElement("style");
      style.innerHTML = `
        .goog-te-banner-frame.skiptranslate { display: none !important; }
        body { top: 0 !important; }
        .goog-te-menu-value span { display: none; }
        .goog-te-menu-value:before { content: '🌐'; }
        .goog-te-gadget { color: transparent !important; }
      `;
      document.head.appendChild(style);
    };

    loadGoogleTranslate();
  }, []);

  const toggleLanguage = () => {
    if (!translateReady) return;
    const select = document.querySelector(".goog-te-combo");
    if (!select) return;
    const lang = language === "en" ? "hi" : "en";
    select.value = lang;
    select.dispatchEvent(new Event("change"));
    setLanguage(lang);
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Marketplace", path: "/marketplace" },
    { name: "Crop Guide", path: "/crop-guide" },
    { name: "Weather", path: "/weather" },
    { name: "Community", path: "/community" },
    { name: "Support", path: "/support" },
  ];

  return (
    <nav className="bg-gradient-to-r from-emerald-800 via-green-900 to-teal-900 dark:from-gray-900 dark:via-gray-800 dark:to-gray-950 fixed w-full top-0 z-50 shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl p-2 shadow-lg">
                <img src={logo} alt="AgriConnect Logo" className="w-10 h-10" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white dark:text-emerald-400 drop-shadow-md">
                  AgriConnect
                </span>
                <span className="text-xs text-emerald-100 dark:text-emerald-300 -mt-1 font-medium">
                  Empowering Farmers
                </span>
              </div>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navItems.slice(0, 3).map((item, i) => (
              <a
                key={i}
                href={item.path}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-base font-semibold text-white hover:bg-white/20 transition-all"
              >
                {item.name}
              </a>
            ))}

            {/* Foldable Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-5 py-3 rounded-xl text-base font-semibold text-white hover:bg-white/20">
                More ▾
              </button>
              <div className="absolute hidden group-hover:block mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 w-56">
                {navItems.slice(3).map((item, i) => (
                  <a
                    key={i}
                    href={item.path}
                    className="block px-5 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-white rounded-lg text-sm"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle (always visible now) */}
            <motion.button
              onClick={toggleDarkMode}
              className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
            >
              {darkMode ? (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8 8 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4 12a1 1 0 100-2h-1a1 1 0 100 2h1zm12 0a1 1 0 100-2h1a1 1 0 100 2h-1zm-6 6a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </motion.button>

            {/* Language Toggle */}
            <motion.button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30 flex items-center gap-2 transition-all duration-300"
            >
              <div className="w-6 h-6 flex items-center justify-center rounded-full bg-white/30 backdrop-blur-sm p-1">
                <img
                  src={translateIcon}
                  alt="Translate"
                  className="w-6 h-6 object-contain"
                />
              </div>
              {language === "en" ? "हिंदी" : "English"}
            </motion.button>

            {/* Auth Section */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full border border-white/30">
                  <img
                    src={avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border border-white/30"
                  />
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => navigate(`/dashboard/${user.id}`)}
                  className="px-5 py-2 rounded-xl bg-yellow-400 text-gray-900 font-bold shadow hover:bg-yellow-500"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 rounded-xl text-white font-semibold"
                >
                  <div className="w-15 h-15 rounded-full overflow-hidden bg-white/30 backdrop-blur-md p-1 hover:scale-105 transition-transform duration-200">
                    <img
                      className="w-full h-full object-cover rounded-full"
                      src={logoutimg}
                      alt="Logout"
                    />
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogin}
                  className="px-5 py-2 rounded-xl bg-white/20 text-white hover:bg-white/30"
                >
                  Login
                </button>
                <button
                  onClick={handleRegister}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow hover:from-yellow-500 hover:to-orange-600"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-3 rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-6 py-6 space-y-4">
              {navItems.map((item, i) => (
                <a
                  key={i}
                  href={item.path}
                  className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg text-base font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={toggleDarkMode}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600"
                >
                  {darkMode ? "Light" : "Dark"}
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex-1 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600"
                >
                  {language === "en" ? "हिंदी" : "English"}
                </button>
              </div>
              {/* Login / Register or User Info / Dashboard / Logout */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {isLoggedIn && user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                      <img
                        src={avatar}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-white/30"
                      />
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {user.name}
                        </p>
                        <p className="text-emerald-200 text-xs font-medium">
                          Logged in
                        </p>
                      </div>
                    </div>

                    {/* Dashboard + Logout */}
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => {
                          navigate(`/dashboard/${user.id}`);
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-3 rounded-xl bg-yellow-400 text-gray-900 font-bold shadow hover:bg-yellow-500 transition"
                      >
                        Dashboard
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                      >
                        <img
                          src={logoutimg}
                          alt="Logout"
                          className="w-6 h-6 rounded-full"
                        />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        handleLogin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-white/20 text-white font-semibold hover:bg-white/30 transition"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        handleRegister();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold shadow hover:from-yellow-500 hover:to-orange-600 transition"
                    >
                      Register
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div id="google_translate_element" className="hidden"></div>
    </nav>
  );
};

export default Navbar;
