import { useState } from "react";

const Bill = ({ cartItems, totalAmount, onPlaceOrder }) => {
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const total = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const tax = total * 0.0525;

  return (
    <div className="bg-[#1f1f1f] rounded-xl p-12 sm:p-5 w-full space-y-3">

      {/* Items */}
      <div className="flex justify-between text-sm sm:text-base">
        <p className="text-gray-400 font-medium">
          Items ({cartItems.length})
        </p>
        <h1 className="text-white font-bold">
          ₹{total.toFixed(2)}
        </h1>
      </div>

      {/* Tax */}
      <div className="flex justify-between text-sm sm:text-base">
        <p className="text-gray-400 font-medium">
          Tax (5.25%)
        </p>
        <h1 className="text-white font-bold">
          ₹{tax.toFixed(2)}
        </h1>
      </div>

      {/* Divider */}
      <div className="border-t border-[#333] my-2"></div>

      {/* Total */}
      <div className="flex justify-between text-base sm:text-lg">
        <p className="text-gray-300 font-semibold">
          Total With Tax
        </p>
        <h1 className="text-yellow-400 font-bold text-lg">
          ₹{Number(totalAmount).toFixed(2)}
        </h1>
      </div>

      {/* Payment Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setPaymentMethod("CASH")}
          className={`py-2 rounded-lg font-semibold transition-all duration-200 ${
            paymentMethod === "CASH"
              ? "bg-[#f6b100] text-black"
              : "bg-[#383737] text-white hover:bg-[#4a4a4a]"
          }`}
        >
          Cash
        </button>

        <button
          type="button"
          onClick={() => setPaymentMethod("ONLINE")}
          className={`py-2 rounded-lg font-semibold transition-all duration-200 ${
            paymentMethod === "ONLINE"
              ? "bg-[#f6b100] text-black"
              : "bg-[#383737] text-white hover:bg-[#4a4a4a]"
          }`}
        >
          Online
        </button>
      </div>

      {/* Place Order */}
      <div className="pt-3">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onPlaceOrder(paymentMethod);
          }}
          disabled={cartItems.length === 0}
          className={`w-full py-2.5 rounded-lg font-bold transition-all duration-200 ${
            cartItems.length === 0
              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[#f6b100] text-black hover:scale-[1.02]"
          }`}
        >
          Place Order
        </button>
      </div>

    </div>
  );
};

export default Bill;