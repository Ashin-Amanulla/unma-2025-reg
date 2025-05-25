import React, { useState } from "react";
import { toast } from "react-toastify";
import AlertDialog from "../ui/AlertDialog";

const FinancialDifficultyDialog = ({
  isOpen,
  onClose,
  totalExpense,
  contributionAmount,
  userSchool,
  onProceedWithPayment,
  onAddMoreAmount,
}) => {
  const [showSecondDialog, setShowSecondDialog] = useState(false);

  const handleFirstDialogCancel = () => {
    // Close first dialog and show second dialog
    setShowSecondDialog(true);
  };

  const handleSecondDialogConfirm = () => {
    // Close the dialog first
    setShowSecondDialog(false);
    onClose();

    // Show the toast notification after a brief delay
    setTimeout(() => {
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

      // Proceed with payment after showing toast
      setTimeout(() => {
        onProceedWithPayment();
      }, 500);
    }, 300);
  };

  const handleFirstDialogConfirm = () => {
    onClose();
    onAddMoreAmount();
  };

  const handleSecondDialogCancel = () => {
    setShowSecondDialog(false);
    onClose();
    onAddMoreAmount();
  };

  const handleClose = () => {
    setShowSecondDialog(false);
    onClose();
  };

  return (
    <>
      {/* First Dialog - Minimum Contribution Required */}
      <AlertDialog
        isOpen={isOpen && !showSecondDialog}
        onClose={handleClose}
        onConfirm={handleFirstDialogConfirm}
        onCancel={handleFirstDialogCancel}
        title="💰 Minimum Contribution Required"
        message={
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
                      If you're facing financial difficulties, please reach out
                      to your JNV Alumni Association leadership, BOT, or batch
                      representative for assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
        confirmText="💰 Add More Amount"
        cancelText="Submit Despite Financial Difficulty"
        type="warning"
      />

      {/* Second Dialog - Confirm Registration Status */}
      <AlertDialog
        isOpen={showSecondDialog}
        onClose={handleClose}
        onConfirm={handleSecondDialogConfirm}
        onCancel={handleSecondDialogCancel}
        title="⚠️ Confirm Registration Status"
        message={
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
                  contact your JNV Alumni Association leadership, BOT, or batch
                  representative who can help complete your registration.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700">
                <p className="font-medium mb-2">📞 What happens next?</p>
                <p>
                  A representative from <strong>{userSchool}</strong> will
                  contact you to discuss your situation and help complete your
                  registration.
                </p>
              </div>
            </div>
          </div>
        }
        confirmText="Submit with Current Amount"
        cancelText="💰 Add More Money"
        type="warning"
      />
    </>
  );
};

export default FinancialDifficultyDialog;
