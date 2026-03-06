
import React, { useState } from "react";
import api from "../../utils/api"; 
import Model from "../shared/Model";
import { AlertCircle, Save, Power } from "lucide-react";

const TableModal = ({ table, onClose, onSuccess }) => {
  const isEdit = Boolean(table);

  const [tableNumber, setTableNumber] = useState(table?.table_number || "");
  const [capacity, setCapacity] = useState(table?.seating_capacity || "");
  const [status, setStatus] = useState(table?.table_status || "AVAILABLE");
  const [isActive, setIsActive] = useState(table?.is_active ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!capacity) return "Seating capacity is required";
    if (!isEdit && !tableNumber) return "Table number is required";
    if (capacity <= 0) return "Capacity must be greater than 0";
    return "";
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEdit) {
       await api.patch(`/tables/${table.table_id}`,  {
          table_number: Number(tableNumber),
          seating_capacity: Number(capacity),
          table_status: status,
          is_active: isActive,
        });
      } else {
           await api.post(`/tables`, {
          table_number: Number(tableNumber),
          seating_capacity: Number(capacity),
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <Model
      isOpen={true}
      onClose={onClose}
      title={isEdit ? "Manage Table" : "Register Table"}
    >
      <div className="w-full max-w-md mx-auto space-y-6 p-6 bg-[#0a0f1d] rounded-2xl">

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl text-sm">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Table Number */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">
            Table Number
          </label>
          <input
            type="number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-4 py-3 bg-[#020617] border border-slate-700 rounded-xl text-white"
          />
        </div>

        {/* Seating Capacity */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-400">
            Seating Capacity
          </label>
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full px-4 py-3 bg-[#020617] border border-slate-700 rounded-xl text-white"
          />
        </div>

        {/* Edit Mode Options */}
        {isEdit && (
          <>
            {/* Table Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">
                Table Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-[#020617] border border-slate-700 rounded-xl text-white"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="OCCUPIED">OCCUPIED</option>
              </select>
            </div>

            {/* Active / Deactive Section */}
            <div className="bg-[#020617] border border-slate-700 rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-300 font-medium">
                  Current Status
                </span>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              </div>

              <button
                type="button"
                onClick={handleToggleActive}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl font-semibold transition ${
                  isActive
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
              >
                <Power size={16} />
                {isActive ? "Deactivate Table" : "Activate Table"}
              </button>
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
        >
          <Save size={16} />
          {loading ? "Processing..." : "Save Changes"}
        </button>
      </div>
    </Model>
  );
};

export default TableModal;