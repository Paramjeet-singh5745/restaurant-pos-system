import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import BottomNav from "../components/shared/BottomNav";
import Greeting from "../components/home/Greeting";
import { getEmployeeAuth, getEmployeeId } from "../utils/auth";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import { BsCashCoin } from "react-icons/bs";
import { GrInProgress } from "react-icons/gr";
import { FaBoxOpen, FaLayerGroup } from "react-icons/fa";

/* ===============================
   STAT CARD COMPONENT
=================================*/
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-[#242424] p-5 rounded-2xl shadow-md border border-gray-700 hover:scale-[1.02] transition-all duration-300">
    <div className="flex justify-between items-center">
      <h3 className="text-xs sm:text-sm text-gray-400">{title}</h3>
      <div className="text-lg text-gray-300">{icon}</div>
    </div>
    <h2 className="text-xl sm:text-2xl font-bold mt-3">{value}</h2>
    <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
  </div>
);

/* ===============================
   MAIN HOME COMPONENT
=================================*/
const Home = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = getEmployeeAuth();
  const userId = getEmployeeId();

  /* ===============================
     FETCH DASHBOARD
  =================================*/
  const fetchDashboard = useCallback(async () => {
    try {
       const res = await api.get(`/home/${userId}`);
      setDashboard(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard error:", err);
      setError("Failed to load dashboard");
      setLoading(false);
    }
  }, [token, userId]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading)
    return (
      <div className="text-white p-10 text-center">
        Loading Dashboard...
      </div>
    );

  if (error)
    return (
      <div className="text-red-500 p-10 text-center">
        {error}
      </div>
    );

  /* ===============================
     PIE COLOR LOGIC
  =================================*/
  const getStatusColor = (name) => {
    switch (name) {
      case "PENDING":
        return "#facc15";
      case "PREPARING":
        return "#8b5cf6";
      case "COMPLETED":
      case "READY":
        return "#22c55e";
      case "CANCELLED":
        return "#ef4444";
      default:
        return "#3b82f6";
    }
  };

  return (
    <section className="bg-[#1f1f1f] min-h-screen pb-28 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">

        <Greeting />

        {/* ===============================
           STATS ROW 1
        ================================*/}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatCard
            title="Earnings Today"
            value={`₹ ${dashboard?.earningsToday}`}
            subtitle="Today's Revenue"
            icon={<BsCashCoin />}
          />
          <StatCard
            title="Total Earnings"
            value={`₹ ${dashboard?.earningsAll}`}
            subtitle="Overall Revenue"
            icon={<BsCashCoin />}
          />
          <StatCard
            title="Orders In Progress"
            value={dashboard?.inProgress}
            subtitle="Active Orders"
            icon={<GrInProgress />}
          />
          <StatCard
            title="Orders Today"
            value={dashboard?.ordersToday}
            subtitle="Today's Orders"
            icon={<FaBoxOpen />}
          />
        </div>

        {/* ===============================
           STATS ROW 2
        ================================*/}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
          <StatCard
            title="Total Orders"
            value={dashboard?.ordersAll}
            subtitle="All Time Orders"
            icon={<FaBoxOpen />}
          />
          <StatCard
            title="Total Categories"
            value={dashboard?.totalCategories}
            subtitle="Menu Categories"
            icon={<FaLayerGroup />}
          />
          <StatCard
            title="Total Menu Items"
            value={dashboard?.totalItems}
            subtitle="Available Items"
            icon={<FaLayerGroup />}
          />
        </div>

        {/* ===============================
           LAST 7 DAYS REVENUE
        ================================*/}
        <div className="bg-[#242424] p-5 rounded-2xl mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Last 7 Days Revenue
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard?.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===============================
           PIE + LINE
        ================================*/}
        <div className="grid md:grid-cols-2 gap-6 mt-8">

          {/* ORDER STATUS PIE */}
          <div className="bg-[#242424] p-5 rounded-2xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Order Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={dashboard?.orderStatus}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label
                >
                  {dashboard?.orderStatus?.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={getStatusColor(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* ORDERS BY HOUR LINE */}
          <div className="bg-[#242424] p-5 rounded-2xl">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Today's Orders By Hour
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dashboard?.ordersByHour}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===============================
           TOP 5 SELLING ITEMS
        ================================*/}
        <div className="bg-[#242424] p-5 rounded-2xl mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Top 5 Selling Items
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={dashboard?.topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="name" type="category" stroke="#aaa" />
              <Tooltip />
              <Bar dataKey="total" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ===============================
           POPULAR DISHES
        ================================*/}
        <div className="bg-[#242424] p-5 rounded-2xl mt-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            Popular Dishes
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            {dashboard?.popularDishes?.map((dish, index) => (
              <div
                key={index}
                className="bg-[#2d2d2d] p-4 rounded-lg flex justify-between items-center hover:bg-[#333] transition"
              >
                <div>
                  <p className="font-medium">{dish.name}</p>
                  <p className="text-sm text-gray-400">
                    {dish.total} sold
                  </p>
                </div>
                <span className="text-blue-400 font-bold text-lg">
                  #{index + 1}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <BottomNav />
    </section>
  );
};

export default Home;