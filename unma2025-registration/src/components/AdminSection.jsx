import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAdmin } from "../hooks";

const AdminSection = () => {
  const navigate = useNavigate();
  const {
    adminStats,
    isStatsLoading,
    registrationsData,
    isRegistrationsLoading,
  } = useAdmin();

  const [dateRange, setDateRange] = useState("week");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      message: "New registration from Arun Sharma",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "Payment confirmation for Priya Patel",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 3,
      message: "System update scheduled for tomorrow",
      time: "1 day ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  if (isStatsLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Admin Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-2xl font-semibold text-primary">
                UNMA 2025
              </span>
            </div>
            <div className="flex items-center">
              {/* Notifications Dropdown */}
              <div className="relative mr-4">
                <button
                  className="relative text-gray-600 hover:text-gray-900 focus:outline-none"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
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
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-10">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <h3 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-2 hover:bg-gray-50 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm text-gray-800">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button className="text-sm text-primary hover:underline">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Admin Profile */}
              <div className="flex items-center">
                <div className="mr-3 text-right">
                  <p className="text-sm font-medium text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">admin@unma2025.org</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-2 text-sm text-red-500 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Registrations Card */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Registrations</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {adminStats.totalRegistrations}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-blue-50 text-blue-500">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-green-500 text-sm">
                <span className="font-bold">
                  +{adminStats.newRegistrations}
                </span>{" "}
                new this {dateRange}
              </p>
            </div>
          </div>

          {/* Total Revenue Card */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  ₹{adminStats.totalRevenue}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-green-50 text-green-500">
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
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-green-500 text-sm">
                <span className="font-bold">+₹{adminStats.newRevenue}</span> new
                this {dateRange}
              </p>
            </div>
          </div>

          {/* Pending Payments Card */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Payments</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {adminStats.pendingPayments}
                </h3>
              </div>
              <div className="p-3 rounded-full bg-yellow-50 text-yellow-500">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-yellow-500 text-sm">
                Amount: ₹{adminStats.pendingAmount}
              </p>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Conversion Rate</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {adminStats.conversionRate}%
                </h3>
              </div>
              <div className="p-3 rounded-full bg-purple-50 text-purple-500">
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-purple-500 text-sm">
                <span
                  className={
                    adminStats.conversionTrend > 0
                      ? "text-green-500"
                      : "text-red-500"
                  }
                >
                  {adminStats.conversionTrend > 0 ? "+" : ""}
                  {adminStats.conversionTrend}%
                </span>{" "}
                vs last {dateRange}
              </p>
            </div>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Statistics Overview
            </h2>
            <div className="flex space-x-2">
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === "week"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setDateRange("week")}
              >
                Week
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === "month"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setDateRange("month")}
              >
                Month
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  dateRange === "year"
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setDateRange("year")}
              >
                Year
              </button>
            </div>
          </div>

          {/* Chart would go here - for now just a placeholder */}
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md h-64 flex items-center justify-center">
            <p className="text-gray-500">
              Registration trends visualization would be displayed here
            </p>
          </div>
        </div>

        {/* Recent Registrations Table */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Registrations
              </h3>
              <Link
                to="/admin/registrations"
                className="text-primary hover:text-primary-dark text-sm"
              >
                View all
              </Link>
            </div>
          </div>

          {isRegistrationsLoading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      School
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registration Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Payment Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {registrationsData?.registrations
                    ?.slice(0, 5)
                    .map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {registration.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {registration.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.school}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {registration.registrationType}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              registration.paymentStatus === "Paid"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {registration.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(
                            registration.registrationDate
                          ).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {!isRegistrationsLoading &&
            (!registrationsData?.registrations ||
              registrationsData.registrations.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No registrations found</p>
              </div>
            )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <Link
                  to="/admin/create-registration"
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Add New Registration
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Settings
                </Link>
                <Link
                  to="/admin/export-data"
                  className="flex items-center text-primary hover:text-primary-dark"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Export Data
                </Link>
              </div>
            </div>
          </div>

          {/* School Distribution */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                School Distribution
              </h3>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md h-32 flex items-center justify-center">
                <p className="text-gray-500">
                  School distribution chart would be displayed here
                </p>
              </div>
            </div>
          </div>

          {/* Registration Type Distribution */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-4 py-5 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Registration Types
              </h3>
            </div>
            <div className="p-4">
              <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md h-32 flex items-center justify-center">
                <p className="text-gray-500">
                  Registration type distribution chart would be displayed here
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSection;
