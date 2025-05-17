import React from "react";

const RegistrationType = ({ onSelectType }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-6">
        Select Registration Type
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Please select your connection to JNV for the UNMA 2025 event
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onSelectType("Alumni")}
          className="flex flex-col items-center p-6 border-2 border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition duration-200"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-blue-600"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Alumni</h3>
          <p className="text-sm text-gray-600 text-center">
            Former students of JNV
          </p>
        </button>

        <button
          onClick={() => onSelectType("Staff")}
          className="flex flex-col items-center p-6 border-2 border-green-200 rounded-lg hover:bg-green-50 hover:border-green-500 transition duration-200"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Staff</h3>
          <p className="text-sm text-gray-600 text-center">
            Current or former staff of JNV
          </p>
        </button>

        <button
          onClick={() => onSelectType("Other")}
          className="flex flex-col items-center p-6 border-2 border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-500 transition duration-200"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-purple-600"
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
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Other</h3>
          <p className="text-sm text-gray-600 text-center">
            Friends, family, or other guests
          </p>
        </button>
      </div>
    </div>
  );
};

export default RegistrationType;
