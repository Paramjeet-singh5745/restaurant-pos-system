import React, { useState, useMemo } from "react";
import { FaSearch } from "react-icons/fa";

/* =========================================
   STATUS COLOR HELPER
========================================= */
const getStatusStyle = (status = "PENDING") => {
  switch (status) {
    case "COMPLETED":
      return "text-emerald-400";
    case "PREPARING":
      return "text-purple-400";
    case "CANCELLED":
      return "text-red-400";
    default:
      return "text-yellow-400";
  }
};

/* =========================================
   SINGLE ORDER ITEM
========================================= */
const OrderItem = ({ order }) => {
  const name =
    order?.full_name || order?.customerName || "Unknown Customer";
  const table =
    order?.table_number || order?.tableNo || "-";
  const status = order?.order_status || "PENDING";

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#242424] hover:bg-[#2d2d2d] transition-all duration-300 rounded-xl p-4">

      {/* LEFT SIDE */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
        <h2 className="text-white font-semibold text-sm sm:text-base">
          {name}
        </h2>
        <p className="text-gray-400 text-xs sm:text-sm">
          Table {table}
        </p>
      </div>

      {/* RIGHT SIDE */}
      <span
        className={`mt-2 sm:mt-0 font-semibold text-xs sm:text-sm ${getStatusStyle(
          status
        )}`}
      >
        {status}
      </span>
    </div>
  );
};

/* =========================================
   MAIN RECENT ORDERS COMPONENT
========================================= */
const RecentOrders = ({ recentOrders = [] }) => {
  const [search, setSearch] = useState("");

  const orders = Array.isArray(recentOrders)
    ? recentOrders
    : [];

  /* =========================================
     FILTERED ORDERS
  ========================================= */
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const name =
        order?.full_name || order?.customerName || "";
      const table =
        order?.table_number?.toString() ||
        order?.tableNo?.toString() ||
        "";

      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        table.includes(search)
      );
    });
  }, [orders, search]);

  return (
    <div className="w-full mt-8">
      <div className="bg-[#1f1f1f] border border-gray-700 rounded-2xl shadow-md">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-5 py-4 border-b border-gray-700">
          <h1 className="text-white text-lg sm:text-xl font-semibold tracking-wide">
            Recent Orders
          </h1>

          <button className="text-blue-400 text-sm sm:text-base font-medium hover:underline">
            View All
          </button>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-3 bg-[#242424] rounded-xl px-4 py-3 border border-gray-700">
            <FaSearch className="text-gray-400 text-sm" />
            <input
              type="text"
              placeholder="Search by customer or table..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-white w-full text-sm sm:text-base placeholder-gray-500"
            />
          </div>
        </div>

        {/* ================= ORDER LIST ================= */}
        <div className="px-5 py-4 max-h-[300px] sm:max-h-[400px] lg:max-h-[500px] overflow-y-auto space-y-4">

          {filteredOrders.length === 0 ? (
            <div className="flex justify-center items-center py-10">
              <p className="text-gray-400 text-sm sm:text-base">
                No recent orders found.
              </p>
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <OrderItem
                key={order?.order_id || index}
                order={order}
              />
            ))
          )}

        </div>
      </div>
    </div>
  );
};

export default RecentOrders;