import React, { useState } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  CurrencyDollarIcon,
  HomeIcon,
  HandRaisedIcon,
  TruckIcon,
  UserGroupIcon,
  ChartBarIcon,
  AcademicCapIcon,
  IdentificationIcon,
  BanknotesIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
import Loading from "../../components/ui/Loading";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PieController,
  PointElement,
  LineElement
);

// Reusable stat card component with improved design
const StatCard = ({ title, value, icon: Icon, color }) => {
  // Map color prop to specific background and text colors
  const getColorClasses = (colorName) => {
    const colorMap = {
      blue: {
        bg: "bg-blue-50",
        text: "text-blue-500",
        border: "border-blue-200",
      },
      green: {
        bg: "bg-green-50",
        text: "text-green-500",
        border: "border-green-200",
      },
      yellow: {
        bg: "bg-yellow-50",
        text: "text-yellow-500",
        border: "border-yellow-200",
      },
      purple: {
        bg: "bg-purple-50",
        text: "text-purple-500",
        border: "border-purple-200",
      },
      red: { bg: "bg-red-50", text: "text-red-500", border: "border-red-200" },
      indigo: {
        bg: "bg-indigo-50",
        text: "text-indigo-500",
        border: "border-indigo-200",
      },
    };
    return (
      colorMap[colorName] || {
        bg: "bg-gray-50",
        text: "text-gray-500",
        border: "border-gray-200",
      }
    );
  };

  const { bg, text, border } = getColorClasses(color);

  return (
    <div
      className={`${bg} p-5 rounded-lg shadow-sm border ${border} transition-all hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${bg}`}>
          <Icon className={`w-6 h-6 ${text}`} />
        </div>
      </div>
    </div>
  );
};

// Improved category tab component
const CategoryTab = ({ id, title, icon: Icon, isActive, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center px-4 py-3 rounded-md transition-all ${
      isActive
        ? "bg-indigo-600 text-white shadow-md"
        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
    }`}
  >
    <Icon className="w-5 h-5 mr-2" />
    <span className="font-medium">{title}</span>
  </button>
);

const Analytics = () => {
  const [activeCategory, setActiveCategory] = useState("registration_overview");
  const { useAnalytics } = useAdmin();
  const { data, isLoading } = useAnalytics();
  const { isAuthenticated } = useAuthStore();

  // Data for various statistics
  const totalRegistrations =
    (data?.registrationTypeCount?.alumni || 0) +
    (data?.registrationTypeCount?.staff || 0) +
    (data?.registrationTypeCount?.other || 0);

  const totalRevenue =
    data?.pendingPayments?.reduce(
      (acc, payment) => acc + (payment.amountDue || 0),
      0
    ) || 0;

  // Summary statistics cards
  const statCards = [
    {
      title: "Total Registrations",
      value: totalRegistrations,
      icon: IdentificationIcon,
      color: "blue",
    },
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: CurrencyDollarIcon,
      color: "green",
    },
    {
      title: "Alumni Count",
      value: data?.registrationTypeCount?.alumni || 0,
      icon: AcademicCapIcon,
      color: "yellow",
    },
    {
      title: "Completed Payments",
      value: data?.paymentStatusCount?.completed || 0,
      icon: BanknotesIcon,
      color: "purple",
    },
  ];

  // Category tabs for different analytics views
  const categoryTabs = [
    {
      id: "registration_overview",
      title: "Registration Overview",
      icon: ChartBarIcon,
    },
    {
      id: "district_wise",
      title: "District Analysis",
      icon: BuildingOfficeIcon,
    },
    {
      id: "school_participation",
      title: "School Distribution",
      icon: AcademicCapIcon,
    },
    {
      id: "payment_status",
      title: "Payment Status",
      icon: BanknotesIcon,
    },
    {
      id: "pending_payment",
      title: "Pending Payments",
      icon: CurrencyDollarIcon,
    },
    {
      id: "need_accommodation",
      title: "Need Accommodation",
      icon: HomeIcon,
    },
    {
      id: "volunteers",
      title: "Volunteers",
      icon: HandRaisedIcon,
    },
    {
      id: "ride_share",
      title: "Ride Share",
      icon: TruckIcon,
    },
    {
      id: "sponsors",
      title: "Potential Sponsors",
      icon: UserGroupIcon,
    },
  ];

  // Chart data preparations with better colors
  const chartColors = {
    blue: "rgba(59, 130, 246, 0.7)",
    green: "rgba(16, 185, 129, 0.7)",
    yellow: "rgba(245, 158, 11, 0.7)",
    purple: "rgba(139, 92, 246, 0.7)",
    red: "rgba(239, 68, 68, 0.7)",
    indigo: "rgba(79, 70, 229, 0.7)",
    pink: "rgba(236, 72, 153, 0.7)",
    teal: "rgba(20, 184, 166, 0.7)",
  };

  const districtData = {
    labels: data?.districtWise?.map((d) => d.district) || [],
    datasets: [
      {
        label: "Registrations",
        data: data?.districtWise?.map((d) => d.count) || [],
        backgroundColor: chartColors.blue,
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
    ],
  };

  const schoolData = {
    labels: data?.schoolWise?.map((s) => s.school) || [],
    datasets: [
      {
        label: "Alumni",
        data: data?.schoolWise?.map((s) => s.count) || [],
        backgroundColor: Object.values(chartColors),
        borderWidth: 1,
      },
    ],
  };

  const registrationTypeData = {
    labels: ["Alumni", "Staff", "Other"],
    datasets: [
      {
        data: [
          data?.registrationTypeCount?.alumni || 0,
          data?.registrationTypeCount?.staff || 0,
          data?.registrationTypeCount?.other || 0,
        ],
        backgroundColor: [
          chartColors.blue,
          chartColors.green,
          chartColors.yellow,
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentStatusData = {
    labels: ["Completed", "Pending", "Failed"],
    datasets: [
      {
        data: [
          data?.paymentStatusCount?.completed || 0,
          data?.paymentStatusCount?.pending || 0,
          data?.paymentStatusCount?.failed || 0,
        ],
        backgroundColor: [
          chartColors.green,
          chartColors.yellow,
          chartColors.red,
        ],
        borderWidth: 1,
      },
    ],
  };

  if (!isAuthenticated) return null;

  // Render data tables for list categories
  const renderDetailsList = () => {
    const listData = data?.[activeCategory] || [];

    if (listData.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <ChartBarIcon className="w-12 h-12 mx-auto text-gray-400" />
          <p className="text-gray-500 mt-4">
            No data available for this category
          </p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {categoryTabs.find((c) => c.id === activeCategory)?.title} Details
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                {activeCategory === "pending_payment" && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Due
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {listData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.district}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.phone}</div>
                  </td>
                  {activeCategory === "pending_payment" && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-red-600">
                        ₹{item.amountDue?.toLocaleString() || 0}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Function to render the registration overview with multiple charts
  const renderRegistrationOverview = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Registration Types Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Registration Type Distribution
            </h3>
            <div className="h-[300px] flex justify-center items-center">
              {registrationTypeData.datasets[0].data.every(
                (val) => val === 0
              ) ? (
                <p className="text-gray-500">No registration data available</p>
              ) : (
                <Pie
                  data={registrationTypeData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>

          {/* Payment Status Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Payment Status Distribution
            </h3>
            <div className="h-[300px] flex justify-center items-center">
              {paymentStatusData.datasets[0].data.every((val) => val === 0) ? (
                <p className="text-gray-500">No payment data available</p>
              ) : (
                <Pie
                  data={paymentStatusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: "bottom" },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Contribution Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Participation Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-blue-700">Accommodation</h4>
                <HomeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-800">
                {data?.needAccommodation?.length || 0}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                people need accommodation
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-green-700">Volunteers</h4>
                <HandRaisedIcon className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-800">
                {data?.volunteers?.length || 0}
              </p>
              <p className="text-sm text-green-600 mt-1">people volunteering</p>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-yellow-700">Ride Share</h4>
                <TruckIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-800">
                {data?.rideShare?.length || 0}
              </p>
              <p className="text-sm text-yellow-600 mt-1">
                offering/seeking rides
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-purple-700">Sponsors</h4>
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-800">
                {data?.sponsors?.length || 0}
              </p>
              <p className="text-sm text-purple-600 mt-1">potential sponsors</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render appropriate content based on active category
  const renderContent = () => {
    switch (activeCategory) {
      case "registration_overview":
        return renderRegistrationOverview();

      case "district_wise":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              District-wise Registration Analysis
            </h3>
            <div className="h-[500px] flex justify-center items-center">
              {!districtData.labels.length ? (
                <p className="text-gray-500">No district data available</p>
              ) : (
                <Bar
                  data={districtData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                      x: {
                        ticks: {
                          autoSkip: true,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
                    },
                  }}
                />
              )}
            </div>
          </div>
        );

      case "school_participation":
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              JNV School Participation Analysis
            </h3>
            <div className="h-[500px] flex justify-center items-center">
              {!schoolData.labels.length ? (
                <p className="text-gray-500">No school data available</p>
              ) : (
                <Bar
                  data={schoolData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                      },
                      x: {
                        ticks: {
                          autoSkip: true,
                          maxRotation: 45,
                          minRotation: 45,
                        },
                      },
                    },
                    plugins: {
                      legend: { position: "top" },
                      title: { display: false },
                      tooltip: {
                        callbacks: {
                          label: function (context) {
                            return `${context.label}: ${context.raw} alumni`;
                          },
                        },
                      },
                    },
                  }}
                />
              )}
            </div>
          </div>
        );

      case "payment_status":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Status Distribution
              </h3>
              <div className="h-[400px] flex justify-center items-center">
                {paymentStatusData.datasets[0].data.every(
                  (val) => val === 0
                ) ? (
                  <p className="text-gray-500">No payment data available</p>
                ) : (
                  <Pie
                    data={paymentStatusData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: "bottom" },
                        title: { display: false },
                      },
                    }}
                  />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Statistics
              </h3>
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700">
                    Completed Payments
                  </p>
                  <p className="text-2xl font-bold text-green-800 mt-1">
                    {data?.paymentStatusCount?.completed || 0}
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-sm font-medium text-yellow-700">
                    Pending Payments
                  </p>
                  <p className="text-2xl font-bold text-yellow-800 mt-1">
                    {data?.paymentStatusCount?.pending || 0}
                  </p>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">
                    Failed Payments
                  </p>
                  <p className="text-2xl font-bold text-red-800 mt-1">
                    {data?.paymentStatusCount?.failed || 0}
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-700">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-blue-800 mt-1">
                    ₹{totalRevenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return renderDetailsList();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Comprehensive analytics for UNMA 2025 registrations and contributions
        </p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loading />
        </div>
      ) : (
        <>
          {/* Stats Section */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Quick Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <StatCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>
          </section>

          {/* Analytics Categories */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Detailed Analytics
            </h2>

            {/* Category Tabs */}
            <div className="bg-gray-50 rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categoryTabs.map((category) => (
                  <CategoryTab
                    key={category.id}
                    id={category.id}
                    title={category.title}
                    icon={category.icon}
                    isActive={activeCategory === category.id}
                    onClick={setActiveCategory}
                  />
                ))}
              </div>
            </div>

            {/* Content Area */}
            {renderContent()}
          </section>
        </>
      )}
    </div>
  );
};

export default Analytics;
