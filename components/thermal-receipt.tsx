import React from "react";
import { formatCurrency } from "@/lib/utils";

interface ThermalReceiptProps {
  order: {
    id: string;
    numero: string;
    items: Array<{
      id: number;
      name: string;
      price: number;
      quantity: number;
      unit: string;
    }>;
    total: number;
    paymentMethod: string;
    created_at: string;
    clientName: string;
  };
}

export const ThermalReceipt = React.forwardRef<
  HTMLDivElement,
  ThermalReceiptProps
>(({ order }, ref) => {
  // Format date
  const formattedDate = new Date(order.created_at).toLocaleDateString();
  const formattedTime = new Date(order.created_at).toLocaleTimeString();

  // Get payment method display name
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "efectivo":
        return "EFECTIVO";
      case "tarjeta":
        return "TARJETA DE CRÉDITO";
      case "transferencia":
        return "TRANSFERENCIA BANCARIA";
      default:
        return method.toUpperCase();
    }
  };

  // Calculate total (without tax)
  const total = order.items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div
      ref={ref}
      className="thermal-receipt"
      style={{
        width: "80mm",
        fontFamily: "Arial, sans-serif",
        fontSize: "13px",
        lineHeight: "1.2",
        padding: "0",
        margin: "0",
        boxSizing: "border-box",
        backgroundColor: "white",
        fontWeight: "bold",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <div style={{ fontWeight: "bolder" }}>
          {process.env.NEXT_PUBLIC_NOMBRE_EMPRESA}
        </div>
        <div>{process.env.NEXT_PUBLIC_DIRECCION_EMPRESA}</div>
        <div>Tel: {process.env.NEXT_PUBLIC_TELEFONO_EMPRESA}</div>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>
        {Array(69).fill("-").join("")}
      </div>

      <div
        style={{
          textAlign: "center",
          fontWeight: "bolder",
          marginBottom: "8px",
        }}
      >
        {getPaymentMethod(order.paymentMethod)}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div>
          <b>Fecha:</b> {formattedDate}
        </div>
        <div>
          <b>Hora:</b> {formattedTime}
        </div>
        <div>
          <b>Pedido:</b> {order.numero}
        </div>
        <div>
          <b>Cliente:</b> {order.clientName}
        </div>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>
        {Array(69).fill("-").join("")}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontWeight: "bolder", flex: 2 }}>Descripción</span>
          <span style={{ fontWeight: "bolder", textAlign: "center", flex: 1 }}>
            Cant.
          </span>
          <span style={{ fontWeight: "bolder", textAlign: "center", flex: 1 }}>
            Unid.
          </span>
          <span style={{ fontWeight: "bolder", textAlign: "right", flex: 1 }}>
            Precio
          </span>
        </div>

        {order.items.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <span
              style={{ flex: 2, maxWidth: "200px", wordBreak: "break-word" }}
            >
              {item.name.match(/.{1,17}/g)?.map((chunk, i) => (
                <span key={i}>
                  {chunk}
                  <br />
                </span>
              ))}
            </span>

            <span style={{ flex: 1, textAlign: "center" }}>
              {item.quantity}
            </span>
            <span style={{ flex: 1, textAlign: "center" }}>{item.unit}</span>
            <span style={{ flex: 1, textAlign: "right" }}>
              {formatCurrency(item.price)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>
        {Array(69).fill("-").join("")}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontWeight: "bolder",
        }}
      >
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>
        {Array(69).fill("-").join("")}
      </div>

      <div
        style={{
          textAlign: "center",
          fontWeight: "bolder",
          marginBottom: "8px",
        }}
      >
        ¡GRACIAS POR SU COMPRA!
      </div>
    </div>
  );
});

ThermalReceipt.displayName = "ThermalReceipt";
