import { useState, useEffect } from "react";
import { useAdmin } from "../../hooks/useAdmin";
import useAuthStore from "../../store/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlusIcon,
  KeyIcon,
  TrashIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import subAdminSchema from "../../zod-form-validators/subAdminSchema";



const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { createSubAdmin, useSubAdmins } = useAdmin();
  const { isAuthenticated, user } = useAuthStore();
  const { data: subAdmins, isLoading } = useSubAdmins();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(subAdminSchema),
    defaultValues: {
      role: "sub_admin",
    },
  });

  useEffect(() => {
    console.log("user",user);
  }, [subAdmins]);

  const onSubmit = async (data) => {
    try {
      await createSubAdmin(data);
      reset();
    } catch (error) {
      console.error("Failed to create sub-admin:", error);
    }
  };

  if (!isAuthenticated || user?.role !== "superadmin") {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-1">
            Only super admins can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage sub-admins and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Sub-admin Form */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create Sub-admin
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <KeyIcon className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                District
              </label>
              <select
                {...register("district")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select District</option>
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
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.district.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? (
                "Creating..."
              ) : (
                <>
                  <UserPlusIcon className="h-5 w-5 mr-2" />
                  Create Sub-admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Sub-admins List */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sub-admins List
          </h2>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-4 border-b border-gray-100 pb-4"
                >
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {subAdmins?.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <UserCircleIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {admin.name}
                      </h3>
                      <p className="text-sm text-gray-500">{admin.email}</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {admin.district}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete this sub-admin?"
                        )
                      ) {
                        // Handle delete
                      }
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
