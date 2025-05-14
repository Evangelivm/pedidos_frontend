import React from "react"
import { formatCurrency } from "@/lib/utils"

interface ThermalReceiptProps {
  order: {
    id: string
    items: Array<{
      id: number
      name: string
      price: number
      quantity: number
    }>
    total: number
    paymentMethod: string
    date: string
  }
}

export const ThermalReceipt = React.forwardRef<HTMLDivElement, ThermalReceiptProps>(({ order }, ref) => {
  // Format date
  const formattedDate = new Date(order.date).toLocaleDateString()
  const formattedTime = new Date(order.date).toLocaleTimeString()

  // Get payment method display name
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "efectivo":
        return "EFECTIVO"
      case "tarjeta":
        return "TARJETA DE CRÉDITO"
      case "transferencia":
        return "TRANSFERENCIA BANCARIA"
      default:
        return method.toUpperCase()
    }
  }

  // Calculate total (without tax)
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Generate a simple text-based barcode representation
  const generateTextBarcode = () => {
    return "||||| |||| ||| |||| |||"
  }

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
        <div style={{ fontWeight: "bolder" }}>TIENDA ACME</div>
        <div>Av. Principal 123, Ciudad</div>
        <div>Tel: 123-456789</div>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

      <div style={{ textAlign: "center", fontWeight: "bolder", marginBottom: "8px" }}>
        {getPaymentMethod(order.paymentMethod)}
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div>Fecha: {formattedDate}</div>
        <div>Hora: {formattedTime}</div>
        <div>Pedido #: {order.id.slice(0, 8)}</div>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: "bolder" }}>Descripción</span>
          <span style={{ fontWeight: "bolder" }}>Precio</span>
        </div>
        {order.items.map((item) => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {item.name.length > 20 ? item.name.substring(0, 17) + "..." : item.name}
              {item.quantity > 1 ? ` x${item.quantity}` : ""}
            </span>
            <span>{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bolder" }}>
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

      <div style={{ textAlign: "center", fontWeight: "bolder", marginBottom: "8px" }}>¡GRACIAS POR SU COMPRA!</div>

      <div style={{ textAlign: "center", margin: "8px 0" }}>
        <div>{generateTextBarcode()}</div>
        <div>{order.id}</div>
      </div>
    </div>
  )
})

ThermalReceipt.displayName = "ThermalReceipt"
