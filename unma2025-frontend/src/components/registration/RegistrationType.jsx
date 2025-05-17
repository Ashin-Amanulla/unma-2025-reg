import React, { useState } from "react";
import { loadScript } from "../../utils/razorpay";
import { toast } from "react-hot-toast";
import { usePayment } from "../../hooks/usePayment";

const RegistrationType = ({ onSelectType }) => {
  const { initiatePayment } = usePayment();
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [isProcessing, setIsProcessing] = useState(false);

  const registrationTypes = [
    {
      id: "Alumni",
      title: "Alumni",
      description:
        "Register as a former JNV student .",
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
      description:
        "Register as a current or former staff of JNV",
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
      description:
        "Register as a JNV alumni family member or as a guest",
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

  const quickAmounts = [
    { label: "₹1,000", value: 1000 },
    { label: "₹2,000", value: 2000 },
    { label: "₹5,000", value: 5000 },
    { label: "₹10,000", value: 10000 },
    { label: "Custom", value: "custom" },
  ];

  const currencies = [
    { code: "INR", symbol: "₹", name: "Indian Rupee" },
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
  ];

  const handleAmountSelect = (value) => {
    if (value === "custom") {
      setContributionAmount("");
    } else {
      setContributionAmount(value.toString());
    }
  };

  const handleAnonymousContribution = async () => {
    if (!contributionAmount || contributionAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsProcessing(true);
    try {
      await initiatePayment({
        amount: parseInt(contributionAmount) * (currency === "INR" ? 1 : 100), // Convert to paise for INR, cents for others
        name: "Anonymous",
        email: "anonymous@example.com",
        contact: "0000000000",
        currency: currency,
        notes: {
          registrationType: "Anonymous",
          isAttending: "No",
        },
        onSuccess: (response) => {
          toast.success("Thank you for your contribution!");
          setShowContributionModal(false);
          setContributionAmount("");
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

  const ContributionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
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

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.name} ({curr.symbol})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              {currencies.find((c) => c.code === currency)?.symbol}
            </span>
            <input
              type="number"
              value={contributionAmount}
              onChange={(e) => setContributionAmount(e.target.value)}
              className="w-full p-2 pl-8 border rounded-md"
              placeholder="Enter amount"
              min="1"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Amounts
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount.value}
                onClick={() => handleAmountSelect(amount.value)}
                className={`p-2 border rounded-md text-sm ${
                  contributionAmount === amount.value.toString()
                    ? "bg-blue-500 text-white border-blue-500"
                    : "hover:bg-gray-50"
                }`}
              >
                {amount.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowContributionModal(false)}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleAnonymousContribution}
            disabled={isProcessing || !contributionAmount}
            className={`px-4 py-2 rounded-md text-white ${
              isProcessing || !contributionAmount
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {isProcessing ? "Processing..." : "Contribute"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Select Your Connection to JNV
        </h2>
        <p className="text-gray-600 mt-2">
          Please select how you are connected to JNV for the UNMA SUMMIT 2025 event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {registrationTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onSelectType(type.id)}
            className="border rounded-lg p-6 hover:border-blue-500 hover:shadow-md transition-all flex flex-col items-center text-center"
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
