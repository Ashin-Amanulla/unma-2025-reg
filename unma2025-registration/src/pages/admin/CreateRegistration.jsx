import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../hooks";

const CreateRegistration = () => {
  const navigate = useNavigate();
  const { adminSettings, isSettingsLoading } = useAdmin();

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    school: "",
    graduationYear: "",
    registrationType: "Standard",
    paymentStatus: "Pending",
    amount: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load initial data
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("adminToken");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // Set default amount when settings are loaded
    if (adminSettings && !formData.amount) {
      setFormData((prev) => ({
        ...prev,
        amount: `₹${adminSettings.registrationFee.standard}`,
      }));
    }
  }, [adminSettings, navigate, formData.amount]);

  // Update amount when registration type changes
  useEffect(() => {
    if (adminSettings && formData.registrationType) {
      const type = formData.registrationType.toLowerCase();
      if (adminSettings.registrationFee[type]) {
        setFormData((prev) => ({
          ...prev,
          amount: `₹${adminSettings.registrationFee[type]}`,
        }));
      }
    }
  }, [formData.registrationType, adminSettings]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Submitting registration:", formData);

      // Simulate successful submission
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        school: "",
        graduationYear: "",
        registrationType: "Standard",
        paymentStatus: "Pending",
        amount: adminSettings
          ? `₹${adminSettings.registrationFee.standard}`
          : "",
      });
    } catch (error) {
      console.error("Error creating registration:", error);
      setError("Failed to create registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Common schools list
  const commonSchools = [
    "JNV Kannur",
    "JNV Ernakulam",
    "JNV Kozhikode",
    "JNV Thiruvananthapuram",
    "JNV Idukki",
    "JNV Wayanad",
    "JNV Kollam",
    "JNV Kasaragod",
    "JNV Pathanamthitta",
    "JNV Kottayam",
    "JNV Alappuzha",
    "JNV Malappuram",
    "Other",
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Create Registration
          </h1>
          <button
            className="btn btn-outline"
            onClick={() => navigate("/admin/registrations")}
          >
            Back to Registrations
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            Registration created successfully!
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          {/* Personal Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-input"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="graduationYear"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Graduation Year
                </label>
                <input
                  type="number"
                  id="graduationYear"
                  name="graduationYear"
                  min="1990"
                  max="2025"
                  className="form-input"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="school"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  School
                </label>
                <select
                  id="school"
                  name="school"
                  className="form-input"
                  value={formData.school}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Select a school
                  </option>
                  {commonSchools.map((school) => (
                    <option key={school} value={school}>
                      {school}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Registration Details */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Registration Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="registrationType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Registration Type
                </label>
                <select
                  id="registrationType"
                  name="registrationType"
                  className="form-input"
                  value={formData.registrationType}
                  onChange={handleChange}
                  required
                >
                  <option value="Standard">Standard</option>
                  <option value="Premium">Premium</option>
                  <option value="Supporter">Supporter</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Amount
                </label>
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  className="form-input bg-gray-50"
                  value={formData.amount}
                  readOnly
                />
              </div>

              <div>
                <label
                  htmlFor="paymentStatus"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Status
                </label>
                <select
                  id="paymentStatus"
                  name="paymentStatus"
                  className="form-input"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-6 flex justify-end">
            {error && (
              <div className="text-red-500 mr-auto self-center">{error}</div>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRegistration;
