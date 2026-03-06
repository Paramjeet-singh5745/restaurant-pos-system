import React, { useState } from "react";
import api from "../../utils/api";
import { getRestaurantId } from "../../utils/auth";

const Register = () => {
  const restaurantId = getRestaurantId();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "waiter",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });

  /* 🔐 Password rules */
  const passwordRules = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordValid =
    passwordRules.length &&
    passwordRules.uppercase &&
    passwordRules.number &&
    passwordRules.special;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone" && !/^\d{0,10}$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
  };

  const handleRole = (role) => {
    setFormData({ ...formData, role });
  };

  const submit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!restaurantId) {
      setPopup({
        show: true,
        type: "error",
        message: "Restaurant session expired. Please login again.",
      });
      return;
    }

    if (formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!isPasswordValid) {
      newErrors.password = "Password does not meet requirements";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;
    try {
      setLoading(true);

      await api.post(`/employees/register/${restaurantId}`, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
      });

      setPopup({
        show: true,
        type: "success",
        message: "Employee registered successfully 🎉",
      });
    } catch (err) {
      setPopup({
        show: true,
        type: "error",
        message: err.response?.data?.message || "Registration failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* MAIN CONTAINER */}
      <section className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md sm:max-w-lg bg-[#121212] p-6 sm:p-8 rounded-2xl shadow-xl">
          <h1 className="text-white text-xl sm:text-2xl font-bold text-center mb-6">
            Employee Registration
          </h1>

          <form onSubmit={submit}>
            <Input
              label="Employee Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <Input
              label="Employee Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label="Employee Phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />

            {errors.phone && (
              <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
            )}

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />

            {/* PASSWORD RULES */}
            <div className="mt-2 space-y-1 text-xs">
              <Rule ok={passwordRules.length} text="At least 8 characters" />
              <Rule ok={passwordRules.uppercase} text="One uppercase letter" />
              <Rule ok={passwordRules.number} text="One number" />
              <Rule ok={passwordRules.special} text="One special character" />
            </div>

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword}
              </p>
            )}

            {/* ROLE */}
            <div className="mt-5">
              <label className="block text-[#ababab] mb-3 text-sm font-medium">
                Choose Role
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["waiter", "cashier", "admin", "kitchen_chef"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleRole(role)}
                    className={`py-3 rounded-lg transition text-sm sm:text-base
                      ${
                        formData.role === role
                          ? "bg-indigo-600 text-white"
                          : "bg-[#1f1f1f] text-[#ababab]"
                      }`}
                  >
                    {role.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBMIT */}
            <button
              disabled={
                !isPasswordValid || formData.phone.length !== 10 || loading
              }
              className="w-full mt-6 py-3 rounded-lg bg-yellow-400 text-gray-900 font-bold text-lg disabled:opacity-50"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </form>
        </div>
      </section>

      {/* POPUP */}
      {popup.show && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center px-4">
          <div className="bg-[#1f1f1f] p-6 rounded-xl text-center w-full max-w-sm">
            <h2
              className={`text-lg mb-2 ${
                popup.type === "success" ? "text-green-400" : "text-red-400"
              }`}
            >
              {popup.type === "success" ? "✔ Success" : "❌ Error"}
            </h2>
            <p className="text-gray-300 mb-4 text-sm">{popup.message}</p>
            <button
              onClick={() => setPopup({ show: false })}
              className="bg-yellow-400 w-full py-2 rounded-lg font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* 🔹 REUSABLE COMPONENTS */

const Input = ({ label, ...props }) => (
  <div className="mt-4">
    <label className="block text-[#ababab] mb-2 text-sm font-medium">
      {label}
    </label>
    <div className="rounded-lg px-4 py-3 bg-[#1f1f1f] focus-within:ring-2 focus-within:ring-yellow-400">
      <input
        {...props}
        className="bg-transparent w-full text-white outline-none"
      />
    </div>
  </div>
);

const Rule = ({ ok, text }) => (
  <p
    className={`flex items-center gap-2 ${ok ? "text-green-400" : "text-red-400"}`}
  >
    {ok ? "✔" : "✖"} {text}
  </p>
);

export default Register;
