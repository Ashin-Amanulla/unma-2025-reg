import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const AlertDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  singleButton = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          container: "bg-red-50 border-red-200",
          title: "text-red-800",
          message: "text-red-700",
          confirmButton: "bg-red-600 hover:bg-red-700",
        };
      case "success":
        return {
          container: "bg-green-50 border-green-200",
          title: "text-green-800",
          message: "text-green-700",
          confirmButton: "bg-green-600 hover:bg-green-700",
        };
      case "info":
      default:
        return {
          container: "bg-blue-50 border-blue-200",
          title: "text-blue-800",
          message: "text-blue-700",
          confirmButton: "bg-blue-600 hover:bg-blue-700",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={`relative rounded-xl border p-6 shadow-xl w-full max-w-2xl mx-auto ${styles.container}`}
            >
              {/* Close button */}
              <button
                onClick={onClose}
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

              {/* Content */}
              <div className="text-center">
                <h3 className={`text-xl font-semibold mb-4 ${styles.title}`}>
                  {title}
                </h3>
                <div className={`prose prose-sm max-w-none ${styles.message}`}>
                  {message}
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-center">
                {singleButton ? (
                  <button
                    onClick={onConfirm}
                    className={`inline-flex items-center px-6 py-2.5 border border-transparent text-base font-medium rounded-md text-white ${styles.confirmButton} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {confirmText}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={onClose}
                      className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {cancelText}
                    </button>
                    <button
                      onClick={onConfirm}
                      className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-white bg-red-900 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      {confirmText}
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AlertDialog;
