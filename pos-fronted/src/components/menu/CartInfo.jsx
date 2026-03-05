
import React from "react";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { useCart } from "../../components/context/CartContext";

const CartInfo = () => {
  const { cart, removeItem, addItem, deleteItem } = useCart();

  return (
    <div className="px-4 py-2">
      <h1 className="text-md text-[#e4e4e4] font-semibold">Order Details</h1>
      <div className="mt-1 overflow-y-scroll h-[230px]">
        {cart.map((item) => (
          <div key={item.item_id} className="bg-[#1f1f1f] rounded-lg px-4 py-4 mb-2">
            <div className="flex justify-between">
              <h1 className="text-gray-300 font-semibold">{item.item_name}</h1>
              <p className="text-gray-300">x{item.quantity}</p>
            </div>

            <div className="flex justify-between mt-3 items-center">
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => removeItem(item.item_id)}
                  className="text-yellow-500 text-xl"
                >
                  −
                </button>
                <span className="text-white">{item.quantity}</span>
                <button
                  onClick={() => addItem(item)}
                  className="text-yellow-500 text-xl"
                >
                  +
                </button>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-white font-bold">₹{item.price * item.quantity}</p>
                <RiDeleteBin2Fill
                  onClick={() => deleteItem(item.item_id)}
                  className="text-gray-400 cursor-pointer"
                  size={20}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartInfo;
