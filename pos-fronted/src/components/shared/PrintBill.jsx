import React, { forwardRef, memo } from "react";
import Barcode from "react-barcode";

const PrintBill = memo(
  forwardRef(({ order }, ref) => {
    if (!order) return null;

    const {
      restaurant_name,
      phone,
      address,
      tableNumber,
      customer,
      items,
      total,
      tax,
      totalWithTax,
      orderId,
    } = order;

    const now = new Date();

    return (
      <>
        {/* PRINT STYLE FIX */}
        <style>
          {`
            @media print {

              @page {
                size: 80mm auto;
                margin: 5mm;   /* small safe margin */
              }

              html, body {
                margin: 0 !important;
                padding: 0 !important;
                background: #fff;
              }

              .print-container {
                width: 100% !important;
                max-width: 80mm !important;
                margin: 0 auto !important;
                padding: 6px !important;
                box-sizing: border-box;
              }

              .no-print {
                display: none !important;
              }
            }
          `}
        </style>

        <div
          ref={ref}
          className="print-container"
          style={{
            width: "100%",
            maxWidth: "80mm",
            margin: "0 auto",
            padding: "8px",
            fontFamily: "monospace",
            background: "#fff",
            color: "#000",
            fontSize: "12px",
            lineHeight: "1.4",
            boxSizing: "border-box",
            wordBreak: "break-word",
          }}
        >
          {/* HEADER */}
          <div style={{ textAlign: "center" }}>
            <h3 style={{ margin: "0 0 4px 0" }}>{restaurant_name}</h3>
            <div>{address}</div>
            <div>Tel: {phone}</div>
          </div>

          <hr style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* ORDER INFO */}
          <div>
            <div>
              {now.toLocaleDateString()} {now.toLocaleTimeString()}
            </div>
            <div>Table: {tableNumber}</div>
            <div>Customer: {customer?.customer_name || "-"}</div>
            <div>Mobile: {customer?.phone || "-"}</div>
            <div>Invoice: {orderId}</div>
          </div>

          <hr style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* ITEMS HEADER */}
          <div
            style={{
              display: "flex",
              fontWeight: "bold",
              borderBottom: "1px solid #000",
              paddingBottom: "3px",
            }}
          >
            <div style={{ width: "15%" }}>QTY</div>
            <div style={{ width: "55%", textAlign: "center" }}>DESC</div>
            <div style={{ width: "30%", textAlign: "right" }}>AMT</div>
          </div>

          {/* ITEMS */}
          {items?.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                marginTop: "4px",
              }}
            >
              <div style={{ width: "15%" }}>{item.quantity}</div>

              <div
                style={{
                  width: "55%",
                  textAlign: "center",
                  padding: "0 3px",
                  wordBreak: "break-word",
                }}
              >
                {item.item_name}
              </div>

              <div style={{ width: "30%", textAlign: "right" }}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </div>
            </div>
          ))}

          <hr style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* TOTALS */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Sub Total:</span>
              <span>₹{total?.toFixed(2)}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Tax:</span>
              <span>₹{tax?.toFixed(2)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                marginTop: "4px",
              }}
            >
              <span>Grand Total:</span>
              <span>₹{totalWithTax?.toFixed(2)}</span>
            </div>
          </div>

          <hr style={{ borderTop: "1px dashed #000", margin: "6px 0" }} />

          {/* BARCODE */}
          <div style={{ textAlign: "center" }}>
            <Barcode
              value={String(orderId)}
              width={1}
              height={40}
              margin={0}
              displayValue={false}
            />
          </div>

          <div style={{ textAlign: "center", marginTop: "6px" }}>
            Thank You! Visit Again
          </div>
        </div>
      </>
    );
  })
);

export default PrintBill;