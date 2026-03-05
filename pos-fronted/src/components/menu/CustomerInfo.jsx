import React, { useState, useEffect } from "react";

const CustomerInfo = ({ customer, orderType = "Dine In" }) => {
  const [dateTime, setDateTime] = useState(new Date());

  // Live date & time update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Hide component if no customer
  if (!customer) return null;

  // Get customer initials (fallback if name missing)
  const getInitials = (name) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 bg-[#1f1f1f] rounded-lg shadow-md w-full max-w-md mx-auto">
      
      {/* Customer Info */}
      <div className="flex flex-col items-start flex-1">
        {/* Customer Name */}
        <h1 className="text-md sm:text-lg text-white font-semibold tracking-wide">
          {customer.customer_name || "Guest"}
        </h1>

        {/* Order Type */}
        <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-1">
          {orderType}
        </p>

        {/* Date & Time */}
        <p className="text-xs sm:text-sm text-[#ababab] font-medium mt-2">
          {dateTime.toLocaleString()}
        </p>
      </div>

      {/* Avatar */}
      <div className="mt-3 sm:mt-0 sm:ml-4 bg-[#f6b100] flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full text-black font-bold text-lg sm:text-xl">
        {getInitials(customer.customer_name)}
      </div>
    </div>
  );
};

export default CustomerInfo;