import React from "react";
import { FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const CustomModal = ({ isOpen, type, message, onClose }) => {
  if (!isOpen) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#1f1f1f] w-[400px] rounded-xl p-6 text-center shadow-2xl">

        {/* Icon */}
        <div className="flex justify-center mb-4">
          {isSuccess ? (
            <FaCheckCircle size={60} className="text-green-500" />
          ) : (
            <FaExclamationTriangle size={60} className="text-red-500" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-white text-lg font-semibold mb-6">
          {message}
        </h2>

        {/* Button */}
        <button
          onClick={onClose}
          className={`px-6 py-2 rounded-lg font-semibold text-white ${
            isSuccess
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomModal;
