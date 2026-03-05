import React from "react";

/* =========================================
   MINI CARD COMPONENT
   Props:
   - title
   - icon
   - number
   - footerText
   - type ( "success" | "warning" | "info" )
========================================= */

const MiniCard = ({
  title,
  icon,
  number,
  footerText,
  type = "info",
}) => {
  /* =========================================
     COLOR VARIANTS
  ========================================= */
  const colorVariants = {
    success: {
      bg: "bg-emerald-500",
      text: "text-emerald-400",
    },
    warning: {
      bg: "bg-amber-500",
      text: "text-amber-400",
    },
    info: {
      bg: "bg-blue-500",
      text: "text-blue-400",
    },
  };

  const selectedColor = colorVariants[type];

  return (
    <div className="bg-[#1f1f1f] border border-gray-700 rounded-2xl p-4 sm:p-5 md:p-6 w-full shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300">

      {/* ===========================
         TOP SECTION
      ============================ */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-gray-300 text-sm sm:text-base md:text-lg font-medium">
          {title}
        </h2>

        <div
          className={`flex items-center justify-center rounded-xl text-white ${selectedColor.bg}
          w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-lg sm:text-xl md:text-2xl`}
        >
          {icon}
        </div>
      </div>

      {/* ===========================
         NUMBER SECTION
      ============================ */}
      <div className="mt-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold tracking-wide break-words">
          {number}
        </h1>

        {footerText && (
          <span
            className={`text-xs sm:text-sm md:text-base font-medium ${selectedColor.text}`}
          >
            {footerText}
          </span>
        )}
      </div>
    </div>
  );
};

export default MiniCard;