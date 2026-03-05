import React from "react";
import { FaCircle, FaCheckDouble } from "react-icons/fa";

const statusStyles = {
  CREATED: {
    text: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  READY: {
    text: "text-green-400",
    bg: "bg-green-500/10",
  },
  COMPLETED: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  CANCELLED: {
    text: "text-red-400",
    bg: "bg-red-500/10",
  },
};

const OrderCard = ({ order, onClick }) => {
  const calculatedTotal = Number(order?.grand_total ?? 0);
  const status = order?.order_status || "CREATED";

  return (
    <div
      onClick={onClick}
      className="
        w-full 
        bg-[#262626] 
        p-4 sm:p-5 
        rounded-xl 
        cursor-pointer 
        hover:bg-[#2e2e2e] 
        transition 
        shadow-md
      "
    >
      {/* ================= TOP SECTION ================= */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">

        {/* Customer Info */}
        <div>
          <h1 className="text-[#f5f5f5] text-base sm:text-lg font-semibold">
            {order?.customer_name || "Walk-in Customer"}
          </h1>

          <p className="text-[#ababab] text-xs sm:text-sm mt-1">
            Table → {order?.table_number || "-"}
          </p>
        </div>

        {/* Status + Items */}
        <div className="text-left sm:text-right">

          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-semibold
            ${statusStyles[status]?.text || "text-gray-400"}
            ${statusStyles[status]?.bg || "bg-gray-500/10"}
            `}
          >
            <FaCheckDouble className="mr-1" />
            {status}
          </div>

          <p className="text-xs sm:text-sm text-[#ababab] mt-2">
            <FaCircle className="inline mr-1 text-xs" />
            {order?.total_items || 0} Items
          </p>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-4 border-gray-700" />

      {/* ================= TOTAL SECTION ================= */}
      <div className="flex justify-between items-center text-[#f5f5f5] font-semibold text-sm sm:text-base">
        <span>Total</span>
        <span>₹ {calculatedTotal.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default OrderCard;