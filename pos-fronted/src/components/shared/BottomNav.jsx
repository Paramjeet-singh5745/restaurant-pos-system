import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { MdOutlineReorder, MdTableBar } from "react-icons/md";
import { CiCircleMore } from "react-icons/ci";
import { BiSolidDish } from "react-icons/bi";
import Model from "./Model";
import CustomerForm from "./CustomerForm";

const BottomNav = ({ setCustomer }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [role, setRole] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  // Load role & id once
  useEffect(() => {
    setRole(localStorage.getItem("employee_role")?.toUpperCase() || "");
    setEmployeeId(localStorage.getItem("employee_id") || "");
  }, []);

  // Navigation configuration
  const navItems = useMemo(() => ({
    ADMIN: [
      { name: "Home", icon: <FaHome />, path: `/home/${employeeId}` },
      { name: "Orders", icon: <MdOutlineReorder />, path: "/orders" },
      { name: "Kitchen", icon: <BiSolidDish />, path: "/kitchen" },
      { name: "Tables", icon: <MdTableBar />, path: "/tables" },
      { name: "Payments", icon: <CiCircleMore />, path: "/payments" },
      { name: "More", icon: <CiCircleMore />, path: "/more" },
    ],
    CASHIER: [
      { name: "Orders", icon: <MdOutlineReorder />, path: "/orders" },
      { name: "Payments", icon: <CiCircleMore />, path: "/payments" },
    ],
    WAITER: [
      { name: "Tables", icon: <MdTableBar />, path: "/tables" },
      { name: "Orders", icon: <MdOutlineReorder />, path: "/orders" },
    ],
    KITCHEN_CHEF: [
      { name: "Orders", icon: <MdOutlineReorder />, path: "/orders" },
      { name: "Kitchen", icon: <BiSolidDish />, path: "/kitchen" },
    ],
  }), [employeeId]);

  const currentNav = navItems[role] || [];

  const handleCustomerSave = (savedCustomer) => {
    setCustomer(savedCustomer);
    setIsModalOpen(false);
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <>
      {/* Bottom Navigation */}
<div className="sticky bottom-0  h-20 bg-[#1f1f1f] border-t border-[#333] flex justify-around items-center z-50">

        {currentNav.map((item, index) => (
          <button
            key={index}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center
                        gap-1 md:gap-2
                        px-3 py-2 rounded-xl
                        transition-all duration-200
                        w-full max-w-[120px] md:max-w-[160px]
                        ${
                          isActive(item.path)
                            ? "bg-[#F6B100] text-black"
                            : "bg-[#2b2b2b] text-white hover:bg-[#3b3b3b]"
                        }`}
          >
            <span className="text-lg md:text-xl">
              {item.icon}
            </span>
            <span className="text-xs md:text-sm font-medium">
              {item.name}
            </span>
          </button>
        ))}

        {/* Floating Action Button (WAITER only on /menu) */}
        {role === "WAITER" && location.pathname.startsWith("/menu/") && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute -top-7 left-1/2 -translate-x-1/2
                       bg-[#F6B100] p-4 md:p-5
                       rounded-full shadow-2xl
                       hover:bg-yellow-500
                       transition-all duration-200"
          >
<BiSolidDish className="text-black text-xl sm:text-2xl md:text-3xl lg:text-4xl" />
          </button>
        )}
      </div>

      {/* Customer Modal */}
      <Model
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Customer Details"
      >
        <CustomerForm onSave={handleCustomerSave} />
      </Model>
    </>
  );
};

export default BottomNav;