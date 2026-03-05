import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { X, Search } from "lucide-react";
import { getEmployeeAuth } from "../../utils/auth";
import BackButton from "../shared/BackButton";

const PaymentComponent = () => {
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterMethod, setFilterMethod] = useState("ALL");

useEffect(() => {
  fetchPayments();

  const interval = setInterval(() => {
    fetchPayments();
  }, 5000); // refresh every 5 seconds

  return () => clearInterval(interval);
}, []);

  /* ================= FETCH ALL PAYMENTS ================= */
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = getEmployeeAuth();
      if (!token) return;

      const res = await axios.get(
        "http://localhost:5000/api/payments-all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPayments(res.data.data || []);
    } catch (err) {
      console.log("Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH DETAILS ================= */
  const fetchDetails = async (orderId) => {
    try {
      const token = getEmployeeAuth();
      if (!token) return;

      const res = await axios.get(
        `http://localhost:5000/api/payments/${orderId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSelectedPayment(res.data.data || null);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  const closeModal = () => setSelectedPayment(null);

  /* ================= FILTER LOGIC ================= */
  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const matchesSearch =
        pay.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(pay.order_id).includes(search) ||
        String(pay.table_number || "").includes(search);

      const matchesMethod =
        filterMethod === "ALL" || pay.payment_method === filterMethod;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, filterMethod]);

  return (
    <div className="flex-1 overflow-auto p-6 text-white">

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h1 className="text-2xl font-bold">Payment History</h1>
      </div>

      {/* ================= SEARCH + FILTER ================= */}
      <div className="mb-6 space-y-4">

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#2a2a2a] pl-10 pr-4 py-2 rounded-lg focus:outline-none"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-3">
          {["ALL", "CASH", "ONLINE"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterMethod(type)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filterMethod === type
                  ? "bg-green-600 text-white"
                  : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333]"
              }`}
            >
              {type === "ONLINE" ? "ONLINE" : type}
            </button>
          ))}
        </div>
      </div>

      {/* ================= PAYMENT LIST ================= */}
      <div className="space-y-4">
        {loading ? (
          <p>Loading payments...</p>
        ) : filteredPayments.length === 0 ? (
          <p>No payments found.</p>
        ) : (
          filteredPayments.map((pay) => (
            <div
              key={pay.payment_id}
              onClick={() => fetchDetails(pay.order_id)}
              className="bg-[#2a2a2a] p-4 rounded-xl shadow-md hover:bg-[#333] cursor-pointer transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-lg">
                    Order #{pay.order_id}
                  </p>
                  <p className="text-sm text-gray-400">
                    Table {pay.table_number || "-"} • {pay.customer_name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Cashier: {pay.cashier || "-"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-green-400">
                    ₹{Number(pay.grand_total || 0).toFixed(2)}
                  </p>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pay.payment_method === "CASH"
                        ? "bg-yellow-600"
                        : "bg-blue-600"
                    }`}
                  >
                    {pay.payment_method}
                  </span>

                  <p
                    className={`text-xs mt-1 ${
                      pay.payment_status === "PAID"
                        ? "text-green-400"
                        : pay.payment_status === "FAILED"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}
                  >
                    {pay.payment_status}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ================= MODAL ================= */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-[#1f1f1f] w-[420px] rounded-2xl p-6 shadow-2xl relative">

            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-6 text-center">
              Payment Details
            </h2>

            <div className="space-y-3 text-sm">

              <div className="flex justify-between">
                <span>Payment ID</span>
                <span>{selectedPayment.payment_id}</span>
              </div>

              <div className="flex justify-between font-bold text-green-400">
                <span>Grand Total</span>
                <span>
                  ₹{Number(selectedPayment.grand_total || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Method</span>
                <span>{selectedPayment.payment_method}</span>
              </div>

              <div className="flex justify-between">
                <span>Status</span>
                <span>{selectedPayment.payment_status}</span>
              </div>

              <div className="flex justify-between">
                <span>Date</span>
                <span>
                  {new Date(selectedPayment.payment_date).toLocaleString()}
                </span>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentComponent;