import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { loadScript } from "../../utils/razorpay";
import { toast } from "react-toastify";
import { usePayment } from "../../hooks/usePayment";
import registrationsApi from "../../api/registrationsApi";
import { v4 as uuidv4 } from "uuid";
const RegistrationType = ({ onSelectType }) => {
  const { initiatePayment } = usePayment();
  const [showContributionModal, setShowContributionModal] = useState(false);

  const registrationTypes = [
    {
      id: "Alumni",
      title: "Alumni",
      description: "Register as a former JNV student .",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "Staff",
      title: "Staff",
      description: "Register as a current or former staff of JNV",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-green-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: "Other",
      title: "Other",
      description: "Register as a JNV alumni family member or as a guest",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-purple-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
  ];

  const ContributionModal = () => {
    const [isProcessing, setIsProcessing] = useState(false);

    const {
      register,
      handleSubmit,
      watch,
      reset,
      formState: { errors },
    } = useForm({
      defaultValues: {
        amount: "",
      },
    });

    const watchedAmount = watch("amount");

    const onSubmitContribution = async (data) => {
      if (!data.amount || data.amount <= 0) {
        toast.error("Please enter a valid amount");
        return;
      }

      setIsProcessing(true);
      try {
        await initiatePayment({
          amount: parseInt(data.amount), // Amount in INR
          name: "Anonymous",
          email: "anonymous@example.com",
          contact: "0000000000",
          currency: "INR",
          notes: {
            registrationType: "Anonymous",
            isAttending: "No",
          },
          onSuccess: async (response) => {
            const registrationId = uuidv4();
            let payload = {
              amount: parseInt(data.amount),
              name: "Anonymous",
              email: "anonymous@example.com",
              contact: "0000000000",
              currency: "INR",
              isAnonymous: true,
              paymentMethod: "razorpay",
              paymentGatewayResponse: response,
              purpose: "contribution",
            };
            try {
              await registrationsApi.transactionRegister(
                registrationId,
                payload
              );
            } catch (error) {
              console.error("Transaction registration failed:", error);
              toast.error(
                "Transaction registration failed. Please try again later."
              );
            }

            toast.success("Thank you for your contribution!");
            setShowContributionModal(false);
            reset(); // Reset form
          },
          onFailure: (error) => {
            console.error("Payment failed:", error);
            toast.error("Payment failed. Please try again.");
          },
        });
      } catch (error) {
        console.error("Payment error:", error);
        toast.error("Something went wrong. Please try again later.");
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Make an Anonymous Contribution
            </h3>
            <button
              onClick={() => setShowContributionModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
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
          </div>

          {/* Domestic Contribution Section */}
          <form onSubmit={handleSubmit(onSubmitContribution)} className="mb-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              Domestic Contribution (India)
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₹
                </span>
                <input
                  type="number"
                  {...register("amount", {
                    required: "Amount is required",
                    min: {
                      value: 1,
                      message: "Amount must be at least ₹1",
                    },
                    max: {
                      value: 1000000,
                      message: "Amount cannot exceed ₹10,00,000",
                    },
                    valueAsNumber: true,
                  })}
                  className={`w-full p-3 pl-8 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter amount in INR"
                  min="1"
                  step="1"
                  autoComplete="off"
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !watchedAmount}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isProcessing || !watchedAmount
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
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
                  Processing Payment...
                </div>
              ) : (
                "Proceed to Payment Gateway"
              )}
            </button>
          </form>

          {/* NRE Account Information */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              NRE Account Details
            </h4>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 leading-snug">
                <span className="font-medium">International Transfer:</span> Use
                the NRE account below :
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-100 px-3 py-2 border-b border-blue-200">
                <h5 className="font-semibold text-gray-800 text-sm leading-tight">
                  Ciju Kurian - IDBI Bank, Tiruvalla, Kerala (689101)
                </h5>
              </div>

              <div className="p-0">
                <table className="w-full text-xs">
                  <tbody>
                    <tr className="border-b border-blue-100">
                      <td className="py-1.5 px-3 font-medium text-gray-700 bg-blue-50 w-2/5">
                        Account Type
                      </td>
                      <td className="py-1.5 px-3 text-gray-800">
                        Savings Account
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-1.5 px-3 font-medium text-gray-700 bg-blue-50 w-2/5">
                        IFS Code
                      </td>
                      <td className="py-1.5 px-3 text-gray-800 font-mono">
                        IBKL0000029
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100">
                      <td className="py-1.5 px-3 font-medium text-gray-700 bg-blue-50 w-2/5">
                        Swift Code
                      </td>
                      <td className="py-1.5 px-3 text-gray-800 font-mono">
                        IBKLINBB737
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-3 font-medium text-gray-700 bg-blue-50 w-2/5">
                        NRE Account No.
                      </td>
                      <td className="py-1.5 px-3 text-gray-800 font-mono font-semibold">
                        0029104000114851
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={() => setShowContributionModal(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-red-900 mb-2 flex items-center">
            💻 Recommended: Use PC/Laptop for Best Experience
          </h3>
        </div>
        <p className="text-blue-800 text-sm mb-3 leading-relaxed">
        This form is quite detailed and contains multiple sections. For the best experience and easier navigation, we recommend using a PC or laptop.
        </p>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Select Your Connection to JNV
        </h2>

        <p className="text-gray-600 mt-2">
          Please select how you are connected to JNV for the UNMA SUMMIT 2025
          event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registrationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            disabled={type.id !== "Alumni"}
            className={`border rounded-lg p-6 transition-all flex flex-col items-center text-center ${
              type.id !== "Alumni"
                ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                : "hover:border-blue-500 hover:shadow-md border-gray-200 bg-white text-gray-900 cursor-pointer"
            }`}
          >
            <div className="mb-4">{type.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
            <p className="text-gray-600 text-sm">{type.description}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 text-center">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        <button
          onClick={() => setShowContributionModal(true)}
          className="mt-6 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          Contribute
        </button>
        <p className="mt-2 text-sm text-gray-500">
          Make a contribution without registering
        </p>
      </div>

      {showContributionModal && <ContributionModal />}
    </div>
  );
};

export default RegistrationType;
