"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Truck, Calendar, Clock, Phone, MapPin, Save, Package, User, Printer } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ThermalDispatchReceipt } from "@/components/thermal-dispatch-receipt"
import { useRouter } from "next/navigation"
import { ThermalPrinter } from "@/lib/thermal-printer"

interface DispatchFormModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
}

export function DispatchFormModal({ order, isOpen, onClose }: DispatchFormModalProps) {
  const { toast } = useToast()
  const router = useRouter()
  const receiptRef = useRef<HTMLDivElement>(null)
  const [showPrintPreview, setShowPrintPreview] = useState(false)
  const [dispatchInfo, setDispatchInfo] = useState({
    customerName: `Cliente de Pedido #${order?.id?.slice(0, 6) || ""}`,
    address: "",
    phone: "",
    deliveryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // Tomorrow
    creationTime: new Date().toISOString().slice(0, 16),
    notes: "",
  })

  // Set creation time when modal opens
  useEffect(() => {
    if (isOpen) {
      setDispatchInfo((prev) => ({
        ...prev,
        creationTime: new Date().toISOString().slice(0, 16),
        customerName: `Cliente de Pedido #${order?.id?.slice(0, 6) || ""}`,
      }))
    }
  }, [isOpen, order])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setDispatchInfo((prev) => ({ ...prev, [name]: value }))
  }

  // Calculate total number of products
  const totalProductCount = order?.items.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0

  const handleSave = () => {
    // In a real app, you would save this to a database
    // For this demo, we'll save to localStorage

    const existingDispatches = JSON.parse(localStorage.getItem("dispatches") || "{}")

    existingDispatches[order.id] = {
      ...dispatchInfo,
      orderId: order.id,
      items: order.items,
      totalProductCount,
      createdAt: new Date().toISOString(),
      status: "Pendiente",
    }

    localStorage.setItem("dispatches", JSON.stringify(existingDispatches))

    toast({
      title: "Despacho creado",
      description: "La información de despacho ha sido guardada correctamente.",
    })

    // Redirect to dispatches page
    onClose()
    router.push("/despachos")
  }

  // Modificar la función handlePrint
  const handlePrint = async () => {
    try {
      if (receiptRef.current) {
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

        // Escribir el contenido exacto a la nueva ventana
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
                ${receiptRef.current.outerHTML}
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

        const dispatchData = {
          orderId: order.id,
          customerName: dispatchInfo.customerName,
          address: dispatchInfo.address,
          phone: dispatchInfo.phone,
          deliveryDate: dispatchInfo.deliveryDate,
          creationTime: dispatchInfo.creationTime,
          notes: dispatchInfo.notes,
          items: order.items,
          totalProductCount,
        }

        // Imprimir usando la biblioteca de impresión térmica
        const success = await ThermalPrinter.printDispatch(dispatchData, { showDialog: true })

        if (success) {
          toast({
            title: "Impresión exitosa",
            description: "El despacho ha sido enviado a la impresora térmica.",
          })
        }
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

  const dispatchData = {
    orderId: order.id,
    customerName: dispatchInfo.customerName,
    address: dispatchInfo.address,
    phone: dispatchInfo.phone,
    deliveryDate: dispatchInfo.deliveryDate,
    creationTime: dispatchInfo.creationTime,
    notes: dispatchInfo.notes,
    items: order.items,
    totalProductCount,
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={showPrintPreview ? "max-w-md" : "max-w-4xl"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600">
            <Truck className="h-5 w-5" />
            {showPrintPreview
              ? "Vista Previa de Impresión"
              : "Formulario de Despacho - Pedido #" + order.id.slice(0, 8)}
          </DialogTitle>
        </DialogHeader>

        {showPrintPreview ? (
          <>
            <div className="border rounded p-2 overflow-auto max-h-[70vh]">
              <div className="print-content">
                <ThermalDispatchReceipt ref={receiptRef} dispatch={dispatchData} />
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowPrintPreview(false)}>
                Volver
              </Button>
              <Button onClick={handlePrint} className="bg-green-600 hover:bg-green-700">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Despacho
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column - Customer and Delivery Info */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm border-b pb-1">Información del Cliente y Entrega</h3>

                <div className="space-y-2">
                  <Label htmlFor="customerName" className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Nombre del Cliente
                  </Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={dispatchInfo.customerName}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> Dirección de Entrega
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Av. Principal 123, Ciudad"
                    value={dispatchInfo.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" /> Teléfono del Cliente
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+51 999 888 777"
                    value={dispatchInfo.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Fecha de Entrega
                  </Label>
                  <Input
                    id="deliveryDate"
                    name="deliveryDate"
                    type="date"
                    value={dispatchInfo.deliveryDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creationTime" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Hora de Creación del Despacho
                  </Label>
                  <Input
                    id="creationTime"
                    name="creationTime"
                    type="datetime-local"
                    value={dispatchInfo.creationTime}
                    onChange={handleChange}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="flex items-center gap-2">
                    Notas Adicionales
                  </Label>
                  <Input
                    id="notes"
                    name="notes"
                    placeholder="Instrucciones especiales para la entrega..."
                    value={dispatchInfo.notes}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Right column - Order Details */}
              <div>
                <h3 className="font-semibold text-sm border-b pb-1 mb-4">Detalle del Pedido</h3>

                <div className="border rounded-md overflow-hidden">
                  <div className="bg-gray-100 p-2 font-medium grid grid-cols-12 text-sm">
                    <div className="col-span-9">Producto</div>
                    <div className="col-span-3 text-center">Cantidad</div>
                  </div>
                  <div className="max-h-[40vh] overflow-y-auto">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="grid grid-cols-12 items-center p-2 border-t text-sm">
                        <div className="col-span-9 font-medium truncate flex items-center">
                          <Package className="h-3 w-3 mr-1 text-gray-400" />
                          {item.name}
                        </div>
                        <div className="col-span-3 text-center font-bold">{item.quantity}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 p-2 text-sm font-bold text-right">
                    Total de productos: {totalProductCount}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                  <h4 className="font-medium text-green-700 flex items-center gap-1 mb-2">
                    <Truck className="h-4 w-4" /> Información de Despacho
                  </h4>
                  <p className="text-green-600 mb-1">
                    • Este pedido será preparado para entrega según la información proporcionada.
                  </p>
                  <p className="text-green-600 mb-1">• Asegúrese de verificar la dirección y teléfono del cliente.</p>
                  <p className="text-green-600">
                    • El cliente recibirá una notificación cuando el pedido sea despachado.
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={() => setShowPrintPreview(true)} className="bg-blue-600 hover:bg-blue-700">
                <Printer className="h-4 w-4 mr-2" />
                Vista Previa
              </Button>
              <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Crear Despacho
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
