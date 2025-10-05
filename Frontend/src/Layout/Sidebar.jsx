// components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaShoppingBag,
  FaStore,
  FaClipboardList,
  FaUserCog,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaTachometerAlt,
  FaUsers,
  FaChartLine,
  FaCog,
  FaQuestionCircle,
  FaSeedling,
  FaShoppingCart,
  FaBoxOpen,
  FaMoneyBillWave,
  FaTruck,
  FaHandshake,
} from "react-icons/fa";
import authService from "../API/authService";

const Sidebar = ({ isOpen, onToggle, user }) => {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});
  const [userRole, setUserRole] = useState(user?.role || "trader");

  // Menu structure based on user role
  const menuSections = {
    trader: [
      {
        title: "Dashboard",
        path: "/harvestLink/v1/agriConnect",
        icon: <FaTachometerAlt />,
        type: "link",
      },
      {
        title: "Marketplace",
        icon: <FaShoppingBag />,
        type: "section",
        items: [
          { title: "Browse Products", path: "/browse", icon: <FaSeedling /> },
          { title: "My Cart", path: "/cart", icon: <FaShoppingCart /> },
          { title: "My Orders", path: "/orders", icon: <FaBoxOpen /> },
        ],
      },
      {
        title: "Selling",
        icon: <FaStore />,
        type: "section",
        items: [
          { title: "My Products", path: "/my-products", icon: <FaSeedling /> },
          {
            title: "My Listings",
            path: "/my-listings",
            icon: <FaClipboardList />,
          },
          { title: "Sales", path: "/sales", icon: <FaMoneyBillWave /> },
        ],
      },
      {
        title: "Account",
        path: "/account",
        icon: <FaUserCog />,
        type: "link",
      },
    ],
    farmer: [
      {
        title: "Dashboard",
        path: "/harvestLink/v1/agriConnect",
        icon: <FaTachometerAlt />,
        type: "link",
      },
      {
        title: "My Farm",
        icon: <FaSeedling />,
        type: "section",
        items: [
          { title: "Products", path: "/my-products", icon: <FaSeedling /> },
          {
            title: "Listings",
            path: "/my-listings",
            icon: <FaClipboardList />,
          },
          { title: "Inventory", path: "/inventory", icon: <FaBoxOpen /> },
        ],
      },
      {
        title: "Sales",
        icon: <FaMoneyBillWave />,
        type: "section",
        items: [
          { title: "Orders", path: "/orders", icon: <FaShoppingBag /> },
          {
            title: "Transactions",
            path: "/transactions",
            icon: <FaChartLine />,
          },
          { title: "Delivery", path: "/delivery", icon: <FaTruck /> },
        ],
      },
      {
        title: "Account",
        path: "/account",
        icon: <FaUserCog />,
        type: "link",
      },
    ],
    admin: [
      {
        title: "Dashboard",
        path: "/harvestLink/v1/agriConnect",
        icon: <FaTachometerAlt />,
        type: "link",
      },
      {
        title: "Management",
        icon: <FaUsers />,
        type: "section",
        items: [
          { title: "Users", path: "/admin/users", icon: <FaUsers /> },
          { title: "Products", path: "/admin/products", icon: <FaSeedling /> },
          {
            title: "Listings",
            path: "/admin/listings",
            icon: <FaClipboardList />,
          },
        ],
      },
      {
        title: "Analytics",
        icon: <FaChartLine />,
        type: "section",
        items: [
          { title: "Sales", path: "/admin/sales", icon: <FaMoneyBillWave /> },
          {
            title: "Transactions",
            path: "/admin/transactions",
            icon: <FaChartLine />,
          },
          { title: "Reports", path: "/admin/reports", icon: <FaChartLine /> },
        ],
      },
      {
        title: "System",
        icon: <FaCog />,
        type: "section",
        items: [
          { title: "Settings", path: "/admin/settings", icon: <FaCog /> },
          {
            title: "Support",
            path: "/admin/support",
            icon: <FaQuestionCircle />,
          },
        ],
      },
    ],
  };

  const currentMenu = menuSections[userRole] || menuSections.trader;

  const toggleSection = (sectionTitle) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle],
    }));
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  // Auto-expand sections when sidebar opens
  useEffect(() => {
    if (isOpen) {
      const currentlyActiveSection = currentMenu.find(
        (section) =>
          section.type === "section" &&
          section.items.some((item) => isActiveLink(item.path))
      );

      if (currentlyActiveSection) {
        setExpandedSections((prev) => ({
          ...prev,
          [currentlyActiveSection.title]: true,
        }));
      }
    }
  }, [isOpen, location.pathname]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed md:relative z-50 h-screen bg-gradient-to-b from-indigo-800 to-violet-800 text-white
        transition-all duration-300 ease-in-out overflow-y-auto
        ${
          isOpen
            ? "w-64 translate-x-0"
            : "w-0 -translate-x-full md:translate-x-0 md:w-20"
        }
      `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {isOpen ? (
            <div className="flex items-center">
              <FaSeedling className="text-2xl text-emerald-400 mr-2" />
              <h1 className="text-xl font-bold">HarvestLink</h1>
            </div>
          ) : (
            <div className="flex justify-center w-full">
              <FaSeedling className="text-2xl text-emerald-400" />
            </div>
          )}

          <button
            onClick={onToggle}
            className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-indigo-700">
          {isOpen ? (
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">{user?.name || "User"}</p>
                <p className="text-xs text-indigo-200 capitalize">{userRole}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2">
          <ul className="space-y-1">
            {currentMenu.map((item, index) => {
              if (item.type === "link") {
                return (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center p-3 rounded-lg transition-colors
                        ${
                          isActiveLink(item.path)
                            ? "bg-indigo-700 text-white"
                            : "text-indigo-100 hover:bg-indigo-700"
                        }
                      `}
                    >
                      <span className="text-lg">{item.icon}</span>
                      {isOpen && <span className="ml-3">{item.title}</span>}
                    </Link>
                  </li>
                );
              }

              if (item.type === "section") {
                const isExpanded = expandedSections[item.title];

                return (
                  <li key={index}>
                    <button
                      onClick={() => toggleSection(item.title)}
                      className={`
                        flex items-center justify-between w-full p-3 rounded-lg transition-colors
                        text-indigo-100 hover:bg-indigo-700
                      `}
                    >
                      <div className="flex items-center">
                        <span className="text-lg">{item.icon}</span>
                        {isOpen && <span className="ml-3">{item.title}</span>}
                      </div>
                      {isOpen && (
                        <span className="text-sm">
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                        </span>
                      )}
                    </button>

                    {isExpanded && isOpen && (
                      <ul className="ml-4 mt-1 space-y-1 border-l border-indigo-700 pl-2">
                        {item.items.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <Link
                              to={subItem.path}
                              className={`
                                flex items-center p-2 rounded-lg transition-colors
                                ${
                                  isActiveLink(subItem.path)
                                    ? "bg-indigo-700 text-white"
                                    : "text-indigo-200 hover:bg-indigo-700"
                                }
                              `}
                            >
                              <span className="text-md">{subItem.icon}</span>
                              <span className="ml-3 text-sm">
                                {subItem.title}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              }

              return null;
            })}
          </ul>
        </nav>

        {/* Support & Logout */}
        <div className="absolute bottom-0 w-full p-4 border-t border-indigo-700">
          {isOpen ? (
            <>
              <Link
                to="/support"
                className="flex items-center p-3 rounded-lg text-indigo-100 hover:bg-indigo-700 transition-colors mb-2"
              >
                <FaQuestionCircle className="text-lg" />
                <span className="ml-3">Help & Support</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full p-3 rounded-lg text-indigo-100 hover:bg-indigo-700 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="ml-3">Logout</span>
              </button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-2">
                <Link
                  to="/support"
                  className="p-3 rounded-lg text-indigo-100 hover:bg-indigo-700 transition-colors"
                  title="Help & Support"
                >
                  <FaQuestionCircle className="text-lg" />
                </Link>
              </div>
              <div className="flex justify-center">
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-lg text-indigo-100 hover:bg-indigo-700 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
