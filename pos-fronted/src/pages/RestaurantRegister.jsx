import React, { useState, useEffect } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { isRestaurantLoggedIn } from "../utils/auth";

const RestaurantRegister = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    restaurant_name: "",
    owner_name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
  });

  const [passwordRules, setPasswordRules] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  /* 🔒 REDIRECT IF ALREADY LOGGED IN */
  useEffect(() => {
    if (isRestaurantLoggedIn()) {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({ ...formData, [name]: value.trimStart() });

    if (name === "password") {
      setPasswordRules({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?&#]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !passwordRules.length ||
      !passwordRules.uppercase ||
      !passwordRules.number ||
      !passwordRules.special
    ) {
      setError(
        "Password must be at least 8 characters and include uppercase, number, and special character."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/register", formData);

      if (res.status === 201 || res.status === 200) {
        setShowSuccess(true);
        setFormData({
          restaurant_name: "",
          owner_name: "",
          email: "",
          phone: "",
          password: "",
          address: "",
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRedirect = () => {
    setShowSuccess(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* MAIN CONTAINER */}
      <section className="min-h-screen bg-[#1f1f1f] flex items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg bg-[#2a2a2a] rounded-2xl shadow-xl p-6 sm:p-8">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <img src={logo} alt="POS Logo" className="w-14 sm:w-16 mb-2" />
            <h1 className="text-white text-xl sm:text-2xl font-semibold">
              Register Restaurant
            </h1>
            <p className="text-gray-400 text-sm text-center">
              Create your restaurant workspace
            </p>
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">
              {error}
            </p>
          )}

          {/* FORM */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="restaurant_name"
              placeholder="Restaurant Name"
              value={formData.restaurant_name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="text"
              name="owner_name"
              placeholder="Owner Name"
              value={formData.owner_name}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
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

            {/* PASSWORD RULES */}
            <div className="text-sm space-y-1">
              {[
                ["Minimum 8 characters", passwordRules.length],
                ["One uppercase letter", passwordRules.uppercase],
                ["One number", passwordRules.number],
                ["One special character", passwordRules.special],
              ].map(([label, ok]) => (
                <p
                  key={label}
                  className={`flex items-center gap-2 ${
                    ok ? "text-green-400" : "text-gray-400"
                  }`}
                >
                  {ok ? "✔" : "❌"} {label}
                </p>
              ))}
            </div>

            <input
              type="text"
              name="address"
              placeholder="Restaurant Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 rounded-lg bg-[#1f1f1f] text-white outline-none focus:ring-2 focus:ring-orange-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 transition text-white py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {loading ? "Registering..." : "Register Restaurant"}
            </button>
          </form>

          {/* LOGIN LINK */}
          <p className="text-center text-gray-400 text-sm mt-5">
            Already registered?{" "}
            <Link to="/" className="text-orange-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>

      {/* SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
          <div className="bg-[#2a2a2a] p-6 rounded-xl text-center w-full max-w-sm">
            <h2 className="text-green-400 text-lg sm:text-xl mb-2">
              ✔ Registration Successful
            </h2>
            <p className="text-gray-300 mb-4 text-sm sm:text-base">
              Your restaurant has been registered.
            </p>
            <button
              onClick={handleRedirect}
              className="bg-orange-500 hover:bg-orange-600 transition w-full py-2 rounded-lg text-white"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default RestaurantRegister;
