import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import ScrollLink from "../ui/ScrollLink";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking a link
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white shadow-md py-3"
          : "bg-white py-4 border-b border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4 grid grid-cols-3 items-center">
        {/* Logo - Left */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="UNMA 2025"
              className="h-10 w-auto"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://media.licdn.com/dms/image/v2/C4E0BAQHBiErpz5o1lQ/company-logo_200_200/company-logo_200_200/0/1631331050086?e=2147483647&v=beta&t=4nyvBmOtfitoTakRa43Jj5aP37obR-FqNF80JBm2VQk";
              }}
            />
            {/* <span className="ml-2 text-xl font-bold text-primary">UNMA 2025</span> */}
          </Link>
        </div>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center justify-center">
          <div className="flex space-x-1 items-center">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3 py-2 my-1 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Home
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"></span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/registration"
              className={({ isActive }) =>
                `px-3 py-2 my-1 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Register
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"></span>
                  )}
                </>
              )}
            </NavLink>

            <ScrollLink
              to="/#faq"
              className="px-3 py-2 my-1 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-all duration-200"
            >
              FAQ
            </ScrollLink>

            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-3 py-2 my-1 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Contact
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"></span>
                  )}
                </>
              )}
            </NavLink>

            <NavLink
              to="/report-issue"
              className={({ isActive }) =>
                `px-3 py-2 my-1 rounded-lg transition-all duration-200 relative ${
                  isActive
                    ? "text-primary font-medium"
                    : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  Report Issue
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded"></span>
                  )}
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* Admin Login - Right */}
        <div className="hidden md:flex justify-end">
          <NavLink
            to="/admin/login"
            className={({ isActive }) =>
              `px-4 py-2 rounded-md border transition-all duration-300 ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-blue-200"
                  : "border-blue-300 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`
            }
          >
            Admin Login
          </NavLink>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 md:hidden ml-auto col-span-2 md:col-span-1"
        >
          <span className="sr-only">Open main menu</span>
          {isMenuOpen ? (
            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
          ) : (
            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 py-2 space-y-1 bg-white shadow-lg rounded-b-lg divide-y divide-gray-100">
            <div className="py-2">
              <NavLink
                to="/"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base ${
                    isActive
                      ? "text-primary font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`
                }
              >
                Home
              </NavLink>
              <NavLink
                to="/registration"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base ${
                    isActive
                      ? "text-primary font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`
                }
              >
                Register
              </NavLink>
            </div>

            <div className="py-2">
              <div
                onClick={closeMenu}
                className="block px-4 py-2 rounded-md text-base text-gray-600 hover:bg-gray-50 hover:text-primary"
              >
                <ScrollLink to="/#faq" className="w-full inline-block">
                  FAQ
                </ScrollLink>
              </div>
              <NavLink
                to="/contact"
                onClick={closeMenu}
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-md text-base ${
                    isActive
                      ? "text-primary font-medium bg-blue-50"
                      : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                  }`
                }
              >
                Contact
              </NavLink>
            </div>

            <div className="py-2">
              <NavLink
                to="/admin/login"
                onClick={closeMenu}
                className="block px-4 py-2 rounded-md text-base font-medium text-blue-600 hover:bg-blue-50"
              >
                Admin Login
              </NavLink>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Floating Report Issue Button Component
const FloatingReportButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-lg p-4 w-64 mb-2 border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium text-gray-900">
              Report an Issue
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Encountered a problem? Let us know so we can fix it.
          </p>
          <NavLink
            to="/report-issue"
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            onClick={() => setIsOpen(false)}
          >
            Report Issue
          </NavLink>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-105"
        title="Report an Issue"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </button>
    </div>
  );
};

// Export both components
export { FloatingReportButton };
export default Header;
