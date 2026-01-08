import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

/**
 * Loader Component (DEFAULT EXPORT)
 */
const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default Loader;

/**
 * Error Message Component (NAMED EXPORT)
 */
export const ErrorMessage = ({ message, backPath = "/" }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center bg-white rounded-xl shadow-lg p-8">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">{message}</h2>

        <button
          onClick={() => navigate(backPath)}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};
