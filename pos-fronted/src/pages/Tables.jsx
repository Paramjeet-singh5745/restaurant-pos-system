
import React, { useEffect, useState, useCallback } from "react";
import api from "../utils/api";
import BackButton from "../components/shared/BackButton";
import BottomNav from "../components/shared/BottomNav";
import TableCard from "../components/table/TableCard";
import TableModal from "../components/table/TableModal";
import { Plus } from "lucide-react";

const Tables = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const role =
    localStorage.getItem("employee_role")?.toUpperCase() || "STAFF";

  // 🔹 Fetch Tables
  const fetchTables = useCallback(async () => {
    try {
      setLoading(true);
     const res = await api.get("/tables");
      setTables(res.data?.tables || []);
    } catch (err) {
      console.error("Error fetching tables:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const openAdminModal = (table = null) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  return (
    <section className="min-h-screen flex flex-col bg-[#020617] text-slate-200 font-sans">
      
      {/* ================= HEADER ================= */}
      <header className="w-full border-b border-slate-800 bg-[#020617]/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left */}
          <div className="flex items-center gap-4">
            <BackButton className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition" />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Tables
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                Status of Tables
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 justify-between sm:justify-end">
            
            {/* Total Counter */}
            <div className="bg-[#0f172a] border border-blue-500/20 px-4 py-2 rounded-full flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-400 uppercase tracking-wide">
                {tables.length} Tables
              </span>
            </div>

            {/* Admin Button */}
            {role === "ADMIN" && (
              <button
                onClick={() => openAdminModal()}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 sm:px-6 py-2 rounded-xl flex items-center gap-2 font-bold text-[10px] sm:text-xs uppercase tracking-widest transition active:scale-95 shadow-lg"
              >
                <Plus size={16} strokeWidth={3} />
                <span className="hidden sm:inline">Create Table</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="flex-1 w-full px-4 sm:px-8 py-6 pb-32 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-500 font-bold tracking-widest text-[10px] uppercase">
                Retrieving Floor Plan...
              </p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-24 text-slate-500">
              <p className="text-lg font-semibold">No Tables Found</p>
              <p className="text-xs mt-2 uppercase tracking-widest">
                Create a new table to get started
              </p>
            </div>
          ) : (
            <div className="
              grid 
              grid-cols-1 
              sm:grid-cols-2 
              md:grid-cols-3 
              lg:grid-cols-4 
              xl:grid-cols-5 
              gap-5
            ">
              {tables.map((table) => (
                <TableCard
                  key={table.table_id}
                  table={table}
                  role={role}
                  onAdminClick={openAdminModal}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modal */}
      {isModalOpen && (
        <TableModal
          table={selectedTable}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTables}
        />
      )}
    </section>
  );
};

export default Tables;