import React, { useEffect, useState } from "react";
import api from "../../utils/api";

const KitchenOrderModal = ({ order, onClose, refresh }) => {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({});
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch order details from /kitchen/orders
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        // Using /kitchen/orders to retrieve items for this order
        const res = await api.get(`/kitchen/orders`);
        const orderData = (res.data.data || []).find(
          (o) => o.order_id === order.order_id
        );

        const itemsData = orderData?.items || [];
        setItems(itemsData);

        // Customer info
        setCustomer({
          customer_name: orderData?.customer_name || "Walk-in Customer",
        });
      } catch (err) {
        console.error("Error fetching kitchen order:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (order) fetchOrderDetails();
  }, [order]);

  // Update Kitchen Status
  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      await api.patch(`/kitchen/orders/${order.order_id}/status`, { status });
      refresh(); // Refresh list
      onClose(); // Close modal
    } catch (err) {
      console.error("Error updating status:", err);
      setError("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Grand total calculation
  const calculatedTotal = items.reduce(
    (sum, i) => sum + Number(i.item_price * i.quantity || 0),
    0
  );

 return (
  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-3 sm:p-6">
    
    {/* Modal Container */}
    <div className="
      bg-[#1f1f1f] 
      w-full 
      sm:max-w-2xl 
      lg:max-w-3xl
      max-h-[95vh] 
      rounded-2xl sm:rounded-3xl 
      shadow-2xl 
      flex flex-col
    ">

      {/* ===== HEADER ===== */}
      <div className="sticky top-0 bg-[#1f1f1f] z-10 p-4 sm:p-6 border-b border-gray-700 flex justify-between items-start">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
            Order #{order.order_id}
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Table {order.table_number}
          </p>
        </div>

        <button
          onClick={onClose}
          className="text-white hover:text-gray-300 text-xl sm:text-2xl"
        >
          ✕
        </button>
      </div>

      {/* ===== BODY ===== */}
      <div className="overflow-y-auto px-4 sm:px-6 py-4 flex-1">

        {/* Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-white text-sm mb-6">
          <p><strong>Customer:</strong> {customer.customer_name}</p>
          <p><strong>Waiter:</strong> {order.waiter_name}</p>
          <p><strong>Status:</strong> {order.kitchen_status}</p>
          <p><strong>Sent:</strong> {new Date(order.sent_time).toLocaleString()}</p>
        </div>

        {/* Loading */}
        {loading && (
          <p className="text-center text-gray-400 py-10">
            Loading order details...
          </p>
        )}

        {/* Error */}
        {error && (
          <p className="text-center text-red-500 py-4">
            {error}
          </p>
        )}

        {/* Items */}
        {!loading && items.length > 0 && (
          <div className="bg-[#262626] rounded-xl p-4">
            <h3 className="text-white font-semibold text-lg sm:text-xl mb-3">
              Items
            </h3>

            <ul className="divide-y divide-gray-700">
              {items.map((item, index) => (
                <li
                  key={index}
                  className="flex justify-between py-3 text-white text-sm sm:text-base"
                >
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">
                      ₹ {Number(item.item_price).toFixed(2)} × {item.quantity}
                    </p>
                  </div>

                  <div className="font-semibold">
                    ₹ {(item.item_price * item.quantity).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Grand Total */}
        {!loading && items.length > 0 && (
          <div className="flex justify-between text-white font-bold text-base sm:text-lg mt-6">
            <span>Grand Total</span>
            <span>₹ {calculatedTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* ===== FOOTER BUTTONS ===== */}
      <div className="sticky bottom-0 bg-[#1f1f1f] border-t border-gray-700 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
        
        {order.kitchen_status === "PENDING" && (
          <button
            onClick={() => updateStatus("PREPARING")}
            disabled={updating}
            className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 
            text-black font-semibold px-5 py-2 rounded-full transition"
          >
            Start Cooking
          </button>
        )}

        {order.kitchen_status === "PREPARING" && (
          <button
            onClick={() => updateStatus("READY")}
            disabled={updating}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 
            text-white font-semibold px-5 py-2 rounded-full transition"
          >
            Mark Ready
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full sm:w-auto bg-gray-600 hover:bg-gray-700 
          text-white font-semibold px-5 py-2 rounded-full transition"
        >
          Close
        </button>
      </div>

    </div>
  </div>
);
};

export default KitchenOrderModal;
