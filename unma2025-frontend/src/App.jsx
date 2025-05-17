import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loading from "./components/ui/Loading";
import AdminLayout from "./components/layout/AdminLayout";
import BasicLayout from "./components/layout/BasicLayout";
import Header, { FloatingReportButton } from "./components/layout/Header";
import Footer from "./components/layout/Footer";
// Lazy load pages
const Home = lazy(() => import("./pages/Home"));
const Registration = lazy(() => import("./pages/Registration"));
// const Success = lazy(() => import("./pages/Success"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminRegistrations = lazy(() => import("./pages/admin/Registrations"));
const CreateRegistration = lazy(() =>
  import("./pages/admin/CreateRegistration")
);
const NotFound = lazy(() => import("./pages/NotFound"));
const Analytics = lazy(() => import("./pages/admin/Analytics"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const RegistrationSuccess = lazy(() => import("./pages/RegistrationSuccess"));
const Contact = lazy(() => import("./pages/Contact"));
import ReportIssue from "./pages/ReportIssue";
import AlumniRegistrationForm from "./components/registration/AlumniRegistrationForm";

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow">
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<BasicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/register" element={<Registration />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/registration-success"
                  element={<RegistrationSuccess />}
                />
                <Route path="/report-issue" element={<ReportIssue />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="registrations" element={<AdminRegistrations />} />
                <Route
                  path="create-registration"
                  element={<CreateRegistration />}
                />
                <Route path="analytics" element={<Analytics />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <FloatingReportButton />
      </div>
    </Router>
  );
}

export default App;
