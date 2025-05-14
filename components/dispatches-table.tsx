"use client"

import { useState } from "react"
import { Truck, Eye, Printer, CheckCircle, XCircle, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { ThermalDispatchReceipt } from "@/components/thermal-dispatch-receipt"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ThermalPrinter } from "@/lib/thermal-printer"

interface DispatchesTableProps {
  dispatches: any[]
}

export function DispatchesTable({ dispatches }: DispatchesTableProps) {
  const { toast } = useToast()
  const [selectedDispatches, setSelectedDispatches] = useState<string[]>([])
  const [printDispatch, setPrintDispatch] = useState<any | null>(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [viewDispatch, setViewDispatch] = useState<any | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const toggleSelectAll = () => {
    if (selectedDispatches.length === dispatches.length) {
      setSelectedDispatches([])
    } else {
      setSelectedDispatches(dispatches.map((dispatch) => dispatch.orderId))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedDispatches.includes(id)) {
      setSelectedDispatches(selectedDispatches.filter((dispatchId) => dispatchId !== id))
    } else {
      setSelectedDispatches([...selectedDispatches, id])
    }
  }

  const handlePrintDispatch = (dispatch: any) => {
    setPrintDispatch(dispatch)
    setIsPrintModalOpen(true)
  }

  const handleViewDispatch = (dispatch: any) => {
    setViewDispatch(dispatch)
    setIsViewModalOpen(true)
  }

  const handleUpdateStatus = (dispatch: any, newStatus: string) => {
    // Update dispatch status in localStorage
    const storedDispatches = JSON.parse(localStorage.getItem("dispatches") || "{}")

    if (storedDispatches[dispatch.orderId]) {
      storedDispatches[dispatch.orderId].status = newStatus
      localStorage.setItem("dispatches", JSON.stringify(storedDispatches))

      // Update the status in the current state
      const updatedDispatches = dispatches.map((d) =>
        d.orderId === dispatch.orderId ? { ...d, status: newStatus } : d,
      )

      toast({
        title: "Estado actualizado",
        description: `El despacho #${dispatch.orderId.slice(0, 8)} ha sido actualizado a "${newStatus}".`,
      })

      // Refresh the page to show updated data
      window.location.reload()
    }
  }

  const handlePrint = async () => {
    try {
      if (!printDispatch) return

      // Crear una ventana de impresión que preserve exactamente el formato
      const printWindow = window.open("", "_blank", "width=800,height=600")

      if (!printWindow) {
        toast({
          title: "Error de impresión",
          description: "No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.",
          variant: "destructive",
        })
        return
      }

      // Obtener el contenido a imprimir
      const printContent = document.querySelector(".print-content")

      // Escribir el contenido exacto a la nueva ventana
      if (printContent) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impresión de Despacho</title>
              <style>
                @page {
                  size: 80mm auto;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                  width: 80mm;
                  background-color: white;
                  font-family: Arial, sans-serif;
                }
                .receipt-container {
                  width: 80mm;
                  font-family: Arial, sans-serif;
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                ${printContent.innerHTML}
              </div>
              <script>
                // Imprimir automáticamente y cerrar
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `)

        printWindow.document.close()
      }

      // Imprimir usando la biblioteca de impresión térmica
      const success = await ThermalPrinter.printDispatch(printDispatch, { showDialog: true })

      if (success) {
        toast({
          title: "Impresión exitosa",
          description: "El despacho ha sido enviado a la impresora térmica.",
        })
        setIsPrintModalOpen(false)
      }
    } catch (error) {
      console.error("Error al imprimir:", error)
      toast({
        title: "Error de impresión",
        description: "Ocurrió un error al intentar imprimir el despacho.",
        variant: "destructive",
      })
    }
  }

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
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
        return <Badge className="bg-yellow-500">Pendiente</Badge>
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="table-header-success">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedDispatches.length === dispatches.length && dispatches.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Fecha de Entrega</th>
              <th className="p-3">Productos</th>
              <th className="p-3">Fecha de Creación</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {dispatches.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-500 bg-white">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Truck className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No hay despachos disponibles</p>
                    <p className="text-sm text-gray-400 mt-1">Cree un despacho desde la lista de pedidos</p>
                  </div>
                </td>
              </tr>
            ) : (
              dispatches.map((dispatch, index) => (
                <tr
                  key={dispatch.orderId}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedDispatches.includes(dispatch.orderId)}
                      onCheckedChange={() => toggleSelect(dispatch.orderId)}
                    />
                  </td>
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3 font-medium">{dispatch.customerName}</td>
                  <td className="p-3 max-w-[200px] truncate">{dispatch.address}</td>
                  <td className="p-3">{dispatch.phone}</td>
                  <td className="p-3">{new Date(dispatch.deliveryDate).toLocaleDateString()}</td>
                  <td className="p-3 font-medium">{dispatch.totalProductCount}</td>
                  <td className="p-3">{formatDate(dispatch.createdAt)}</td>
                  <td className="p-3">{getStatusBadge(dispatch.status)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handleViewDispatch(dispatch)}
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handlePrintDispatch(dispatch)}
                        title="Imprimir despacho"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                      {dispatch.status !== "Entregado" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-success"
                          onClick={() => handleUpdateStatus(dispatch, "Entregado")}
                          title="Marcar como entregado"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </Button>
                      )}
                      {dispatch.status !== "En ruta" && dispatch.status !== "Entregado" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-primary"
                          onClick={() => handleUpdateStatus(dispatch, "En ruta")}
                          title="Marcar en ruta"
                        >
                          <Truck className="h-5 w-5" />
                        </Button>
                      )}
                      {dispatch.status !== "Cancelado" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-danger"
                          onClick={() => handleUpdateStatus(dispatch, "Cancelado")}
                          title="Cancelar despacho"
                        >
                          <XCircle className="h-5 w-5" />
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

      {/* Print Modal */}
      {printDispatch && (
        <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
          <DialogContent className="max-w-md">
            <div className="border rounded p-2 overflow-auto max-h-[70vh]">
              <div className="print-content">
                <ThermalDispatchReceipt dispatch={printDispatch} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                Cerrar
              </Button>
              <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Despacho
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* View Dispatch Details Modal */}
      {viewDispatch && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-green-700 flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Detalles del Despacho
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Pedido:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md font-medium">
                      #{viewDispatch.orderId.slice(0, 8)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Cliente:</span>
                    <span>{viewDispatch.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Dirección:</span>
                    <span>{viewDispatch.address}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Teléfono:</span>
                    <span>{viewDispatch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Fecha de entrega:</span>
                    <span>{new Date(viewDispatch.deliveryDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Creado:</span>
                    <span>{formatDate(viewDispatch.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2 border-b pb-2">
                    <span className="font-semibold text-gray-700 min-w-[120px]">Estado:</span>
                    {getStatusBadge(viewDispatch.status)}
                  </div>
                  {viewDispatch.notes && (
                    <div className="flex items-start gap-2 pt-1">
                      <span className="font-semibold text-gray-700 min-w-[120px]">Notas:</span>
                      <span className="bg-gray-50 p-2 rounded-md text-sm">{viewDispatch.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold text-lg mb-4 text-green-700 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Productos
                </h3>
                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-green-700 p-2 font-medium grid grid-cols-12 text-sm text-white">
                    <div className="col-span-9">Producto</div>
                    <div className="col-span-3 text-center">Cantidad</div>
                  </div>
                  <div className="max-h-[40vh] overflow-y-auto">
                    {viewDispatch.items.map((item: any) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 items-center p-2 border-t text-sm hover:bg-green-50"
                      >
                        <div className="col-span-9 font-medium truncate flex items-center">
                          <Package className="h-3 w-3 mr-2 text-green-500" />
                          {item.name}
                        </div>
                        <div className="col-span-3 text-center font-bold bg-green-100 text-green-800 rounded-full px-2 py-1 mx-auto">
                          {item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-green-50 p-3 text-sm font-bold text-right flex justify-between items-center">
                    <span className="text-green-700">Total de productos:</span>
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full">
                      {viewDispatch.totalProductCount}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  {viewDispatch.status !== "En ruta" && viewDispatch.status !== "Entregado" && (
                    <Button
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
                      onClick={() => {
                        handleUpdateStatus(viewDispatch, "En ruta")
                        setIsViewModalOpen(false)
                      }}
                    >
                      <Truck className="h-4 w-4 mr-2" />
                      Marcar En Ruta
                    </Button>
                  )}
                  {viewDispatch.status !== "Cancelado" && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => {
                        handleUpdateStatus(viewDispatch, "Cancelado")
                        setIsViewModalOpen(false)
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Despacho
                    </Button>
                  )}
                  {viewDispatch.status !== "Entregado" && (
                    <Button
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm"
                      onClick={() => {
                        handleUpdateStatus(viewDispatch, "Entregado")
                        setIsViewModalOpen(false)
                      }}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar como Entregado
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
