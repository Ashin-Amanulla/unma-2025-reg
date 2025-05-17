import { useEffect } from "react";
import { Outlet, useNavigate, Link } from "react-router-dom";
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import useAuthStore from "../../store/authStore";
import { useAdminStore } from "../../store";

const AdminLayout = () => {
  const navigate = useNavigate();

  // Use our custom hooks
  const { checkAuth, logout, user } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useAdminStore();

  // Check authentication
  useEffect(() => {
    console.log("checkAuth", user);
    if (!checkAuth()) {
      navigate("/admin/login");
    }
  }, [checkAuth, navigate]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  // If still checking auth, show loading
  // if (checkAuth()) {
  //   return (
  //     <div className="flex h-screen items-center justify-center bg-gray-100">
  //       <div className="w-12 h-12 border-4 border-gray-200 rounded-full border-t-primary animate-spin"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-dark">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold">UNMA 2025</span>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md md:hidden hover:bg-primary-dark"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <HomeIcon className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/registrations"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <UserGroupIcon className="w-5 h-5 mr-3" />
                <span>Registrations</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/analytics"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <ChartBarIcon className="w-5 h-5 mr-3" />
                <span>Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className="flex items-center p-2 rounded-md hover:bg-primary-dark"
              >
                <Cog6ToothIcon className="w-5 h-5 mr-3" />
                <span>Settings</span>
              </Link>
            </li>
          </ul>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-2 rounded-md hover:bg-primary-dark"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md md:hidden hover:bg-gray-100"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>

            <div className="flex items-center">
              <span className="text-sm font-medium mr-2">
                {user?.name || "Admin"}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-xs font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
