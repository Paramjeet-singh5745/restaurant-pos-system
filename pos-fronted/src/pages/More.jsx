import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import { FaUsers, FaBoxOpen } from "react-icons/fa";
import { MdRestaurantMenu } from "react-icons/md";

const More = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("employee_role");
    if (role !== "ADMIN") {
      navigate("/home", { replace: true });
    }
  }, [navigate]);

  const options = [
    {
      title: "User Details",
      desc: "Manage staff accounts, roles & status",
      icon: <FaUsers size={26} />,
      path: "/more/users",
      bg: "from-indigo-500 to-indigo-700",
    },
    {
      title: "Menu Customize",
      desc: "Add, update or remove menu items & categories",
      icon: <MdRestaurantMenu size={28} />,
      path: "/more/menu",
      bg: "from-purple-500 to-purple-700",
    },
    {
      title: "Inventory Management",
      desc: "Track stock, update quantity & alerts",
      icon: <FaBoxOpen size={26} />,
      path: "/more/inventory",
      bg: "from-emerald-500 to-emerald-700",
    },
  ];

  return (
    <section className="bg-[#1f1f1f] min-h-screen flex flex-col">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 px-4 sm:px-6 md:px-8 py-4 sm:py-6 border-b border-[#2a2a2a]">
        <BackButton />
        <h1 className="text-[#f5f5f5] text-xl sm:text-2xl font-bold tracking-wide">
          More Options
        </h1>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        <div
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            lg:grid-cols-3 
            gap-4 sm:gap-6
          "
        >
          {options.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              className="
                cursor-pointer 
                bg-[#262626] 
                rounded-2xl 
                p-5 sm:p-6
                hover:bg-[#2e2e2e] 
                transition-all duration-300
                border border-[#2a2a2a] 
                group
                active:scale-95
              "
            >
              {/* Icon */}
              <div
                className={`
                  w-12 h-12 sm:w-14 sm:h-14
                  flex items-center justify-center 
                  rounded-xl 
                  bg-gradient-to-br ${item.bg} 
                  mb-4 sm:mb-6
                `}
              >
                <span className="text-white">{item.icon}</span>
              </div>

              {/* Title */}
              <h2 className="text-[#f5f5f5] text-base sm:text-lg font-semibold mb-2">
                {item.title}
              </h2>

              {/* Description */}
              <p className="text-[#ababab] text-sm leading-relaxed">
                {item.desc}
              </p>

              {/* Hover Text */}
              <div
                className="
                  mt-4 sm:mt-6 
                  text-[#F6B100] 
                  text-sm 
                  font-semibold 
                  opacity-0 
                  group-hover:opacity-100 
                  transition-opacity
                "
              >
                Open →
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <BottomNav />
    </section>
  );
};

export default More;