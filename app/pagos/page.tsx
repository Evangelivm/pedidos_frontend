"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { SearchBar } from "@/components/search-bar"
import { PaymentsTable } from "@/components/payments-table"
import { Button } from "@/components/ui/button"
import { Download, Filter, CreditCard } from "lucide-react"
import { exportPaymentsToExcel } from "@/lib/export-utils"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("Todos")
  const { toast } = useToast()

  useEffect(() => {
    // Cargar pedidos desde localStorage
    const storedOrders = localStorage.getItem("orders")
    if (storedOrders) {
      const orders = JSON.parse(storedOrders)

      // Filtrar solo los pedidos que tienen información de pago
      const paymentsData = orders
        .filter((order: any) => order.paymentDetails)
        .map((order: any) => ({
          id: order.id,
          date: order.paymentDetails.date,
          customerName: order.paymentDetails.customerName || `Cliente de Pedido #${order.id.slice(0, 8)}`,
          customerPhone: order.paymentDetails.customerPhone || "",
          total: order.total,
          cash: order.paymentDetails.cash || 0,
          yape: order.paymentDetails.yape || 0,
          transfer: order.paymentDetails.transfer || 0,
          totalPaid: order.paymentDetails.totalPaid || 0,
          status: order.paymentStatus,
          orderId: order.id,
        }))

      setPayments(paymentsData)
    }
    setLoading(false)
  }, [])

  // Filtrar pagos según el estado seleccionado
  const filteredPayments =
    filterStatus === "Todos" ? payments : payments.filter((payment) => payment.status === filterStatus)

  // Manejar exportación a Excel
  const handleExportToExcel = () => {
    try {
      if (filteredPayments.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay pagos disponibles para exportar.",
          variant: "destructive",
        })
        return
      }

      // Exportar los pagos
      exportPaymentsToExcel(filteredPayments)

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${filteredPayments.length} pagos a Excel.`,
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)

      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los pagos. Inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="p-4 md:p-6 flex-1 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-green-600" />
              Registro de Pagos
            </h1>
            <p className="text-gray-500 text-sm">Consulte y gestione todos los pagos recibidos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-300" onClick={handleExportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <div className="flex-1">
            <SearchBar placeholder="Buscar por cliente, teléfono o ID..." />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">Todos los estados</SelectItem>
                <SelectItem value="Pagado">Pagados</SelectItem>
                <SelectItem value="Pendiente">Pendientes</SelectItem>
                <SelectItem value="Cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-300 whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-auto flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="ml-3 text-gray-600">Cargando pagos...</p>
            </div>
          ) : (
            <PaymentsTable payments={filteredPayments} />
          )}
        </div>
      </div>
    </main>
  )
}
