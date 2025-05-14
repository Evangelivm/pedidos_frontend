"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, Printer, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { PrintReceiptModal } from "@/components/print-receipt-modal"
import { DispatchFormModal } from "@/components/dispatch-form-modal"
import { PaymentModal } from "@/components/payment-modal"
import { Badge } from "@/components/ui/badge"

type Order = {
  id: string
  items: Array<{
    id: number
    name: string
    price: number
    image: string
    quantity: number
  }>
  total: number
  paymentMethod: string
  pointOfSale: string
  date: string
  status: string
  paymentStatus: string
}

export default function OrdersTable() {
  const router = useRouter()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [printOrder, setPrintOrder] = useState<Order | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null)
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Load orders from localStorage on component mount
  useEffect(() => {
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }, [])

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([])
    } else {
      setSelectedOrders(orders.map((order) => order.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedOrders.includes(id)) {
      setSelectedOrders(selectedOrders.filter((orderId) => orderId !== id))
    } else {
      setSelectedOrders([...selectedOrders, id])
    }
  }

  const handleEditOrder = (orderId: string) => {
    router.push(`/agregar?id=${orderId}`)
  }

  const handleDeleteOrder = (orderId: string) => {
    const updatedOrders = orders.filter((order) => order.id !== orderId)
    localStorage.setItem("orders", JSON.stringify(updatedOrders))
    setOrders(updatedOrders)

    toast({
      title: "Pedido eliminado",
      description: `El pedido #${orderId} ha sido eliminado correctamente.`,
    })
  }

  const handlePrintOrder = (order: Order) => {
    setPrintOrder(order)
    setIsPrintModalOpen(true)
  }

  const handleDispatchOrder = (order: Order) => {
    setDispatchOrder(order)
    setIsDispatchModalOpen(true)
  }

  const handlePaymentOrder = (order: Order) => {
    setPaymentOrder(order)
    setIsPaymentModalOpen(true)
  }

  const handlePaymentComplete = () => {
    // Refresh orders from localStorage
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders))
    }
  }

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  // Get customer name from first item
  const getCustomerName = (order: Order) => {
    if (order.items.length > 0) {
      return `Cliente de Pedido #${order.id.slice(0, 6)}`
    }
    return "Cliente Desconocido"
  }

  // Get seller name from point of sale
  const getSellerName = (pointOfSale: string) => {
    switch (pointOfSale) {
      case "tienda1":
        return "[42845079] Punto de Venta - Tienda 1"
      case "tienda2":
        return "[74563065] Punto de Venta - Tienda 2"
      case "tienda3":
        return "[45875037] Punto de Venta - Tienda 3"
      default:
        return pointOfSale
    }
  }

  // Get payment method display name
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Contra Entrega Efectivo"
      case "tarjeta":
        return "Tarjeta de Crédito"
      case "transferencia":
        return "Transferencia Bancaria"
      default:
        return method
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Entregado":
        return <Badge className="bg-green-500">Entregado</Badge>
      case "En ruta":
        return <Badge className="bg-blue-500">En ruta</Badge>
      case "Cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge className="bg-orange-500">Creado</Badge>
    }
  }

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Pagado":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "Cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge className="bg-blue-500">Creado</Badge>
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="table-header-warning">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedOrders.length === orders.length && orders.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Vendedor</th>
              <th className="p-3">Método de Pago</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado del pedido</th>
              <th className="p-3">Estado de Pago</th>
              <th className="p-3">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-6 text-center text-gray-500 bg-white">
                  <div className="flex flex-col items-center justify-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No hay pedidos disponibles</p>
                    <p className="text-sm text-gray-400 mt-1">Haga clic en "Agregar" para crear un nuevo pedido</p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={() => toggleSelect(order.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3 font-medium">{getCustomerName(order)}</td>
                  <td className="p-3">{getSellerName(order.pointOfSale)}</td>
                  <td className="p-3">{getPaymentMethod(order.paymentMethod)}</td>
                  <td className="p-3">{formatDate(order.date)}</td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3">{getPaymentStatusBadge(order.paymentStatus)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-success"
                        onClick={() => handleEditOrder(order.id)}
                        title="Editar Pedido"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-danger"
                        onClick={() => handleDeleteOrder(order.id)}
                        title="Eliminar Pedido"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handlePrintOrder(order)}
                        title="Imprimir Recibo"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`${order.paymentStatus === "Pagado" ? "btn-icon-success" : "btn-icon-success opacity-50"}`}
                        onClick={() => handleDispatchOrder(order)}
                        disabled={order.paymentStatus !== "Pagado"}
                        title={
                          order.paymentStatus === "Pagado"
                            ? "Gestionar Despacho"
                            : "Debe completar el pago antes de despachar"
                        }
                      >
                        <Truck className="h-5 w-5" />
                      </Button>
                      {order.paymentStatus !== "Pagado" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-warning text-orange-600"
                          onClick={() => handlePaymentOrder(order)}
                          title="Registrar Pago"
                        >
                          <CreditCard className="h-5 w-5" />
                        </Button>
                      )}
                      {order.paymentStatus === "Pagado" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-success text-green-600"
                          disabled
                          title="Pago Completado"
                        >
                          <CreditCard className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {printOrder && (
        <PrintReceiptModal
          order={printOrder}
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false)
            setPrintOrder(null)
          }}
        />
      )}

      {dispatchOrder && (
        <DispatchFormModal
          order={dispatchOrder}
          isOpen={isDispatchModalOpen}
          onClose={() => {
            setIsDispatchModalOpen(false)
            setDispatchOrder(null)
          }}
        />
      )}

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setPaymentOrder(null)
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  )
}

import { ShoppingCart } from "lucide-react"
