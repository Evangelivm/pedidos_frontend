"use client"

import { useState } from "react"
import { CreditCard, Eye, Printer, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"

interface PaymentsTableProps {
  payments: any[]
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const { toast } = useToast()
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [viewPayment, setViewPayment] = useState<any | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const toggleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(payments.map((payment) => payment.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter((paymentId) => paymentId !== id))
    } else {
      setSelectedPayments([...selectedPayments, id])
    }
  }

  const handleViewPayment = (payment: any) => {
    setViewPayment(payment)
    setIsViewModalOpen(true)
  }

  const handlePrintPayment = (payment: any) => {
    try {
      // Crear una ventana de impresión
      const printWindow = window.open("", "_blank", "width=800,height=600")

      if (!printWindow) {
        toast({
          title: "Error de impresión",
          description: "No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.",
          variant: "destructive",
        })
        return
      }

      // Formatear fecha y hora
      const paymentDate = new Date(payment.date)
      const formattedDate = paymentDate.toLocaleDateString()
      const formattedTime = paymentDate.toLocaleTimeString()

      // Escribir el contenido a la nueva ventana
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Comprobante de Pago</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 14px;
              }
              .receipt {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .subtitle {
                font-size: 16px;
                color: #555;
              }
              .info-row {
                display: flex;
                margin-bottom: 10px;
              }
              .info-label {
                font-weight: bold;
                width: 150px;
              }
              .info-value {
                flex: 1;
              }
              .payment-methods {
                margin: 20px 0;
                border: 1px solid #eee;
                padding: 10px;
                background-color: #f9f9f9;
              }
              .payment-row {
                display: flex;
                margin-bottom: 5px;
              }
              .payment-label {
                width: 150px;
              }
              .payment-value {
                flex: 1;
                text-align: right;
                font-weight: bold;
              }
              .total {
                font-size: 18px;
                font-weight: bold;
                text-align: right;
                margin-top: 20px;
                border-top: 1px solid #ddd;
                padding-top: 10px;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
              }
              @media print {
                body {
                  padding: 0;
                }
                .receipt {
                  border: none;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="receipt">
              <div class="header">
                <div class="title">COMPROBANTE DE PAGO</div>
                <div class="subtitle">TIENDA ACME</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Pedido:</div>
                <div class="info-value">#${payment.orderId.slice(0, 8)}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Fecha:</div>
                <div class="info-value">${formattedDate}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Hora:</div>
                <div class="info-value">${formattedTime}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Cliente:</div>
                <div class="info-value">${payment.customerName}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Teléfono:</div>
                <div class="info-value">${payment.customerPhone || "No especificado"}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Total del pedido:</div>
                <div class="info-value">${formatCurrency(payment.total)}</div>
              </div>
              
              <div class="payment-methods">
                <h3>Métodos de Pago</h3>
                
                <div class="payment-row">
                  <div class="payment-label">Efectivo:</div>
                  <div class="payment-value">${formatCurrency(payment.cash)}</div>
                </div>
                
                <div class="payment-row">
                  <div class="payment-label">Yape:</div>
                  <div class="payment-value">${formatCurrency(payment.yape)}</div>
                </div>
                
                <div class="payment-row">
                  <div class="payment-label">Transferencia:</div>
                  <div class="payment-value">${formatCurrency(payment.transfer)}</div>
                </div>
              </div>
              
              <div class="total">
                Total Pagado: ${formatCurrency(payment.totalPaid)}
              </div>
              
              <div class="footer">
                Este documento no es un comprobante fiscal.
                <br>
                TIENDA ACME - Av. Principal 123, Ciudad - Tel: 123-456789
              </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print();" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Imprimir Comprobante
              </button>
            </div>
            
            <script>
              // Imprimir automáticamente
              window.onload = function() {
                // Esperar un momento para que se cargue todo
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `)

      printWindow.document.close()
    } catch (error) {
      console.error("Error al imprimir:", error)
      toast({
        title: "Error de impresión",
        description: "Ocurrió un error al intentar imprimir el comprobante.",
        variant: "destructive",
      })
    }
  }

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Format time string
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString()
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pagado":
        return <Badge className="bg-green-500">Pagado</Badge>
      case "Pendiente":
        return <Badge className="bg-yellow-500">Pendiente</Badge>
      case "Cancelado":
        return <Badge className="bg-red-500">Cancelado</Badge>
      default:
        return <Badge className="bg-blue-500">Procesando</Badge>
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm" style={{ maxWidth: "100%" }}>
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-green-600 to-green-700 text-white font-medium text-sm">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedPayments.length === payments.length && payments.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3 min-w-[100px] whitespace-nowrap">Fecha</th>
              <th className="p-3 min-w-[100px] whitespace-nowrap">Hora</th>
              <th className="p-3 min-w-[180px] whitespace-nowrap">Cliente</th>
              <th className="p-3 min-w-[120px] whitespace-nowrap">Teléfono</th>
              <th className="p-3 min-w-[120px] whitespace-nowrap">Total Pedido</th>
              <th className="p-3 min-w-[100px] whitespace-nowrap">Efectivo</th>
              <th className="p-3 min-w-[100px] whitespace-nowrap">Yape</th>
              <th className="p-3 min-w-[120px] whitespace-nowrap">Transferencia</th>
              <th className="p-3 min-w-[120px] whitespace-nowrap">Total Pagado</th>
              <th className="p-3 min-w-[100px] whitespace-nowrap">Estado</th>
              <th className="p-3 min-w-[120px] whitespace-nowrap">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={13} className="p-6 text-center text-gray-500 bg-white">
                  <div className="flex flex-col items-center justify-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No hay pagos disponibles</p>
                    <p className="text-sm text-gray-400 mt-1">Los pagos registrados aparecerán aquí</p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr
                  key={payment.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-green-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedPayments.includes(payment.id)}
                      onCheckedChange={() => toggleSelect(payment.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3">{formatDate(payment.date)}</td>
                  <td className="p-3 min-w-[100px] whitespace-nowrap">{formatTime(payment.date)}</td>
                  <td className="p-3 font-medium min-w-[180px] whitespace-nowrap">{payment.customerName}</td>
                  <td className="p-3 min-w-[120px] whitespace-nowrap">{payment.customerPhone || "-"}</td>
                  <td className="p-3 font-medium min-w-[120px] whitespace-nowrap">{formatCurrency(payment.total)}</td>
                  <td className="p-3 min-w-[100px] whitespace-nowrap">{formatCurrency(payment.cash)}</td>
                  <td className="p-3 min-w-[100px] whitespace-nowrap">{formatCurrency(payment.yape)}</td>
                  <td className="p-3 min-w-[120px] whitespace-nowrap">{formatCurrency(payment.transfer)}</td>
                  <td className="p-3 font-bold text-green-600 min-w-[120px] whitespace-nowrap">
                    {formatCurrency(payment.totalPaid)}
                  </td>
                  <td className="p-3 min-w-[100px] whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handleViewPayment(payment)}
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-success"
                        onClick={() => handlePrintPayment(payment)}
                        title="Imprimir comprobante"
                      >
                        <Printer className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles de pago */}
      {viewPayment && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Receipt className="h-5 w-5 text-green-600" />
                Detalles del Pago
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Información del Pago</h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Fecha:</div>
                  <div>{formatDate(viewPayment.date)}</div>

                  <div className="font-medium">Hora:</div>
                  <div>{formatTime(viewPayment.date)}</div>

                  <div className="font-medium">Pedido:</div>
                  <div>#{viewPayment.orderId.slice(0, 8)}</div>

                  <div className="font-medium">Total del pedido:</div>
                  <div className="font-bold">{formatCurrency(viewPayment.total)}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Cliente</h3>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Nombre:</div>
                  <div>{viewPayment.customerName}</div>

                  <div className="font-medium">Teléfono:</div>
                  <div>{viewPayment.customerPhone || "No especificado"}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2 text-green-700">Métodos de Pago</h3>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Efectivo:</span>
                    <span>{formatCurrency(viewPayment.cash)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Yape:</span>
                    <span>{formatCurrency(viewPayment.yape)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="font-medium">Transferencia:</span>
                    <span>{formatCurrency(viewPayment.transfer)}</span>
                  </div>

                  <div className="flex justify-between pt-2 border-t mt-2">
                    <span className="font-bold">Total Pagado:</span>
                    <span className="font-bold text-green-600">{formatCurrency(viewPayment.totalPaid)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Cerrar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handlePrintPayment(viewPayment)
                    setIsViewModalOpen(false)
                  }}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Comprobante
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
