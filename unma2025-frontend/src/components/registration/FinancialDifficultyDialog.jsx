import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";

const FinancialDifficultyDialog = ({
  isOpen,
  onClose,
  totalExpense,
  onConfirm,
  contributionAmount,
  userSchool,
  onProceedWithPayment,
  onAddMoreAmount,
}) => {
  const [showSecondDialog, setShowSecondDialog] = useState(false);

  const handleSubmitDespiteFinancialDifficulty = () => {
    setShowSecondDialog(true);
  };

  const handleAddMoreAmount = (e) => {
    // Prevent any default browser behavior
    if (e) e.preventDefault();

    // Close the dialog first
    onClose();

    // Small delay to ensure dialog is closed before focusing
    setTimeout(() => {
      // Focus on contribution amount field
      const contributionField =
        document.getElementsByName("contributionAmount")[0];
      if (contributionField) {
        contributionField.focus();
      }

      // Call the parent handler
      onAddMoreAmount();
    }, 100);
  };

  const handleSubmitWithCurrentAmount = async (e) => {
    // Prevent any default behavior
    if (e) e.preventDefault();

    setShowSecondDialog(false);
    onClose();

    //send backend not paid
    await onConfirm();

    toast.info(
      `📞 A representative from ${userSchool} will contact you to enquire about your situation and help complete your registration.`,
      {
        autoClose: 8000,
        position: "top-center",
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  const handleClose = () => {
    setShowSecondDialog(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
            onClick={handleClose}
          />

          {/* First Dialog */}
          {!showSecondDialog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl w-full max-w-2xl mx-auto">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center text-center">
                  💰 Minimum Contribution Required
                </h2>

                {/* Content */}
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-amber-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">
                          Contribution Amount Notice
                        </h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            Based on your attendee count, the minimum suggested
                            contribution is <strong>₹{totalExpense}</strong>.
                          </p>
                          <p>
                            Your current contribution:{" "}
                            <strong>₹{contributionAmount}</strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-blue-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">
                          Financial Assistance Available
                        </h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            If any alumni are facing difficulty in making the
                            payment, they are kindly requested to reach out to
                            their JNV Alumni Association leadership or batch
                            representative for support with registration.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-evenly space-x-3">
                  <button
                    onClick={handleSubmitDespiteFinancialDifficulty}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Submit Despite Financial Difficulty
                  </button>
                  <button
                    onClick={handleAddMoreAmount}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    💰 Add More Amount
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Second Dialog */}
          {showSecondDialog && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xl w-full max-w-2xl mx-auto">
                {/* Close button */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title */}
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  ⚠️ Confirm Registration Status
                </h2>

                {/* Content */}
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Registration Will Be Marked Incomplete
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Your registration will be marked as{" "}
                            <strong>INCOMPLETE</strong> due to insufficient
                            contribution.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-2">
                        💡 We understand financial situations vary
                      </p>
                      <p>
                        If you're genuinely facing financial difficulty, please
                        contact your JNV Alumni Association leadership, BOT, or
                        batch representative who can help complete your
                        registration.
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-sm text-green-700">
                      <p className="font-medium mb-2">📞 What happens next?</p>
                      <p>
                        A representative from <strong>{userSchool}</strong> will
                        contact you to discuss your situation and help complete
                        your registration.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-evenly space-x-3">
                  <button
                    onClick={handleAddMoreAmount}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    💰 Add More Money
                  </button>
                  <button
                    onClick={handleSubmitWithCurrentAmount}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Notify Alumni Association
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default FinancialDifficultyDialog;
