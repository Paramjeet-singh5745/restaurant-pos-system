import React, { useEffect, useState, useCallback } from "react";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import OrderDetailsModal from "../components/orders/OrderDetailsModal";
import api from "../utils/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/orders", {
        params: {
          kitchenStatus: status || undefined,
          search: search || undefined,
        },
      });

      setOrders(res.data.data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  const statusColor = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PREPARING: "bg-orange-500/20 text-orange-400",
    READY: "bg-green-500/20 text-green-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };

  return (
    <section className="min-h-screen bg-[#1f1f1f] flex flex-col">
      
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* ================= HEADER ================= */}
        <div className="px-4 md:px-6 lg:px-10 py-6 border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-4">
              <BackButton />
              <h1 className="text-white text-2xl md:text-3xl font-bold">
                Orders
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

              <input
                type="text"
                placeholder="Search Order ID, Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-white border border-gray-600 
                focus:outline-none focus:border-white w-full sm:w-72"
              />

              <div className="flex gap-2 overflow-x-auto">
                {["", "PENDING", "PREPARING", "READY", "CANCELLED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition
                      ${
                        status === s
                          ? "bg-white text-black"
                          : "bg-[#2a2a2a] text-gray-400 hover:bg-[#3a3a3a]"
                      }`}
                  >
                    {s || "ALL"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="px-4 md:px-6 lg:px-10 mt-6 pb-6">

          {/* Desktop Header */}
          {orders.length > 0 && (
            <div className="hidden lg:grid grid-cols-6 px-6 py-4 border-b border-gray-700 text-gray-400 text-sm font-semibold bg-[#242424] rounded-t-xl">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Table</span>
              <span>Status</span>
              <span>Date</span>
              <span className="text-right">Total</span>
            </div>
          )}

          <div className="bg-[#242424] rounded-xl overflow-hidden shadow-lg">

            {loading ? (
              <div className="flex items-center justify-center py-20 text-gray-400">
                Loading...
              </div>
            ) : orders.length === 0 ? (
              /* ===== FULL EMPTY STATE ===== */
              <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <p className="text-lg font-semibold">No orders found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Orders will appear here once created.
                </p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.order_id}
                  onClick={() => setSelectedOrderId(order.order_id)}
                  className="border-b border-gray-800 hover:bg-[#2e2e2e] cursor-pointer transition"
                >
                  
                  {/* MOBILE */}
                  <div className="block sm:hidden p-4 text-white">
                    <div className="flex justify-between">
                      <span className="font-bold">#{order.order_id}</span>
                      <span className="font-semibold">
                        ₹ {Number(order.grand_total).toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-400 text-sm mt-1">
                      {order.customer_name}
                    </p>

                    <div className="flex justify-between mt-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[
                            order.kitchen_status || order.order_status
                          ] || ""
                        }`}
                      >
                        {order.kitchen_status || order.order_status}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatDate(order.order_datetime)}
                      </span>
                    </div>
                  </div>

                  {/* DESKTOP */}
                  <div className="hidden lg:grid grid-cols-6 px-6 py-4 text-sm text-white">
                    <span>#{order.order_id}</span>
                    <span>{order.customer_name}</span>
                    <span>Table {order.table_number}</span>

                    <span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[
                            order.kitchen_status || order.order_status
                          ] || ""
                        }`}
                      >
                        {order.kitchen_status || order.order_status}
                      </span>
                    </span>

                    <span className="text-gray-400">
                      {formatDate(order.order_datetime)}
                    </span>

                    <span className="text-right font-semibold">
                      ₹ {Number(order.grand_total).toFixed(2)}
                    </span>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ================= BOTTOM NAV ================= */}
      <footer className="sticky bottom-0 z-50 bg-[#111111] border-t border-gray-800">
        <BottomNav />
      </footer>

      {/* ================= MODAL ================= */}
      {selectedOrderId && (
        <OrderDetailsModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          refresh={fetchOrders}
        />
      )}

    </section>
  );
};

export default Orders;