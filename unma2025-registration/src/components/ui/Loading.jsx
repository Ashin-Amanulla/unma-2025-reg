import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center w-full h-64">
      <div className="flex flex-col items-center">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-t-primary rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default Loading;
