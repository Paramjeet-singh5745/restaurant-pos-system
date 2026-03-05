import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import BottomNav from "../../components/shared/BottomNav";
import BackButton from "../../components/shared/BackButton";
import {
  User,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  UserMinus,
  AlertCircle,
} from "lucide-react";
import {
  getEmployeeId,
  getEmployeeRole,
  getRestaurantId,
  clearAuth,
} from "../../utils/auth";

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ================= AUTH ================= */
  const logoutAndRedirect = () => {
    const restaurantId = getRestaurantId();
    clearAuth();
    window.location.href = restaurantId ? `/auth/${restaurantId}` : "/";
  };

  /* ================= FETCH USERS ================= */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users");
      const data = Array.isArray(res?.data?.data) ? res.data.data : [];
      setUsers(data);
    } catch (err) {
      console.error("Fetch users failed", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const activeCount = users.filter((u) => u.is_active).length;

  /* ================= UPDATE USER ================= */
  const handleSave = async () => {
    try {
      setSaving(true);
      const loggedInEmployeeId = getEmployeeId();
      const loggedInRole = getEmployeeRole();

      await api.patch(`/users/${editingUser.user_id}`, {
        full_name: editingUser.full_name,
        username: editingUser.username,
        role: editingUser.role,
        is_active: editingUser.is_active,
      });

      // If admin removes own admin role → logout
      if (
        String(editingUser.user_id) === String(loggedInEmployeeId) &&
        loggedInRole === "ADMIN" &&
        editingUser.role !== "ADMIN"
      ) {
        logoutAndRedirect();
        return;
      }

      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  /* ================= DELETE USER ================= */
  const handleDelete = async () => {
    const loggedInEmployeeId = getEmployeeId();
    const isSelf = String(deleteUser.user_id) === String(loggedInEmployeeId);
    const restaurantId = getRestaurantId();

    try {
      setSaving(true);
      await api.delete(`/users/${deleteUser.user_id}`, {
        data: { restaurantId },
      });

      if (isSelf) {
        logoutAndRedirect();
        return;
      }

      setDeleteUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete failed", err);
      if (isSelf) logoutAndRedirect();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 flex flex-col pb-24">
      
      {/* ================= HEADER ================= */}
      <header className="px-4 sm:px-6 lg:px-10 py-5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between gap-5 sm:items-center">
          
          {/* Left */}
          <div className="flex items-center gap-4">
            <BackButton />
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                Staff Management
              </h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">
                Employee Directory
              </p>
            </div>
          </div>

          {/* Right Counter */}
          <div className="flex items-center gap-3 bg-[#0f172a] px-4 py-2 rounded-full border border-blue-500/20 w-fit">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-blue-400 uppercase tracking-wider">
              {activeCount} Active Accounts
            </span>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Syncing Database...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0f1d] border border-dashed border-slate-800 rounded-3xl">
            <UserMinus size={48} className="mx-auto text-slate-800 mb-4" />
            <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">
              No Records Found
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {users.map((u) => (
              <div
                key={u.user_id}
                className="bg-[#0a0f1d] border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row justify-between gap-5 hover:bg-[#0f172a] transition-all"
              >
                {/* USER INFO */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1e293b] rounded-2xl flex items-center justify-center text-blue-400">
                    <User size={26} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white text-base sm:text-lg">
                        {u.full_name}
                      </p>
                      {u.is_active ? (
                        <CheckCircle size={16} className="text-emerald-500" />
                      ) : (
                        <XCircle size={16} className="text-rose-500" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-1">
                      <span
                        className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase ${
                          u.role === "ADMIN"
                            ? "bg-amber-500 text-black"
                            : "bg-[#1e293b] text-slate-400 border border-slate-700"
                        }`}
                      >
                        {u.role}
                      </span>
                      <span className="text-slate-500 text-xs italic">
                        {u.username}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 self-end sm:self-center">
                  <button
                    onClick={() => setEditingUser(u)}
                    className="p-3 bg-[#1e293b] hover:bg-blue-600 hover:text-white rounded-2xl transition-all"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => setDeleteUser(u)}
                    className="p-3 bg-[#1e293b] hover:bg-rose-600 hover:text-white rounded-2xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ================= MODALS ================= */}
      {(editingUser || deleteUser) && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" />
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0a0f1d] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6">
              Modify Staff
            </h2>

            <div className="space-y-4">
              <input
                value={editingUser.full_name}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, full_name: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-white"
              />

              <input
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, username: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-white"
              />

              <select
                value={editingUser.role}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, role: e.target.value })
                }
                className="w-full px-4 py-3 bg-[#020617] border border-slate-800 rounded-xl text-white"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="CASHIER">CASHIER</option>
                <option value="WAITER">WAITER</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <button
                onClick={() => setEditingUser(null)}
                className="py-3 bg-[#1e293b] rounded-xl text-slate-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="py-3 bg-blue-600 rounded-xl text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] w-full max-w-sm rounded-3xl p-8 border border-slate-800 text-center">
            <AlertCircle size={40} className="mx-auto text-rose-500 mb-4" />
            <h2 className="text-lg font-bold text-white mb-2">
              Delete User?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Remove {deleteUser.full_name} permanently?
            </p>

            <div className="space-y-3">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="w-full py-3 bg-rose-600 rounded-xl text-white disabled:opacity-50"
              >
                {saving ? "Processing..." : "Confirm"}
              </button>
              <button
                onClick={() => setDeleteUser(null)}
                className="w-full py-3 text-slate-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default UserDetails;