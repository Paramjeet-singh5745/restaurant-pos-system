// import React, { useEffect, useState, useMemo } from "react";
// import api from "../../utils/api";
// import BackButton from "../../components/shared/BackButton";
// import BottomNav from "../../components/shared/BottomNav";

// const Inventory = () => {
//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");

//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);
//   const [quantity, setQuantity] = useState("");
//   const [reorder, setReorder] = useState("");

//   /* ================= FETCH INVENTORY ================= */
//   const fetchInventory = async () => {
//     try {
//       setLoading(true);
//       const res = await api.get("/inventory");
//       setInventory(res.data || []);
//     } catch (err) {
//       console.error("Inventory fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchInventory();
//   }, []);

//   /* ================= SEARCH FILTER ================= */
//   const filteredInventory = useMemo(() => {
//     const term = search.toLowerCase();

//     return inventory.filter((item) =>
//       item?.item_name?.toLowerCase().includes(term) ||
//       item?.category_name?.toLowerCase().includes(term)
//     );
//   }, [inventory, search]);

//   /* ================= GROUP BY CATEGORY ================= */
//   const groupedData = useMemo(() => {
//     const groups = {};
//     filteredInventory.forEach((item) => {
//       const category = item.category_name || "Uncategorized";
//       if (!groups[category]) {
//         groups[category] = [];
//       }
//       groups[category].push(item);
//     });
//     return groups;
//   }, [filteredInventory]);

//   /* ================= MODAL HANDLING ================= */
//   const openModal = (item) => {
//     setSelectedItem(item);
//     setQuantity(item?.quantity_in_stock ?? "");
//     setReorder(item?.reorder_level ?? "");
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setSelectedItem(null);
//     setQuantity("");
//     setReorder("");
//   };

//   /* ================= SAVE INVENTORY ================= */
//   const saveInventory = async () => {
//     if (!quantity || !reorder) {
//       alert("Please fill all fields");
//       return;
//     }

//     try {
//       if (selectedItem?.has_inventory) {
//         await api.patch(`/inventory/${selectedItem.inventory_id}`, {
//           quantity_in_stock: Number(quantity),
//           reorder_level: Number(reorder),
//         });
//       } else {
//         await api.post("/inventory", {
//           item_id: selectedItem.item_id,
//           quantity_in_stock: Number(quantity),
//           reorder_level: Number(reorder),
//         });
//       }

//       closeModal();
//       fetchInventory();
//     } catch (err) {
//       console.error("Save inventory error:", err);
//     }
//   };

//   /* ================= STATUS COLOR ================= */
//   const getStatusColor = (item) => {
//     if (!item.has_inventory) return "text-slate-400";
//     if (item.quantity_in_stock <= item.reorder_level)
//       return "text-red-400 font-bold";
//     return "text-emerald-400";
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-200 px-4 sm:px-6 lg:px-8 pb-24">
//       <div className="max-w-7xl mx-auto pt-6">

//         {/* ================= HEADER ================= */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <div className="flex items-center gap-3">
//             <BackButton />
//             <h1 className="text-2xl sm:text-3xl font-bold text-white">
//               Inventory Management
//             </h1>
//           </div>

//           <input
//             type="text"
//             placeholder="Search category or item..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="w-full sm:w-72 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
//           />
//         </div>

//         {/* ================= CONTENT ================= */}
//         {loading && (
//           <div className="text-center py-10 text-slate-400">
//             Loading inventory...
//           </div>
//         )}

//         {!loading && Object.keys(groupedData).length === 0 && (
//           <div className="text-center py-10 text-slate-500">
//             No matching items found.
//           </div>
//         )}

//         {!loading &&
//           Object.keys(groupedData).map((category) => (
//             <div key={category} className="mb-10">
//               <h2 className="text-lg sm:text-xl font-semibold mb-4 border-b border-slate-800 pb-2">
//                 {category}
//               </h2>

//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//                 {groupedData[category].map((item) => (
//                   <div
//                     key={item.item_id}
//                     className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-600 transition"
//                   >
//                     <div className="flex justify-between items-center">
//                       <h3 className="font-semibold text-white text-sm sm:text-base">
//                         {item.item_name}
//                       </h3>

//                       <span className={`text-sm ${getStatusColor(item)}`}>
//                         {item.has_inventory
//                           ? item.quantity_in_stock
//                           : "Not Tracked"}
//                       </span>
//                     </div>

//                     <div className="mt-2 text-xs text-slate-400">
//                       Reorder Level:{" "}
//                       {item.has_inventory ? item.reorder_level : "-"}
//                     </div>

//                     <button
//                       onClick={() => openModal(item)}
//                       className="mt-4 w-full bg-blue-600 hover:bg-blue-500 transition py-2 rounded-lg text-sm"
//                     >
//                       {item.has_inventory ? "Update Stock" : "Add Stock"}
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           ))}
//       </div>

//       {/* ================= MODAL ================= */}
//       {modalOpen && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
//           <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md">
//             <h2 className="text-lg font-bold mb-4 text-white">
//               {selectedItem?.item_name}
//             </h2>

//             <input
//               type="number"
//               min="0"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               placeholder="Quantity"
//               className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
//             />

//             <input
//               type="number"
//               min="0"
//               value={reorder}
//               onChange={(e) => setReorder(e.target.value)}
//               placeholder="Reorder Level"
//               className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//             />

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={closeModal}
//                 className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={saveInventory}
//                 className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
//               >
//                 Save
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ================= BOTTOM NAV ================= */}
//       <BottomNav />
//     </div>
//   );
// };

// export default Inventory;
import React, { useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import BackButton from "../../components/shared/BackButton";
import BottomNav from "../../components/shared/BottomNav";

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [reorder, setReorder] = useState("");

  /* ================= FETCH INVENTORY ================= */
  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/inventory");

      // Ensure array always
      if (Array.isArray(res.data)) {
        setInventory(res.data);
      } else {
        setInventory([]);
      }
    } catch (err) {
      console.error("Inventory fetch error:", err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /* ================= SEARCH FILTER ================= */
  const filteredInventory = useMemo(() => {
    const term = search.toLowerCase();

    return inventory.filter((item) =>
      item?.item_name?.toLowerCase().includes(term) ||
      item?.category_name?.toLowerCase().includes(term)
    );
  }, [inventory, search]);

  /* ================= GROUP BY CATEGORY ================= */
  const groupedData = useMemo(() => {
    const groups = {};

    filteredInventory.forEach((item) => {
      const category = item?.category_name || "Uncategorized";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(item);
    });

    return groups;
  }, [filteredInventory]);

  /* ================= MODAL HANDLING ================= */
  const openModal = (item) => {
    setSelectedItem(item);
    setQuantity(item?.quantity_in_stock ?? "");
    setReorder(item?.reorder_level ?? "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setQuantity("");
    setReorder("");
  };

  /* ================= SAVE INVENTORY ================= */
  const saveInventory = async () => {
    if (quantity === "" || reorder === "") {
      alert("Please fill all fields");
      return;
    }

    try {
      if (selectedItem?.has_inventory) {
        await api.patch(`/inventory/${selectedItem.inventory_id}`, {
          quantity_in_stock: Number(quantity),
          reorder_level: Number(reorder),
        });
      } else {
        await api.post("/inventory", {
          item_id: selectedItem.item_id,
          quantity_in_stock: Number(quantity),
          reorder_level: Number(reorder),
        });
      }

      closeModal();
      fetchInventory();
    } catch (err) {
      console.error("Save inventory error:", err);
    }
  };

  /* ================= STATUS COLOR ================= */
  const getStatusColor = (item) => {
    if (!item.has_inventory) return "text-slate-400";
    if (item.quantity_in_stock <= item.reorder_level)
      return "text-red-400 font-bold";
    return "text-emerald-400";
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      
      {/* MAIN CONTENT */}
      <div className="flex-1 px-4 sm:px-6 lg:px-8 pb-24">
        <div className="max-w-7xl mx-auto pt-6">

          {/* ================= HEADER ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <BackButton />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Inventory Management
              </h1>
            </div>

            <input
              type="text"
              placeholder="Search category or item..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* ================= LOADING ================= */}
          {loading && (
            <div className="flex justify-center items-center h-64 text-slate-400">
              Loading inventory...
            </div>
          )}

          {/* ================= EMPTY STATE ================= */}
          {!loading && inventory.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500 text-center">
              <p className="text-lg">No inventory data available.</p>
              <p className="text-sm mt-2">
                Items will appear here once inventory is added.
              </p>
            </div>
          )}

          {/* ================= NO SEARCH RESULT ================= */}
          {!loading &&
            inventory.length > 0 &&
            Object.keys(groupedData).length === 0 && (
              <div className="flex justify-center items-center h-64 text-slate-500">
                No matching items found.
              </div>
            )}

          {/* ================= INVENTORY GRID ================= */}
          {!loading &&
            Object.keys(groupedData).map((category) => (
              <div key={category} className="mb-10">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 border-b border-slate-800 pb-2">
                  {category}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {groupedData[category].map((item) => (
                    <div
                      key={item.item_id}
                      className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-blue-600 transition"
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-white text-sm sm:text-base">
                          {item.item_name}
                        </h3>

                        <span className={`text-sm ${getStatusColor(item)}`}>
                          {item.has_inventory
                            ? item.quantity_in_stock
                            : "Not Tracked"}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-400">
                        Reorder Level:{" "}
                        {item.has_inventory ? item.reorder_level : "-"}
                      </div>

                      <button
                        onClick={() => openModal(item)}
                        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 transition py-2 rounded-lg text-sm"
                      >
                        {item.has_inventory ? "Update Stock" : "Add Stock"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-slate-900 p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4 text-white">
              {selectedItem?.item_name}
            </h2>

            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Quantity"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <input
              type="number"
              min="0"
              value={reorder}
              onChange={(e) => setReorder(e.target.value)}
              placeholder="Reorder Level"
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                onClick={saveInventory}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= BOTTOM NAV ================= */}
      <BottomNav />
    </div>
  );
};

export default Inventory;