import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { getEmployeeAuth } from "../../utils/auth";

const OrderDetailsModal = ({ orderId, onClose, refresh }) => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const [confirmCancel, setConfirmCancel] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/orders-detailed/${orderId}`);
      setDetails(res.data.data || res.data || []);
    } catch (err) {
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);

      const token = getEmployeeAuth();
      if (!token) throw new Error("No auth token found");

      const res = await api.put(
        `/cancel/${orderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPopup({
        show: true,
        type: "success",
        message: res.data.message || "Order cancelled successfully!",
      });

      if (refresh) refresh();
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Failed to cancel order. Try again.",
      });
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  useEffect(() => {
    if (orderId) fetchDetails();
  }, [orderId]);

  if (!orderId) return null;

  const order = details[0];
  const subTotal = Number(order?.sub_total || 0);
  const taxAmount = Number(order?.tax_amount || 0);
  const grandTotal = Number(order?.grand_total || 0);

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">

        <div
          className="
            bg-[#1f1f1f]
            w-full
            max-w-3xl
            max-h-[90vh]
            overflow-y-auto
            rounded-2xl
            shadow-2xl
            p-5 sm:p-6 md:p-8
            relative
          "
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="sticky top-0 float-right text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>

          {loading && (
            <div className="text-white text-center py-10">
              Loading order details...
            </div>
          )}

          {error && (
            <div className="text-red-500 text-center py-10">
              {error}
            </div>
          )}

          {!loading && !error && details.length > 0 && (
            <>
              {/* HEADER */}
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Order #{order.order_id}
              </h2>

              <div className="text-gray-400 text-sm mb-6 space-y-1">
                <p>Table No: {order.table_number}</p>
                <p>
                  Customer: {order.customer_name || "Walk-in Customer"}
                </p>
                <p>
                  Status:{" "}
                  <span className="font-semibold text-yellow-300">
                    {order.order_status}
                  </span>
                </p>
              </div>

              {/* ITEMS */}
              <div className="divide-y divide-gray-700">
                {details.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:justify-between py-3 text-white gap-2"
                  >
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-gray-400 text-sm">
                        ₹ {Number(item.item_price).toFixed(2)} ×{" "}
                        {item.quantity}
                      </p>
                    </div>
                    <div className="font-semibold sm:text-right">
                      ₹ {Number(item.item_total).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* TOTALS */}
              <div className="border-t border-gray-700 mt-6 pt-4 text-white space-y-2 text-sm sm:text-base">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ {subTotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-300">
                  <span>Tax</span>
                  <span>₹ {taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold mt-2">
                  <span>Grand Total</span>
                  <span>₹ {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* CANCEL BUTTON */}
              {order.order_status !== "CANCELLED" &&
                order.order_status !== "COMPLETED" && (
                  <button
                    onClick={() => setConfirmCancel(true)}
                    disabled={cancelling}
                    className={`mt-6 w-full py-3 rounded-lg font-semibold transition
                      ${
                        cancelling
                          ? "bg-gray-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      } text-white`}
                  >
                    {cancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
            </>
          )}
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirmCancel && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[60] p-4">
          <div className="bg-[#2a2a2a] w-full max-w-sm rounded-xl shadow-2xl p-6 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-red-400 mb-4">
              Confirm Cancellation
            </h3>

            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              Are you sure you want to cancel this order?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setConfirmCancel(false)}
                className="px-5 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white"
              >
                No
              </button>

              <button
                onClick={handleCancelOrder}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= POPUP ================= */}
      {popup.show && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[70] p-4">
          <div className="bg-[#2a2a2a] w-full max-w-sm rounded-xl shadow-2xl p-6 text-center">
            <h3
              className={`text-lg sm:text-xl font-semibold mb-4 ${
                popup.type === "success"
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {popup.type === "success" ? "Success" : "Error"}
            </h3>

            <p className="text-gray-300 mb-6 text-sm sm:text-base">
              {popup.message}
            </p>

            <button
              onClick={() => {
                setPopup({ show: false, type: "", message: "" });
                if (popup.type === "success") onClose();
              }}
              className={`px-6 py-2 rounded-lg font-semibold ${
                popup.type === "success"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } text-white`}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsModal;