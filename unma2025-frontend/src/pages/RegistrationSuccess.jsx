import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import confetti from "canvas-confetti";
import ScrollLink from "../components/ui/ScrollLink";

const RegistrationSuccess = () => {
  const location = useLocation();
  const { registrationData } = location.state || {};

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50;

      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2,
        },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-12 text-center">
            <div className="text-5xl mb-4 flex justify-center gap-4">
              <span>🎉</span>
              <span>🌟</span>
              <span>🎊</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Thank You, {registrationData?.name || "Navodayan"}!
            </h1>
            <p className="text-blue-100 text-lg">
              Your registration is complete and we can't wait to meet you!
            </p>
          </div>

          {/* Main Content */}
          <div className="px-8 py-10 space-y-8">
            {/* Payment Confirmation */}
            {registrationData?.contributionAmount > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  <span>💰</span> Payment Confirmation
                </h2>
                <div className="bg-green-50 rounded-lg p-6 space-y-3">
                  <div className="flex items-center justify-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-center text-green-900">
                    Payment Successful
                  </p>
                  <div className="flex justify-between border-b border-green-200 py-2">
                    <p className="text-gray-600">Contribution Amount:</p>
                    <p className="font-semibold text-green-800">
                      ₹{registrationData?.contributionAmount}
                    </p>
                  </div>
                  <div className="flex justify-between py-2">
                    <p className="text-gray-600">Status:</p>
                    <p className="font-semibold text-green-800">Completed</p>
                  </div>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    A receipt has been sent to your registered email address
                  </p>
                </div>
              </div>
            )}

            {/* Venue Details */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📍</span> Venue Details
              </h2>
              <div className="bg-blue-50 rounded-lg p-6 space-y-3">
                <p className="text-lg font-medium text-blue-900">
                  CIAL Convention Center
                </p>
                <p className="text-gray-600">
                  Cochin International Airport Limited
                  <br />
                  Airport Road, Nedumbassery
                  <br />
                  Kochi, Kerala - 683111
                </p>
                <a
                  href="https://maps.google.com/?q=CIAL+Convention+Center"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <span>🗺️</span>
                  <span className="ml-1 underline">View on Google Maps</span>
                </a>
              </div>
            </div>

            {/* What to Expect */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>🌈</span> What to Expect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="font-medium text-green-800 mb-2">
                    🤝 Networking Opportunities
                  </p>
                  <p className="text-green-600">
                    Connect with fellow Navodayans from various batches and
                    fields
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="font-medium text-purple-800 mb-2">
                    🎭 Cultural Programs
                  </p>
                  <p className="text-purple-600">
                    Enjoy amazing performances and participate in activities
                  </p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="font-medium text-yellow-800 mb-2">
                    🍽️ Delicious Food
                  </p>
                  <p className="text-yellow-600">
                    Savor a variety of cuisines prepared just for you
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="font-medium text-red-800 mb-2">
                    💝 Memorable Moments
                  </p>
                  <p className="text-red-600">
                    Create lasting memories with your JNV family
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <span>📝</span> Next Steps
              </h2>
              <ul className="list-none space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Check your email for the confirmation details</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>
                    Join our WhatsApp group for updates (link in email)
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500">✓</span>
                  <span>Follow our social media for event updates</span>
                </li>
              </ul>
            </div>

            {/* Need Help Section */}
            <div className="bg-gray-50 rounded-lg p-6 mt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <span>🤔</span> Need Help?
              </h3>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Have questions or facing issues? We're here to help!
                </p>
                <div className="flex flex-wrap gap-4">
                  <ScrollLink
                    to="/report-issue"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    🐛 Report an Issue
                  </ScrollLink>
                  <a
                    href="mailto:support@unma.in"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    ✉️ Email Support
                  </a>
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    📞 Call Helpline
                  </a>
                  <ScrollLink
                    to="/"
                    className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50"
                  >
                    🏠 Return Home
                  </ScrollLink>
                </div>
              </div>
            </div>

            {/* Fun Quote */}
            <div className="text-center mt-8 pt-8 border-t border-gray-200">
              <p className="text-lg text-gray-600 italic">
                "The JNV spirit never graduates - it just keeps getting
                stronger! 💪"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
