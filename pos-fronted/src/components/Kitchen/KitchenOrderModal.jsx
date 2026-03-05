
import React, { useState } from "react";
import api from "../../utils/api";

const KitchenOrderModal = ({ order, onClose, refresh }) => {
  const [updating, setUpdating] = useState(false);

  if (!order) return null;

  const statusColor = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PREPARING: "bg-orange-500/20 text-orange-400",
    READY: "bg-green-500/20 text-green-400",
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await api.patch(`/kitchen/orders/${order.order_id}/status`, {
        status: newStatus,
      });

      refresh(); // refresh kitchen list
      onClose(); // close modal
    } catch (error) {
      console.error("Status update failed:", error);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const totalAmount = Array.isArray(order.items)
    ? order.items.reduce(
        (sum, item) => sum + item.quantity * item.item_price,
        0
      )
    : 0;

  const formatDate = (date) => new Date(date).toLocaleString();
return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-3 sm:p-6">
    
    {/* Modal Container */}
    <div className="
      bg-[#1f1f1f] 
      w-full 
      sm:max-w-2xl 
      lg:max-w-3xl 
      max-h-[95vh] 
      rounded-2xl 
      shadow-2xl 
      flex flex-col
    ">

      {/* ===== HEADER ===== */}
      <div className="sticky top-0 bg-[#1f1f1f] border-b border-gray-700 p-4 sm:p-6 flex justify-between items-start">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            Order #{order.order_id}
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {formatDate(order.sent_time)}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ✖
        </button>
      </div>

      {/* ===== BODY (Scrollable) ===== */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm">
          
          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <p className="text-gray-400">Table</p>
            <p className="text-white font-semibold">
              Table {order.table_number}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <p className="text-gray-400">Waiter</p>
            <p className="text-white font-semibold">
              {order.waiter_name}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <p className="text-gray-400">Customer</p>
            <p className="text-white font-semibold">
              {order.customer_name || "Walk-in"}
            </p>
          </div>

          <div className="bg-[#2a2a2a] p-4 rounded-lg">
            <p className="text-gray-400">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                statusColor[order.kitchen_status] || ""
              }`}
            >
              {order.kitchen_status}
            </span>
          </div>

        </div>

        {/* ===== Items Section ===== */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3">
            Ordered Items
          </h3>

          <div className="bg-[#2a2a2a] rounded-lg overflow-x-auto">
            <div className="min-w-[500px]">
              
              {/* Table Header */}
              <div className="grid grid-cols-4 px-4 py-2 border-b border-gray-700 text-gray-400 text-xs sm:text-sm font-semibold">
                <span>Item</span>
                <span>Price</span>
                <span>Qty</span>
                <span className="text-right">Total</span>
              </div>

              {/* Table Body */}
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div
                    key={item.order_item_id}
                    className="grid grid-cols-4 px-4 py-3 border-b border-gray-800 text-xs sm:text-sm text-white"
                  >
                    <span>{item.item_name}</span>
                    <span>₹{item.item_price}</span>
                    <span>{item.quantity}</span>
                    <span className="text-right">
                      ₹{item.quantity * item.item_price}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-gray-400 text-sm">
                  No items found.
                </p>
              )}
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-end mt-4">
            <div className="text-right">
              <p className="text-gray-400 text-xs sm:text-sm">
                Grand Total
              </p>
              <p className="text-lg sm:text-xl font-bold text-green-400">
                ₹{totalAmount}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ===== FOOTER BUTTONS ===== */}
      <div className="sticky bottom-0 bg-[#1f1f1f] border-t border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
        
        {["PENDING", "PREPARING", "READY"].map((status) => (
          <button
            key={status}
            disabled={updating || order.kitchen_status === status}
            onClick={() => handleStatusUpdate(status)}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm transition
              ${
                order.kitchen_status === status
                  ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white"
              }
            `}
          >
            {updating ? "Updating..." : status}
          </button>
        ))}

        <button
          onClick={onClose}
          className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
        >
          Close
        </button>
      </div>

    </div>
  </div>
);
};

export default KitchenOrderModal;
