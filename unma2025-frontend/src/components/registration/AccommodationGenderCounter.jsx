import React from "react";
import { motion } from "framer-motion";

const defaultValues = {
  male: 0,
  female: 0,
};

const AccommodationGenderCounter = ({ values = defaultValues, onChange }) => {
  // Ensure values is never undefined
  const currentValues = values || defaultValues;

  const handleCountChange = (gender, value) => {
    const newValues = {
      ...currentValues,
      [gender]: Math.max(0, value),
    };
    onChange(newValues);
  };

  const renderCounter = (gender, label) => {
    const count = currentValues[gender] || 0;

    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => handleCountChange(gender, count - 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          disabled={count === 0}
        >
          -
        </button>
        <span className="w-8 text-center text-gray-700">{count}</span>
        <button
          type="button"
          onClick={() => handleCountChange(gender, count + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    );
  };

  const getTotalCount = () => {
    return (currentValues.male || 0) + (currentValues.female || 0);
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 p-4 md:p-6"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Number of people needing accommodation
            </h3>
            <p className="text-sm text-gray-500">
              Total: {getTotalCount()} people
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                 Male
              </label>
              <div className="flex justify-center">
                {renderCounter("male", "Male")}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Female
              </label>
              <div className="flex justify-center">
                {renderCounter("female", "Female")}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 text-center">
                Others
              </label>
              <div className="flex justify-center">
                {renderCounter("other", "Others")}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {getTotalCount() > 0 && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Summary</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-sm text-blue-800">
              Male: {currentValues.male || 0}
            </div>
            <div className="text-sm text-blue-800">
              Female: {currentValues.female || 0}
            </div>
            <div className="text-sm text-blue-800">
              Total: {getTotalCount()} people
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccommodationGenderCounter;
