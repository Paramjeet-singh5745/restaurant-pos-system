import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { GrRadialSelected } from "react-icons/gr";
import { FaShoppingCart } from "react-icons/fa";
import { getRandomBg } from "../../utils";
import { useCart } from "../../components/context/CartContext";

const MenuContainer = () => {
  const [menus, setMenus] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [stockModal, setStockModal] = useState({
    open: false,
    item: null,
  });

  const { addItem, removeItem, cart } = useCart();
  const token = localStorage.getItem("employee_token");

  // ================= FETCH MENU =================
  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      setLoading(true);

   const res = await api.get("/api/menu/full");

      const formattedMenus = res.data.data.map((category) => ({
        ...category,
        bg_color: category.bg_color || getRandomBg(),
        items: category.items.map((item) => ({
          ...item,
          quantity_in_stock: item.quantity_in_stock ?? 0,
          reorder_level: item.reorder_level ?? 5,
        })),
      }));

      setMenus(formattedMenus);
      setSelectedMenu(formattedMenus[0] || null);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch menu"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= CART HELPERS =================
  const getItemQty = (id) => {
    const existing = cart.find((i) => i.item_id === id);
    return existing ? existing.quantity : 0;
  };

  const handleAddItem = (item) => {
    if (item.quantity_in_stock <= item.reorder_level) {
      setStockModal({ open: true, item });
      return;
    }
    addItem(item);
  };

  const handleRemoveItem = (id) => {
    removeItem(id);
  };

  // ================= LOADING / ERROR =================
  if (loading)
    return (
      <div className="text-white text-center mt-10">
        Loading Menu...
      </div>
    );

  if (error)
    return (
      <div className="text-red-400 text-center mt-10">
        {error}
      </div>
    );

  return (
<div className="w-full bg-[#121212]">
      {/* ================= CATEGORY GRID ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4 sm:px-8 py-6">
        {menus.map((menu) => (
          <div
            key={menu.category_id}
            onClick={() => setSelectedMenu(menu)}
            style={{ backgroundColor: menu.bg_color }}
            className={`flex flex-col justify-between p-4 rounded-xl h-[100px] cursor-pointer transition-transform hover:scale-105 ${
              selectedMenu?.category_id === menu.category_id
                ? "ring-2 ring-yellow-400"
                : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <h2 className="text-white font-semibold text-sm sm:text-base">
                {menu.category_name}
              </h2>
              {selectedMenu?.category_id === menu.category_id && (
                <GrRadialSelected
                  className="text-white"
                  size={18}
                />
              )}
            </div>
            <p className="text-gray-200 text-xs sm:text-sm">
              {menu.items.length} Items
            </p>
          </div>
        ))}
      </div>

      <hr className="border-[#2a2a2a] border-t-2 mx-4 sm:mx-8" />

      {/* ================= ITEMS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-8 py-6">
        {selectedMenu?.items.map((item) => {
          const lowStock =
            item.quantity_in_stock <= item.reorder_level;

          return (
            <div
              key={item.item_id}
              className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col justify-between shadow-lg hover:shadow-xl transition"
            >
              {/* ITEM INFO */}
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold text-sm sm:text-base">
                    {item.item_name}
                  </h3>

                  <button
                    disabled={lowStock}
                    onClick={() => handleAddItem(item)}
                    className={`p-2 rounded-lg transition ${
                      lowStock
                        ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-500 text-white"
                    }`}
                  >
                    <FaShoppingCart size={14} />
                  </button>
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <span className="text-yellow-400 font-bold">
                    ₹{item.price}
                  </span>

                  <span
                    className={`${
                      lowStock
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  >
                    Stock: {item.quantity_in_stock}
                  </span>
                </div>
              </div>

              {/* QUANTITY CONTROLS */}
              <div className="flex justify-between items-center mt-4 bg-[#222] px-4 py-2 rounded-lg">
                <button
                  onClick={() =>
                    handleRemoveItem(item.item_id)
                  }
                  className="text-yellow-500 text-xl font-bold"
                >
                  −
                </button>

                <span className="text-white font-semibold">
                  {getItemQty(item.item_id)}
                </span>

                <button
                  onClick={() => handleAddItem(item)}
                  className="text-yellow-500 text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= STOCK MODAL ================= */}
      {stockModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-sm text-center border border-gray-700 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3">
              Item Not Available
            </h3>

            <p className="text-gray-400 mb-6">
              Sorry,{" "}
              <span className="text-yellow-400 font-semibold">
                {stockModal.item?.item_name}
              </span>{" "}
              is low in stock.
            </p>

            <button
              onClick={() =>
                setStockModal({
                  open: false,
                  item: null,
                })
              }
              className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-lg font-bold transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuContainer;