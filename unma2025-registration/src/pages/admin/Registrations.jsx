import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import {
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

const Registrations = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    district: "all",
    page: 1,
    limit: 10,
  });
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { useRegistrations, deleteRegistration } = useAdmin();
  const { data, isLoading, error } = useRegistrations(filters);
  const { isAuthenticated } = useAuthStore();

  const handleSearch = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      await deleteRegistration(id);
    }
  };

  const handleView = (registration) => {
    setSelectedRegistration(registration);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRegistration(null);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Registrations</h1>
        <p className="text-gray-600 mt-1">
          Manage and monitor all event registrations
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search registrations..."
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={filters.search}
              onChange={handleSearch}
            />
          </div>

          <div>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              name="district"
              value={filters.district}
              onChange={handleFilterChange}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Districts</option>
              <option value="Kasaragod">Kasaragod</option>
              <option value="Kannur">Kannur</option>
              <option value="Wayanad">Wayanad</option>
              <option value="Kozhikode">Kozhikode</option>
              <option value="Malappuram">Malappuram</option>
              <option value="Palakkad">Palakkad</option>
              <option value="Thrissur">Thrissur</option>
              <option value="Ernakulam">Ernakulam</option>
              <option value="Idukki">Idukki</option>
              <option value="Kottayam">Kottayam</option>
              <option value="Alappuzha">Alappuzha</option>
              <option value="Pathanamthitta">Pathanamthitta</option>
              <option value="Kollam">Kollam</option>
              <option value="Thiruvananthapuram">Thiruvananthapuram</option>
            </select>
          </div>

          <div>
            <button
              onClick={() => setFilters({ ...filters, page: 1 })}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-red-500"
                  >
                    Error loading registrations
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    No registrations found
                  </td>
                </tr>
              ) : (
                data?.data?.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {registration.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {registration.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {registration.district}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          registration.status === "verified"
                            ? "bg-green-100 text-green-800"
                            : registration.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {registration.status || "pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.createdAt
                        ? format(
                            new Date(registration.createdAt),
                            "MMM d, yyyy"
                          )
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(registration)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        title="View details"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/registrations/${registration._id}/edit`
                          )
                        }
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        title="Edit registration"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(registration._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete registration"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(filters.page - 1)}
                disabled={filters.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(filters.page + 1)}
                disabled={filters.page === data.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(filters.page - 1) * filters.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(filters.page * filters.limit, data?.total || 0)}
                  </span>{" "}
                  of <span className="font-medium">{data?.total || 0}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                  aria-label="Pagination"
                >
                  {Array.from({ length: data?.totalPages || 0 }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        filters.page === i + 1
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showModal && selectedRegistration && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={closeModal}
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="flex justify-between items-center bg-blue-600 px-6 py-4">
                <h3 className="text-xl leading-6 font-medium text-white">
                  Registration Details
                </h3>
                <button
                  onClick={closeModal}
                  className="bg-blue-600 rounded-md text-white hover:text-gray-200 focus:outline-none"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="bg-white px-6 py-5 max-h-[80vh] overflow-y-auto">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <span className="text-2xl text-blue-600 font-bold">
                        {selectedRegistration.name
                          ? selectedRegistration.name.charAt(0).toUpperCase()
                          : "U"}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">
                        {selectedRegistration.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {selectedRegistration.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-2">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedRegistration.status === "verified"
                          ? "bg-green-100 text-green-800"
                          : selectedRegistration.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      Status: {selectedRegistration.status || "Pending"}
                    </span>

                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        selectedRegistration.paymentStatus === "completed"
                          ? "bg-green-100 text-green-800"
                          : selectedRegistration.paymentStatus === "failed"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      Payment: {selectedRegistration.paymentStatus || "Pending"}
                    </span>

                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                      Type: {selectedRegistration.registrationType || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800">
                        Personal Information
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Contact Number
                        </div>
                        <div className="w-2/3 text-sm text-gray-900 font-medium">
                          {selectedRegistration.contactNumber || "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          WhatsApp
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.whatsappNumber ||
                            "Same as contact"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Address
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.address || "Not provided"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          District
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.district || "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Occupation
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.currentOccupation ||
                            "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* JNV Information */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800">
                        JNV Information
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          School
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.jnvSchool || "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Batch
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.batch || "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          House
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.house || "Not specified"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Roll Number
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.rollNumber || "Not provided"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Event Information */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800">
                        Event Information
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Attending
                        </div>
                        <div className="w-2/3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              selectedRegistration.isAttending
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedRegistration.isAttending ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Will Contribute
                        </div>
                        <div className="w-2/3 text-sm">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              selectedRegistration.willContribute
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {selectedRegistration.willContribute ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Contribution
                        </div>
                        <div className="w-2/3 text-sm text-gray-900 font-semibold">
                          {selectedRegistration.contributionAmount
                            ? `₹${selectedRegistration.contributionAmount}`
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Accommodation
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.accommodation ||
                            "Not specified"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="text-base font-semibold text-gray-800">
                        Additional Information
                      </h4>
                    </div>
                    <div className="divide-y divide-gray-200">
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Registered On
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.createdAt
                            ? format(
                                new Date(selectedRegistration.createdAt),
                                "PPp"
                              )
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Last Updated
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.updatedAt
                            ? format(
                                new Date(selectedRegistration.updatedAt),
                                "PPp"
                              )
                            : "N/A"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Transaction ID
                        </div>
                        <div className="w-2/3 text-sm text-gray-900 font-mono text-xs">
                          {selectedRegistration.transactionId ||
                            "No transaction"}
                        </div>
                      </div>
                      <div className="flex py-3 px-4">
                        <div className="w-1/3 text-sm font-medium text-gray-500">
                          Notes
                        </div>
                        <div className="w-2/3 text-sm text-gray-900">
                          {selectedRegistration.notes || "No additional notes"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() =>
                      navigate(
                        `/admin/registrations/${selectedRegistration._id}/edit`
                      )
                    }
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Registration
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={closeModal}
                  >
                    <XMarkIcon className="h-4 w-4 mr-2" />
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Registrations;
