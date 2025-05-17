import React from "react";
import { motion } from "framer-motion";

const AgeGroup = {
  ADULTS: "adults",
  TEENS: "teens",
  CHILDREN: "children",
  TODDLERS: "toddlers",
};

const ageGroupLabels = {
  [AgeGroup.ADULTS]: "18+ years (including you)",
  [AgeGroup.TEENS]: "12-18 years",
  [AgeGroup.CHILDREN]: "6-11 years",
  [AgeGroup.TODDLERS]: "2-5 years",
};

const defaultValues = {
  adults: { veg: 0, nonVeg: 0 },
  teens: { veg: 0, nonVeg: 0 },
  children: { veg: 0, nonVeg: 0 },
  toddlers: { veg: 0, nonVeg: 0 },
};

const AttendeeCounter = ({ values = defaultValues, onChange }) => {
  // Ensure values is never undefined
  const currentValues = values || defaultValues;

  const handleCountChange = (ageGroup, type, foodType, value) => {
    const newValues = {
      ...currentValues,
      [ageGroup]: {
        ...currentValues[ageGroup],
        [foodType]: Math.max(0, value),
      },
    };
    onChange(newValues);
  };

  const getTotalCount = (ageGroup) => {
    const group = currentValues[ageGroup] || { veg: 0, nonVeg: 0 };
    return (group.veg || 0) + (group.nonVeg || 0);
  };

  const renderCounter = (ageGroup, type, foodType) => {
    const count = currentValues[ageGroup]?.[foodType] || 0;

    return (
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => handleCountChange(ageGroup, type, foodType, count - 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
          disabled={count === 0}
        >
          -
        </button>
        <span className="w-8 text-center text-gray-700">{count}</span>
        <button
          type="button"
          onClick={() => handleCountChange(ageGroup, type, foodType, count + 1)}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition-colors"
        >
          +
        </button>
      </div>
    );
  };

  const calculateTotal = (type) => {
    return Object.values(AgeGroup).reduce(
      (sum, group) => sum + (currentValues[group]?.[type] || 0),
      0
    );
  };

  return (
    <div className="space-y-6">
      {Object.values(AgeGroup).map((ageGroup) => (
        <motion.div
          key={ageGroup}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 md:p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">
                {ageGroupLabels[ageGroup]}
              </h3>
              <p className="text-sm text-gray-500">
                Total: {getTotalCount(ageGroup)}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vegetarian
                </label>
                {renderCounter(ageGroup, "count", "veg")}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Non-Vegetarian
                </label>
                {renderCounter(ageGroup, "count", "nonVeg")}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800">Summary</h4>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-sm text-blue-800">
            Total Vegetarian: {calculateTotal("veg")}
          </div>
          <div className="text-sm text-blue-800">
            Total Non-Vegetarian: {calculateTotal("nonVeg")}
          </div>
          <div className="col-span-1 md:col-span-2 text-sm text-blue-800">
            Total Attendees: {calculateTotal("veg") + calculateTotal("nonVeg")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendeeCounter;
