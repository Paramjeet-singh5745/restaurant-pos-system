import React from "react";
import PaymentComponent from "../components/payment/PaymentComponet";
import BottomNav from "../components/shared/BottomNav";

const Payment = () => {
  return (
    <section className="min-h-screen bg-[#1f1f1f] flex flex-col">

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4">
          <PaymentComponent />
        </div>
      </main>

      {/* Bottom Navigation */}
      <footer className="sticky bottom-0 z-50 bg-[#111111] border-t border-gray-800">
        <BottomNav />
      </footer>

    </section>
  );
};

export default Payment;