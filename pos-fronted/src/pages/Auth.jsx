import React, { useState, useEffect } from "react";
import restaurant from "../assets/restaurant-img.jpg";
import logo from "../assets/logo.png";
import Login from "../components/auth/Login";
import Register from "../components/auth/Register";
import { useNavigate } from "react-router-dom";
import { clearAuth } from "../utils/auth";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleRestaurantLogout = () => {
  clearAuth();

  // Clear everything
  localStorage.clear();
  sessionStorage.clear();

  window.location.replace("/");
};


  return (
    <>
      {/* 🔝 MOBILE HEADER (VISIBLE ONLY ON SMALL SCREENS) */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-[#0f0f0f] border-b border-[#1f1f1f]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} className="h-8 w-8 rounded-full" alt="logo" />
            <span className="text-white font-semibold text-sm">
              Restro POS
            </span>
          </div>

          <button
            onClick={handleRestaurantLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex min-h-screen pt-14 md:pt-0">

        {/* LEFT IMAGE SECTION (DESKTOP ONLY) */}
        <div className="w-1/2 relative hidden md:block">
          <img
            src={restaurant}
            className="w-full h-full object-cover"
            alt="Restaurant"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-80" />

          {/* DESKTOP LOGOUT BUTTON */}
          <button
            onClick={handleRestaurantLogout}
            className="absolute top-6 left-6 z-10 bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            Restaurant Logout
          </button>
        </div>

        {/* RIGHT AUTH SECTION */}
        <div className="w-full md:w-1/2 bg-[#1a1a1a] p-6 sm:p-8 flex flex-col justify-center">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <img
              src={logo}
              className="h-14 w-14 rounded-full border p-1"
              alt="Logo"
            />
            <h1 className="text-white mt-2 text-xl font-semibold">
              Restro POS
            </h1>
          </div>

          {/* TITLE */}
          <h2 className="text-2xl sm:text-3xl text-center text-yellow-400 mb-6">
            {isLogin ? "Employee Login" : "Employee Register"}
          </h2>

          {/* FORM */}
          <div>
            {isLogin ? <Login /> : <Register />}
          </div>

          {/* SWITCH */}
          <p className="text-center text-gray-400 mt-6 text-sm sm:text-base">
            {isLogin ? "New employee?" : "Already registered?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-yellow-400 ml-2 font-semibold hover:underline"
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
