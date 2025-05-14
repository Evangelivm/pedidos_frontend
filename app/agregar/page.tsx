"use client"

import { ShoppingCartOrderForm } from "@/components/shopping-cart-order-form"
import { TopBar } from "@/components/top-bar"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function AddOrderPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("id")
  const [orderData, setOrderData] = useState<any>(null)
  const [loading, setLoading] = useState(!!orderId)

  useEffect(() => {
    if (orderId) {
      // Load order data from localStorage
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]")
      const order = storedOrders.find((o: any) => o.id === orderId)

      if (order) {
        setOrderData({
          items: order.items,
          paymentMethod: order.paymentMethod,
          pointOfSale: order.pointOfSale,
        })
      }

      setLoading(false)
    }
  }, [orderId])

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="p-4 flex-1 flex items-center justify-center">
          <p>Cargando datos del pedido...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="p-4 flex-1">
        <h1 className="text-2xl font-bold mb-6">{orderId ? "Editar Pedido" : "Agregar Nuevo Pedido"}</h1>
        <ShoppingCartOrderForm
          orderId={orderId || undefined}
          initialCart={orderData?.items || []}
          paymentMethod={orderData?.paymentMethod}
          pointOfSale={orderData?.pointOfSale}
        />
      </div>
    </main>
  )
}
