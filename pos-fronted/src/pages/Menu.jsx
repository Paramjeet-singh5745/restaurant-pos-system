
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

import BottomNav from "../components/shared/BottomNav";
import BackButton from "../components/shared/BackButton";
import MenuContainer from "../components/menu/MenuContainer";
import CustomerInfo from "../components/menu/CustomerInfo";
import CartInfo from "../components/menu/CartInfo";
import Bill from "../components/menu/Bill";
import CustomModal from "../components/shared/CustomModal";
import PrintBill from "../components/shared/PrintBill";

import { useCart } from "../components/context/CartContext";
import api from "../utils/api"; 
import { getEmployeeAuth } from "../utils/auth";

const Menu = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const billRef = useRef();

  /* ================= STATE ================= */
  const [customer, setCustomer] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [billData, setBillData] = useState(null);

  const [modal, setModal] = useState({
    isOpen: false,
    type: "success",
    message: "",
  });

  /* ================= LOAD RAZORPAY ================= */
  useEffect(() => {
    const loadRazorpay = () => {
      return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
      });
    };

    loadRazorpay();
  }, []);

  /* ================= CLEAR CART WHEN TABLE CHANGES ================= */
  useEffect(() => {
    clearCart();
    setCustomer(null);
  }, [tableId]);

  /* ================= FETCH TABLE ================= */
  useEffect(() => {
    const fetchTable = async () => {
      try {
        setLoadingTable(true);
        const token = getEmployeeAuth();

      const res = await api.get("/tables"); 

        const table = res.data.tables.find(
          (t) => t.table_id === Number(tableId)
        );

        if (table) setTableNumber(table.table_number);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchTable();
  }, [tableId]);

  /* ================= FETCH RESTAURANT ================= */
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = getEmployeeAuth();

         const res = await api.get("/restaurant");
        setRestaurant(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchRestaurant();
  }, []);

  /* ================= CALCULATIONS ================= */
  const total = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const tax = total * 0.0525;
  const totalWithTax = Number((total + tax).toFixed(2));

  /* ================= SAVE ORDER ================= */
  const saveOrder = async (orderData) => {
    try {
      const token = getEmployeeAuth();
      if (!token) {
        return setModal({
          isOpen: true,
          type: "error",
          message: "You are not logged in",
        });
      }

        const orderRes = await api.post("/orders/create", orderData);
      await api.patch(`/tables/${tableId}`, { table_status: "OCCUPIED" });

      const orderId =
        orderRes.data?.order_id || Math.floor(Math.random() * 1000000);

      setBillData({
        restaurant_name: restaurant?.name,
        phone: restaurant?.phone,
        address: restaurant?.address,
        tableNumber,
        customer,
        items: cart,
        total,
        tax,
        totalWithTax,
        paymentMethod: orderData.payment_method,
        paymentStatus: orderData.payment_status,
        orderId,
      });

      clearCart();
      setCustomer(null);
    } catch (error) {
      setModal({
        isOpen: true,
        type: "error",
        message: error.response?.data?.message || "Order failed!",
      });
    }
  };

  /* ================= HANDLE ORDER ================= */
  const handlePlaceOrder = async (paymentMethod) => {
    if (!customer)
      return setModal({
        isOpen: true,
        type: "error",
        message: "Please fill customer details",
      });

    if (cart.length === 0)
      return setModal({
        isOpen: true,
        type: "error",
        message: "Cart is empty",
      });

    const orderData = {
      table_id: Number(tableId),
      customer,
      items: cart.map((item) => ({
        item_id: item.item_id,
        quantity: item.quantity,
        price: item.price,
      })),
      total_amount: totalWithTax,
      payment_method: paymentMethod,
      payment_status: paymentMethod === "CASH" ? "PAID" : "PENDING",
    };

    if (paymentMethod === "CASH") {
      await saveOrder(orderData);
    } else {
      try {
        const token = getEmployeeAuth();

        const { data } = await api.post("/razorpay/create-order", {
          amount: Math.round(totalWithTax * 100),
        });
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: data.data.amount,
          currency: data.data.currency,
          name: restaurant?.name || "Restaurant",
          order_id: data.data.id,
          handler: async function (response) {
            orderData.payment_status = "PAID";
            await saveOrder(orderData);
          },
          prefill: {
            name: customer.customer_name,
            contact: customer.phone,
          },
          theme: { color: "#f6b100" },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        alert("Payment failed");
      }
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      {/* MODAL */}
      <CustomModal
        isOpen={modal.isOpen}
        type={modal.type}
        message={modal.message}
        onClose={() => setModal({ ...modal, isOpen: false })}
      />

      {/* BILL POPUP */}
      {billData && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <PrintBill ref={billRef} order={billData} />

            <div className="flex justify-between mt-4">
              <button
                onClick={() => window.print()}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Print
              </button>

              <button
                onClick={() => {
                  setBillData(null);
                  navigate("/orders");
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

{/* MAIN LAYOUT */}
<section className="bg-[#1f1f1f] min-h-screen flex flex-col lg:flex-row">
  {/* LEFT SECTION */}
<div className="flex-1 flex flex-col">
    {/* Header */}
    <div className="p-3">
      <div className="flex items-center gap-4 mb-4">
        <BackButton />
        <div>
          <h1 className="text-white text-2xl font-bold">Menu</h1>
          <p className="text-yellow-400 text-sm">
            {loadingTable
              ? "Loading..."
              : `Serving Table ${tableNumber}`}
          </p>
        </div>
      </div>
    </div>

    {/* Scrollable Menu Content */}
   <div className="px-3 pb-28 lg:pb-6">
      <MenuContainer />
    </div>

  </div>

  {/* RIGHT PANEL */}
<div className="w-full lg:w-[380px] bg-[#1a1a1a] p-4 pb-28 lg:pb-6">
    <CustomerInfo
      customer={customer}
      setCustomer={setCustomer}
    />

    <CartInfo />

    <Bill
      cartItems={cart}
      totalAmount={totalWithTax}
      onPlaceOrder={handlePlaceOrder}
    />
  </div>

</section>

      <BottomNav setCustomer={setCustomer} />
    </>
  );
};

export default Menu;