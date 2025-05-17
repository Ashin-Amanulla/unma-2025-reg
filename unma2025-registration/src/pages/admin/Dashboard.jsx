import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import { useAdmin } from "../../hooks/useAdmin";
import {
  UserGroupIcon,
  CurrencyRupeeIcon,
  ClipboardDocumentCheckIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import IssuesManagement from "./IssuesManagement";

ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardCard = ({ title, value, icon: Icon, color, subtext }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
        {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { dashboardStats, isLoadingStats } = useAdmin();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  const stats = [
    {
      title: "Total Registrations",
      value: dashboardStats?.totalRegistrations || 0,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      subtext: "All time registrations",
    },
    {
      title: "Total Revenue",
      value: `₹${(dashboardStats?.totalFundCollected || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "bg-green-500",
      subtext: "From registration fees",
    },
    {
      title: "Total Attendees",
      value: dashboardStats?.totalAttendees || 0,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      subtext: "All time attendees",
    },
    {
      title: "Todays Payments",
      value: `₹${(dashboardStats?.todaysPayments || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "bg-green-500",
      subtext: "Today's payments",
    },
    {
      title: "Today's Registrations",
      value: dashboardStats?.todayRegistrations || 0,
      icon: ArrowTrendingUpIcon,
      color: "bg-indigo-500",
      subtext: "Last 24 hours",
    },
    {
      title: "Active Sub-Admins",
      value: dashboardStats?.totalAdmins || 0,
      icon: UserIcon,
      color: "bg-pink-500",
      subtext: "Managing registrations",
    },
  ];

  // Chart data
  const chartData = {
    labels: ["Verified", "Pending", "Rejected"],
    datasets: [
      {
        data: [
          dashboardStats?.verifiedCount || 0,
          dashboardStats?.pendingCount || 0,
          dashboardStats?.rejectedCount || 0,
        ],
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(234, 179, 8, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgb(34, 197, 94)",
          "rgb(234, 179, 8)",
          "rgb(239, 68, 68)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const menuItems = [
    {
      id: "issues",
      title: "Issues Management",
      icon: (
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
      ),
      component: <IssuesManagement />,
    },
  ];

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your registrations today.
        </p>
      </div>

      {isLoadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg shadow-sm animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <DashboardCard key={index} {...stat} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Registration Status Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Registration Status
              </h3>
              <div className="h-[300px] flex items-center justify-center">
                <Doughnut
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                      },
                    },
                  }}
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {dashboardStats?.recentActivity?.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        activity.type === "registration"
                          ? "bg-blue-100 text-blue-800"
                          : activity.type === "verification"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {activity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
