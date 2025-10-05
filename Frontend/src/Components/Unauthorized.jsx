import React from "react";

const Unauthorized = () => {
  return (
    <div className="flex items-center justify-center h-screen text-center">
      <div>
        <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized</h1>
        <p className="text-gray-700 text-lg">
          You are not authorized to view this page.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
