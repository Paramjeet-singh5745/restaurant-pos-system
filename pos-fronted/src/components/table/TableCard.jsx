
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getRandomBg } from "../../utils";
import { Edit3, Users, X } from "lucide-react";

const TableCard = ({ table, role, onAdminClick }) => {
  const navigate = useNavigate();
  const [showOccupiedModal, setShowOccupiedModal] = useState(false);

  const bgColor = useMemo(() => getRandomBg(), []);

  const isAvailable = table.table_status === "AVAILABLE";
const isActive = Number(table.is_active) === 1;

  const handleClick = () => {
    // ✅ ADMIN can always open modal (even if inactive)
    if (role === "ADMIN") {
      onAdminClick(table);
      return;
    }

    // ❌ STAFF cannot use inactive table
    if (!isActive) {
      return;
    }

    if (isAvailable) {
      navigate(`/menu/${table.table_id}`, {
        state: { tableId: table.table_id },
      });
    } else {
      setShowOccupiedModal(true);
    }
  };

  return (
    <>
      {/* ================= CARD ================= */}
      <div
        onClick={handleClick}
        className="group bg-[#0a0f1d] border border-slate-800/50 
        rounded-3xl p-5 sm:p-6 flex flex-col justify-between 
        transition-all duration-300 hover:bg-[#0f172a] 
        hover:border-blue-500/30 shadow-xl shadow-black/20 
        cursor-pointer active:scale-[0.98]"
      >
        {/* ================= HEADER ================= */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-white text-base sm:text-lg font-extrabold">
              Table {table.table_number}
            </h2>

            <div className="flex items-center gap-1.5 mt-1">
              <Users size={14} className="text-slate-500" />
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                {table.seating_capacity} Seats
              </span>
            </div>
          </div>

          {/* RIGHT SIDE BADGES */}
          <div className="flex flex-col gap-2 items-end">

            {/* Table Status */}
            <span
              className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                isAvailable
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
              }`}
            >
              {table.table_status}
            </span>

            {/* Active Status */}
           {/* Active Status Badge */}
<span
  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
    isActive
      ? "bg-green-500/10 text-green-500 border border-green-500/20"
      : "bg-red-500/10 text-red-500 border border-red-500/20"
  }`}
>
  {isActive ? "Active" : "Deactive"}
</span>
          </div>
        </div>

        {/* ================= CENTER ICON ================= */}
        <div className="flex justify-center items-center py-6 relative">
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full 
            flex items-center justify-center text-white 
            text-xl sm:text-2xl font-black shadow-inner 
            group-hover:scale-110 transition-transform duration-300"
            style={{ backgroundColor: bgColor }}
          >
            T
          </div>

          {role === "ADMIN" && (
            <div className="absolute right-0 bottom-0 p-2 
            bg-[#1e293b] rounded-xl border border-slate-700 
            text-slate-400 opacity-0 group-hover:opacity-100 
            transition-opacity">
              <Edit3 size={16} />
            </div>
          )}
        </div>

        {/* ================= FOOTER TEXT ================= */}
        <div className="text-center mt-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-blue-400 transition-colors">
            {role === "ADMIN"
              ? "Click to Manage"
              : !isActive
              ? "Table Inactive"
              : isAvailable
              ? "Click to View Menu"
              : "Currently Occupied"}
          </p>
        </div>
      </div>

      {/* ================= OCCUPIED MODAL ================= */}
      {showOccupiedModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm 
        flex items-center justify-center z-50 px-4">
          <div className="bg-[#0f172a] border border-slate-800 
          rounded-2xl p-6 w-full max-w-sm shadow-2xl">

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">
                Table Occupied
              </h2>
              <button
                onClick={() => setShowOccupiedModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-slate-400 text-sm mb-6">
              Table <strong>{table.table_number}</strong> is currently occupied.
              Please select another available table.
            </p>

            <button
              onClick={() => setShowOccupiedModal(false)}
              className="w-full py-2 bg-rose-500 hover:bg-rose-600 
              text-white rounded-xl font-semibold 
              transition-all active:scale-95"
            >
              Okay
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TableCard;