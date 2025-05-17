import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import loginSchema from "../../zod-form-validators/loginForm";
import useAuthStore from "../../store/authStore";
// Validation schema

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@unma2025.org",
      password: "admin123",
    },
  });

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      console.log("response", response);

      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">UNMA 2025</h2>
          <p className="mt-2 text-gray-600">Admin Portal</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={`form-input w-full ${
                errors.email ? "border-red-500" : ""
              }`}
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <a
                href="#"
                className="text-sm text-primary hover:text-primary-dark"
              >
                Forgot password?
              </a>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className={`form-input w-full ${
                errors.password ? "border-red-500" : ""
              }`}
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Use the following credentials for testing:</p>
          <p className="mt-1">Email: admin@unma2025.org</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
