import React, { useState } from "react";

const CustomerForm = ({ onSave }) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !phone) {
      alert("Please fill all fields");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Phone number must be 10 digits");
      return;
    }

    // Send data to parent
    onSave({
      customer_name: name,
      phone: phone,
    });

    // DO NOT clear here if you want static display
    // setName("");
    // setPhone("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Customer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border px-3 py-2 rounded-lg"
      />

      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border px-3 py-2 rounded-lg"
      />

      <button
        type="submit"
        className="w-full bg-[#F6B100] text-[#1f1f1f]
                   rounded-lg py-3 font-semibold hover:bg-yellow-600 transition-colors"
      >
        Save Customer
      </button>
    </form>
  );
};

export default CustomerForm;
