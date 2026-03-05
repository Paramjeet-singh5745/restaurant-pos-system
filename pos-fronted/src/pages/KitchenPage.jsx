import React, { useEffect, useState, useCallback } from "react";
import BottomNav from "../components/shared/BottomNav";
import KitchenOrderModal from "../components/Kitchen/KitchenOrderModal";
import api from "../utils/api";
import BackButton from "../components/shared/BackButton";

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get("/kitchen/orders", {
        params: {
          status: status || undefined,
          search: search || undefined,
        },
      });

      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("Error fetching kitchen orders:", err);
      setError("Failed to load kitchen orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const statusColor = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PREPARING: "bg-orange-500/20 text-orange-400",
    READY: "bg-green-500/20 text-green-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };

  const selectedOrder = orders.find(
    (o) => o.order_id === selectedOrderId
  );

  return (
    <section className="min-h-screen bg-[#1f1f1f] flex flex-col">
      
      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-y-auto">

        {/* ================= HEADER ================= */}
        <div className="px-4 sm:px-6 lg:px-10 py-6 border-b border-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                👨‍🍳 Kitchen Dashboard
              </h1>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

              <input
                type="text"
                placeholder="Search Order, Customer, Table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[#2a2a2a] text-white border border-gray-600 
                focus:outline-none focus:border-white w-full sm:w-64"
              />

              <div className="flex flex-wrap gap-2">
                {["", "PENDING", "PREPARING", "READY", "CANCELLED"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition
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
        <div className="px-4 sm:px-6 lg:px-10 mt-6 pb-6">

          {loading ? (
            <div className="flex items-center justify-center py-24 text-gray-400">
              Loading orders...
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-24 text-red-500">
              {error}
            </div>
          ) : orders.length === 0 ? (
            /* ===== EMPTY STATE ===== */
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p className="text-lg font-semibold">No kitchen orders</p>
              <p className="text-sm text-gray-500 mt-2">
                Orders will appear here when sent to kitchen.
              </p>
            </div>
          ) : (
            <div className="bg-[#242424] rounded-xl shadow-lg overflow-x-auto">

              <div className="min-w-[700px]">
                
                {/* TABLE HEADER */}
                <div className="grid grid-cols-6 px-6 py-4 border-b border-gray-700 text-gray-400 text-sm font-semibold">
                  <span>Order ID</span>
                  <span>Table</span>
                  <span>Waiter</span>
                  <span>Status</span>
                  <span>Date</span>
                  <span className="text-right">Items</span>
                </div>

                {/* TABLE ROWS */}
                {orders.map((order) => {
                  const totalItems = Array.isArray(order.items)
                    ? order.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )
                    : order.total_items || 0;

                  return (
                    <div
                      key={order.order_id}
                      onClick={() => setSelectedOrderId(order.order_id)}
                      className="grid grid-cols-6 px-6 py-4 border-b border-gray-800 
                      text-sm text-white hover:bg-[#2e2e2e] cursor-pointer transition"
                    >
                      <span>#{order.order_id}</span>
                      <span>Table {order.table_number}</span>
                      <span>{order.waiter_name}</span>

                      <span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColor[
                              order.kitchen_status || order.order_status
                            ] || ""
                          }`}
                        >
                          {order.kitchen_status ||
                            order.order_status ||
                            "PENDING"}
                        </span>
                      </span>

                      <span className="text-gray-400">
                        {order.sent_time}
                      </span>

                      <span className="text-right font-semibold">
                        {totalItems}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= BOTTOM NAV ================= */}
      <footer className="sticky bottom-0 z-50 bg-[#111111] border-t border-gray-800">
        <BottomNav />
      </footer>

      {/* ================= MODAL ================= */}
      {selectedOrder && (
        <KitchenOrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrderId(null)}
          refresh={fetchOrders}
        />
      )}

    </section>
  );
};

export default KitchenPage;