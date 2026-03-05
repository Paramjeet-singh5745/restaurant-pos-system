import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { setRestaurantAuth, isRestaurantLoggedIn } from "../utils/auth";

const RestaurantLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  /* 🔒 AUTO REDIRECT IF ALREADY LOGGED IN */
  useEffect(() => {
    const restaurantId = localStorage.getItem("restaurant_id");

    if (isRestaurantLoggedIn() && restaurantId) {
      navigate(`/auth/${restaurantId}`, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  /* 🔑 LOGIN SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowErrorPopup(false);

    try {
      setLoading(true);

      const res = await api.post("/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password.trim(),
      });

      setRestaurantAuth(res.data.token, res.data.restaurant);

      // ✅ FIXED
      navigate(`/auth/${res.data.restaurant}`, { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setShowErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen bg-[#1f1f1f] flex items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg bg-[#2a2a2a] rounded-2xl shadow-xl p-6 sm:p-8">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={logo}
              alt="POS Logo"
              className="w-14 sm:w-16 mb-2"
            />
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Restaurant Login
            </h1>
            <p className="text-gray-400 text-sm text-center">
              Access your POS dashboard
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Restaurant Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

        

          {/* REGISTER LINK */}
          <p className="text-center text-gray-400 text-sm mt-5">
            New Restaurant?{" "}
            <Link
              to="/restaurant-register"
              className="text-orange-500 hover:underline"
            >
              Register here
            </Link>
          </p>
        </div>
      </section>

      {/* ERROR POPUP */}
      {showErrorPopup && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
          <div className="bg-[#2a2a2a] p-6 rounded-xl text-center w-full max-w-sm">
            <h2 className="text-red-400 text-lg sm:text-xl mb-2">
              ❌ Login Failed
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              {error}
            </p>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="bg-orange-500 hover:bg-orange-600 transition w-full py-2 rounded-lg text-white"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantLogin;