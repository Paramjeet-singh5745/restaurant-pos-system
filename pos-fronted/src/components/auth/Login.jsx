import React, { useState } from "react";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import { getRestaurantId, setEmployeeAuth } from "../../utils/auth";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.trimStart(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setShowError(false);

    const restaurantId = getRestaurantId();

    if (!restaurantId) {
      setError("Restaurant session expired. Please login again.");
      setShowError(true);
      return;
    }

    try {
      setLoading(true);

      const res = await api.post(
  `/employees/login/${restaurantId}`,
  formData
);

      setEmployeeAuth(
        res.data.token,
        res.data.user.user_id,
        res.data.user.full_name,
        res.data.user.role
      );
      if(res.data.user.role=='ADMIN'){
        navigate(`/home/${res.data.user.user_id}`, { replace: true });        
        
      }
      else if(res.data.user.role=='WAITER'){
        navigate("/tables", { replace: true });
      }
      else if(res.data.user.role=='CASHIER'){
        navigate("/payments", { replace: true });

      }
      else if(res.data.user.role === 'KITCHEN_CHEF') {
      navigate("/kitchen", { replace: true });
      
    }
      

    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN CONTAINER */}
      <section className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-[#121212] p-6 sm:p-8 rounded-2xl shadow-xl">

          {/* HEADER */}
          <div className="text-center mb-6">
            <h1 className="text-white text-xl sm:text-2xl font-bold">
              Employee Login
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to access dashboard
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Employee Email
              </label>
              <div className="flex items-center rounded-lg px-4 py-3 bg-[#1f1f1f] focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="email"
                  name="email"
                  placeholder="Enter employee email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent w-full text-white outline-none"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm font-medium">
                Password
              </label>
              <div className="flex items-center rounded-lg px-4 py-3 bg-[#1f1f1f] focus-within:ring-2 focus-within:ring-yellow-400">
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-transparent w-full text-white outline-none"
                  required
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-yellow-400 text-gray-900 font-bold text-lg hover:bg-yellow-500 transition disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </section>

      {/* ERROR POPUP */}
      {showError && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
          <div className="bg-[#1f1f1f] p-6 rounded-xl text-center w-full max-w-sm">
            <h2 className="text-red-400 text-lg mb-2">
              ❌ Login Failed
            </h2>
            <p className="text-gray-300 mb-4 text-sm">
              {error}
            </p>
            <button
              onClick={() => setShowError(false)}
              className="bg-yellow-400 hover:bg-yellow-500 transition w-full py-2 rounded-lg text-gray-900 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};



export default Login;
