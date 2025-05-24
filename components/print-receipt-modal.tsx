"use client";
import { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThermalReceipt } from "@/components/thermal-receipt";
import { Printer, Check, Truck, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { formatCurrency } from "@/lib/utils";
import { DeliveryInfoModal } from "@/components/delivery-info-modal";
import {
  ThermalPrinter,
  detectPrinters,
  getDefaultPrinter,
  setDefaultPrinter,
} from "@/lib/thermal-printer";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PrintReceiptModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export function PrintReceiptModal({
  order,
  isOpen,
  onClose,
}: PrintReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Adaptar la estructura de detalle_pedidos a items, forzando la conversión de valores numéricos
  const orderItems =
    order?.detalle_pedidos?.map((item: any) => ({
      id: item.id,
      name:
        item.descripcion ||
        item.productos?.descripcion ||
        "Producto sin nombre",
      price: Number(item.subtotal) || 0,
      quantity: Number(item.cantidad) || 1,
      unit: item.productos?.presentaciones.nombre,
    })) || [];

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [printers, setPrinters] = useState<string[]>([]);
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [showPrinterSettings, setShowPrinterSettings] = useState(false);

  // Inicializar los items seleccionados cuando cambia la orden
  useEffect(() => {
    if (orderItems && orderItems.length > 0) {
      setSelectedItems(orderItems.map((item: any) => item.id));
    }
  }, [order]);

  // Cargar impresoras disponibles
  const loadPrinters = async () => {
    try {
      const availablePrinters = await detectPrinters();
      setPrinters(availablePrinters);
      // Establecer la impresora predeterminada si existe
      const defaultPrinter = getDefaultPrinter();
      if (defaultPrinter && availablePrinters.includes(defaultPrinter)) {
        setSelectedPrinter(defaultPrinter);
      } else if (availablePrinters.length > 0) {
        setSelectedPrinter(availablePrinters[0]);
      }
    } catch (error) {
      console.error("Error al detectar impresoras:", error);
      toast({
        title: "Error",
        description: "No se pudieron detectar las impresoras disponibles",
        variant: "destructive",
      });
    }
  };

  // Calculate total sin impuestos
  const calculateTotal = (items: any[]) => {
    return items.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
  };

  // Filtrar order items basado en los seleccionados
  const filteredOrder = {
    ...order,
    items: orderItems.filter((item: any) => selectedItems.includes(item.id)),
    total: calculateTotal(
      orderItems.filter((item: any) => selectedItems.includes(item.id))
    ),
    paymentMethod: order.metodo_pago || "DATOS", // Valor por defecto
    clientName: order.clientes?.nombre || "Consumidor final", // Valor por defecto
  };

  // Manejar la impresión térmica
  const handlePrint = async () => {
    try {
      if (receiptRef.current) {
        // Crear un iframe para impresión controlada que preserve el formato
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) {
          toast({
            title: "Error de impresión",
            description:
              "No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.",
            variant: "destructive",
          });
          return;
        }
        // Escribir el contenido exacto a la nueva ventana
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Impresión de Recibo</title>
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
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 500);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();

        // Intentar imprimir usando la biblioteca de impresión térmica
        const success = await ThermalPrinter.printReceipt(filteredOrder, {
          showDialog: true,
        });
        if (success) {
          toast({
            title: "Impresión exitosa",
            description: "El recibo ha sido enviado a la impresora térmica.",
          });
          setHasPrinted(true);
        }
      }
    } catch (error) {
      console.error("Error al imprimir:", error);
      toast({
        title: "Error de impresión",
        description: "Ocurrió un error al intentar imprimir el recibo.",
        variant: "destructive",
      });
    }
  };

  // Establecer impresora predeterminada
  const handleSetDefaultPrinter = () => {
    if (selectedPrinter) {
      setDefaultPrinter(selectedPrinter);
      toast({
        title: "Impresora predeterminada",
        description: `Se ha establecido "${selectedPrinter}" como impresora predeterminada.`,
      });
    }
  };

  const toggleSelectItem = (itemId: number) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === orderItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(orderItems.map((item: any) => item.id));
    }
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={showPreview ? "max-w-md" : "max-w-3xl"}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <Printer className="h-5 w-5 text-blue-600" />
              {showPreview
                ? "Vista previa de impresión"
                : "Seleccionar productos para imprimir"}
              {!showPreview && (
                <Button
                  variant="outline"
                  size="icon"
                  className="ml-auto h-8 w-8"
                  onClick={() => {
                    setShowPrinterSettings(!showPrinterSettings);
                    if (!showPrinterSettings) {
                      loadPrinters();
                    }
                  }}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {showPrinterSettings && !showPreview ? (
            <div className="space-y-4 py-2">
              <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mb-4">
                <p className="font-medium mb-1">
                  Configuración de impresora térmica
                </p>
                <p>
                  Seleccione la impresora térmica que desea utilizar para
                  imprimir recibos.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Impresora térmica</label>
                <Select
                  value={selectedPrinter}
                  onValueChange={setSelectedPrinter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar impresora" />
                  </SelectTrigger>
                  <SelectContent>
                    {printers.length > 0 ? (
                      printers.map((printer) => (
                        <SelectItem key={printer} value={printer}>
                          {printer}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-printers" disabled>
                        No se detectaron impresoras
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadPrinters()}
                >
                  Actualizar lista
                </Button>
                <Button
                  size="sm"
                  onClick={handleSetDefaultPrinter}
                  disabled={!selectedPrinter}
                >
                  Establecer como predeterminada
                </Button>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={() => setShowPrinterSettings(false)}>
                  Continuar
                </Button>
              </div>
            </div>
          ) : !showPreview ? (
            <>
              <div className="mb-2 flex items-center">
                <Checkbox
                  id="select-all"
                  checked={
                    selectedItems.length === orderItems.length &&
                    orderItems.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="ml-2 text-sm font-medium"
                >
                  Seleccionar todos los productos
                </label>
              </div>
              <div className="border rounded-md overflow-hidden shadow-sm">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 font-medium grid grid-cols-10 text-sm text-white">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Producto</div>
                  <div className="col-span-2 text-center">Cantidad</div>
                  <div className="col-span-2 text-right">Precio</div>
                </div>
                <div className="max-h-[40vh] overflow-y-auto">
                  {orderItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-10 items-center p-2 border-t text-sm hover:bg-blue-50 transition-colors"
                    >
                      <div className="col-span-1">
                        <Checkbox
                          checked={selectedItems.includes(item.id)}
                          onCheckedChange={() => toggleSelectItem(item.id)}
                        />
                      </div>
                      <div className="col-span-5 font-medium truncate">
                        {item.name}
                      </div>
                      <div className="col-span-2 text-center">
                        {item.quantity}
                      </div>
                      <div className="col-span-2 text-right">
                        {formatCurrency(item.price)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div>
                  <p className="text-sm text-gray-500">
                    {selectedItems.length} de {orderItems.length} productos
                    seleccionados
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">
                    Total:{" "}
                    {formatCurrency(
                      calculateTotal(
                        orderItems.filter((item: any) =>
                          selectedItems.includes(item.id)
                        )
                      )
                    )}
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => setShowPreview(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={selectedItems.length === 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Ver vista previa
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="border rounded p-2 overflow-auto max-h-[70vh]">
                <div className="print-content flex justify-center">
                  <div className="mx-auto">
                    <ThermalReceipt ref={receiptRef} order={filteredOrder} />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Volver
                </Button>
                {hasPrinted ? (
                  <Button
                    onClick={() => setShowDeliveryModal(true)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Truck className="h-4 w-4 mr-2" />
                    Información de Entrega
                  </Button>
                ) : (
                  <Button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DeliveryInfoModal
        orderId={String(order.numero || "")}
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
      />
    </>
  );
}
