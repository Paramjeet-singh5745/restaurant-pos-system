
import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import BackButton from "../../components/shared/BackButton";
import BottomNav from "../../components/shared/BottomNav";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  LayoutGrid,
  List,
} from "lucide-react";

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  const [itemForm, setItemForm] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    open: false,
    type: "",
    data: null,
  });

  /* ================= FETCH ================= */

  const fetchCategories = async () => {
    try {
      const res = await api.get("/menu/categories");
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setCategories(list);

      if (!selectedCategory && list.length > 0) {
        setSelectedCategory(list[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async (categoryId) => {
    setLoading(true);
    try {
      const res = await api.get(`/menu/items/${categoryId}`);
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.data || [];
      setItems(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchItems(selectedCategory.category_id);
    }
  }, [selectedCategory]);

  /* ================= CATEGORY ACTIONS ================= */

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    await api.post("/menu/categories", {
      category_name: newCategory,
    });
    setNewCategory("");
    fetchCategories();
  };

  const updateCategory = async () => {
    if (!editingCategory.category_name.trim()) return;

    await api.patch(
      `/menu/categories/${editingCategory.category_id}`,
      { category_name: editingCategory.category_name }
    );

    setEditingCategory(null);
    fetchCategories();
  };

  const deleteCategory = async () => {
    await api.delete(
      `/menu/categories/${confirmModal.data.category_id}`
    );
    setConfirmModal({ open: false, type: "", data: null });
    setSelectedCategory(null);
    setItems([]);
    fetchCategories();
  };

  /* ================= ITEM ACTIONS ================= */

  const addItem = async () => {
    if (!itemForm.name || !itemForm.price) return;

    await api.post("/menu/items", {
      category_id: selectedCategory.category_id,
      item_name: itemForm.name,
      price: itemForm.price,
    });

    setItemForm({ name: "", price: "" });
    fetchItems(selectedCategory.category_id);
  };

  const updateItem = async () => {
    if (!editingItem.item_name || !editingItem.price) return;

    await api.patch(
      `/menu/items/${editingItem.item_id}`,
      {
        item_name: editingItem.item_name,
        price: editingItem.price,
      }
    );

    setEditingItem(null);
    fetchItems(selectedCategory.category_id);
  };

  const deleteItem = async () => {
    await api.delete(
      `/menu/items/${confirmModal.data.item_id}`
    );
    setConfirmModal({ open: false, type: "", data: null });
    fetchItems(selectedCategory.category_id);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col">
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">

        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="w-full lg:w-80 bg-[#121212] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">

          <div className="p-4 border-b border-white/10 sticky top-0 bg-[#121212] z-10">
            <div className="flex items-center gap-3 mb-4">
              <BackButton />
              <span className="text-sm text-gray-500">
                Menu Customize
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <LayoutGrid size={18} className="text-yellow-500" />
              <h2 className="font-bold">Categories</h2>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 bg-[#1a1a1a] rounded-lg border border-white/10 focus:border-yellow-500 outline-none text-sm"
                placeholder="Add category..."
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value)
                }
              />
              <button
                onClick={addCategory}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 rounded-lg"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.category_id}
                onClick={() => {
                  setSelectedCategory(cat);
                  setEditingCategory(null);
                }}
                className={`p-3 rounded-xl cursor-pointer transition border flex justify-between items-center ${
                  selectedCategory?.category_id ===
                  cat.category_id
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-400"
                    : "bg-[#1a1a1a] border-transparent hover:border-white/20"
                }`}
              >
                {editingCategory?.category_id === cat.category_id ? (
                  <>
                    <input
                      autoFocus
                      className="flex-1 px-2 py-1 bg-black rounded text-sm"
                      value={editingCategory.category_name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setEditingCategory({
                          ...editingCategory,
                          category_name: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCategory();
                        }}
                        className="p-1 hover:bg-green-500/20 rounded"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory(null);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="truncate text-sm font-medium">
                      {cat.category_name}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingCategory({ ...cat });
                        }}
                        className="p-1 hover:bg-white/10 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            open: true,
                            type: "category",
                            data: cat,
                          });
                        }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ================= RIGHT CONTENT ================= */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-28">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedCategory
                    ? selectedCategory.category_name
                    : "Select Category"}
                </h1>
                <p className="text-gray-500 text-sm">
                  Manage items & pricing
                </p>
              </div>

              {selectedCategory && (
                <div className="flex flex-wrap gap-2 bg-[#121212] p-3 rounded-xl border border-white/10">
                  <input
                    className="px-3 py-2 bg-[#1a1a1a] rounded-lg text-sm border border-white/10"
                    placeholder="Item Name"
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        name: e.target.value,
                      })
                    }
                  />
                  <input
                    type="number"
                    className="w-24 px-3 py-2 bg-[#1a1a1a] rounded-lg text-sm border border-white/10"
                    placeholder="Price"
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        price: e.target.value,
                      })
                    }
                  />
                  <button
                    onClick={addItem}
                    className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin h-8 w-8 border-b-2 border-yellow-500 rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {items.map((item) => (
                  <div
                    key={item.item_id}
                    className="bg-[#121212] p-4 rounded-2xl border border-white/10"
                  >
                    {editingItem?.item_id === item.item_id ? (
                      <>
                        <input
                          autoFocus
                          className="w-full mb-2 px-2 py-1 bg-black rounded text-sm"
                          value={editingItem.item_name}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              item_name: e.target.value,
                            })
                          }
                        />
                        <input
                          type="number"
                          className="w-full mb-2 px-2 py-1 bg-black rounded text-sm"
                          value={editingItem.price}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              price: e.target.value,
                            })
                          }
                        />
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={updateItem}
                            className="p-2 hover:bg-green-500/20 rounded"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={() => setEditingItem(null)}
                            className="p-2 hover:bg-red-500/20 rounded"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between mb-3">
                          <h3 className="font-bold">
                            {item.item_name}
                          </h3>
                          <span className="text-green-400 font-bold">
                            ₹{item.price}
                          </span>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-white/10 pt-2">
                          <button
                            onClick={() =>
                              setEditingItem({ ...item })
                            }
                            className="p-2 hover:bg-yellow-500/10 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmModal({
                                open: true,
                                type: "item",
                                data: item,
                              })
                            }
                            className="p-2 hover:bg-red-500/10 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!selectedCategory && (
              <div className="text-center py-20 text-gray-600">
                <List size={48} className="mx-auto opacity-20 mb-4" />
                Select a category to manage items.
              </div>
            )}
          </div>
        </main>
      </div>

      {/* DELETE MODAL SAME AS YOURS */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a1a] p-6 rounded-2xl w-full max-w-sm border border-white/10">
            <h3 className="text-lg font-bold mb-4">
              Delete {confirmModal.type}?
            </h3>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-white/10 py-2 rounded-lg"
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    type: "",
                    data: null,
                  })
                }
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 py-2 rounded-lg"
                onClick={
                  confirmModal.type === "category"
                    ? deleteCategory
                    : deleteItem
                }
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MenuManagement;