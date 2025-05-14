import React from "react"

interface ThermalDispatchReceiptProps {
  dispatch: {
    orderId: string
    customerName: string
    address: string
    phone: string
    deliveryDate: string
    creationTime: string
    notes: string
    items: Array<{
      id: number
      name: string
      quantity: number
    }>
    totalProductCount: number
  }
}

export const ThermalDispatchReceipt = React.forwardRef<HTMLDivElement, ThermalDispatchReceiptProps>(
  ({ dispatch }, ref) => {
    // Format dates
    const formattedDeliveryDate = new Date(dispatch.deliveryDate).toLocaleDateString()
    const formattedCreationTime = new Date(dispatch.creationTime).toLocaleString()

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
          fontSize: "13px", // Aumentado de 12px a 13px
          lineHeight: "1.2",
          padding: "0",
          margin: "0",
          boxSizing: "border-box",
          backgroundColor: "white",
          fontWeight: "bold", // Añadido para que todo sea en negrita
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontWeight: "bolder" }}>TIENDA ACME</div>
          <div>Av. Principal 123, Ciudad</div>
          <div>Tel: 123-456789</div>
        </div>

        <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

        <div style={{ textAlign: "center", fontWeight: "bolder", marginBottom: "8px" }}>ORDEN DE DESPACHO</div>
        <div style={{ textAlign: "center", marginBottom: "8px" }}>Pedido #: {dispatch.orderId.slice(0, 8)}</div>

        <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

        <div style={{ marginBottom: "8px" }}>
          <div style={{ fontWeight: "bolder" }}>DATOS DE ENTREGA:</div>
          <div>Cliente: {dispatch.customerName}</div>
          <div>Dirección: {dispatch.address}</div>
          <div>Teléfono: {dispatch.phone}</div>
          <div>Fecha de entrega: {formattedDeliveryDate}</div>
          <div>Creado: {formattedCreationTime}</div>
        </div>

        <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontWeight: "bolder" }}>Producto</span>
            <span style={{ fontWeight: "bolder" }}>Cant</span>
          </div>
          {dispatch.items.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between" }}>
              <span
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: "220px",
                }}
              >
                {item.name.length > 25 ? item.name.substring(0, 22) + "..." : item.name}
              </span>
              <span style={{ fontWeight: "bold" }}>{item.quantity}</span>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bolder" }}>
          <span>Total de productos:</span>
          <span>{dispatch.totalProductCount}</span>
        </div>

        {dispatch.notes && (
          <>
            <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontWeight: "bolder" }}>NOTAS:</div>
              <div>{dispatch.notes}</div>
            </div>
          </>
        )}

        <div style={{ textAlign: "center", margin: "8px 0" }}>{Array(75).fill("-").join("")}</div>

        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <div style={{ fontWeight: "bolder" }}>FIRMA DE RECEPCIÓN:</div>
          <div style={{ margin: "16px 0" }}>{Array(32).fill("_").join("")}</div>
          <div>Nombre y DNI</div>
        </div>

        <div style={{ textAlign: "center", margin: "8px 0" }}>
          <div>{generateTextBarcode()}</div>
          <div>{dispatch.orderId}</div>
        </div>
      </div>
    )
  },
)

ThermalDispatchReceipt.displayName = "ThermalDispatchReceipt"
