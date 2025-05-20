"use client";
import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  DollarSign,
  Smartphone,
  CheckCircle,
  User,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Importamos Cliente y connections
import connections, { Cliente } from "@/data/connections";

interface PaymentModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

export function PaymentModal({
  order,
  isOpen,
  onClose,
  onPaymentComplete,
}: PaymentModalProps) {
  const { toast } = useToast();

  const [paymentInfo, setPaymentInfo] = useState({
    cash: "0.00",
    yape: "0.00",
    transfer: "0.00",
    customerName: `Cliente de Ped. ${order?.numero || ""}`,
    customerPhone: "",
    clientId: "",
  });

  const [totalPaid, setTotalPaid] = useState(0);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [clients, setClients] = useState<Cliente[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  // Cargar clientes desde la API
  useEffect(() => {
    if (isOpen) {
      setCurrentDateTime(new Date());
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const response = await connections.clientes.getAll({
        page: 1,
        limit: 100,
        orderBy: "nombre",
        orderDirection: "asc",
      });

      if (response.data && Array.isArray(response.data.items)) {
        setClients(response.data.items);
      } else {
        setClients([]);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      });
    } finally {
      setLoadingClients(false);
    }
  };

  // Calcular total pagado
  useEffect(() => {
    const cash = Number.parseFloat(paymentInfo.cash) || 0;
    const yape = Number.parseFloat(paymentInfo.yape) || 0;
    const transfer = Number.parseFloat(paymentInfo.transfer) || 0;
    setTotalPaid(cash + yape + transfer);
  }, [paymentInfo.cash, paymentInfo.yape, paymentInfo.transfer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validar campos numéricos
    if (name === "cash" || name === "yape" || name === "transfer") {
      if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
        setPaymentInfo((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setPaymentInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Manejar selección de cliente
  const handleClientSelect = (clientId: string) => {
    const selectedClient = clients.find(
      (client) => client.id.toString() === clientId
    );

    if (selectedClient) {
      setPaymentInfo((prev) => ({
        ...prev,
        clientId: clientId,
        customerName: selectedClient.nombre,
        customerPhone: selectedClient.telefono || "",
      }));
    }
  };

  // Agrupar clientes por tipo
  const clientsWithRUC = clients.filter(
    (client) =>
      client.tipo_documento === "RUC" && client.numero_documento.trim() !== ""
  );
  const clientsWithoutRUC = clients.filter(
    (client) =>
      !["RUC", "Pasaporte", "CE"].includes(client.tipo_documento) ||
      !client.numero_documento.trim()
  );

  const handleCompletePayment = () => {
    if (totalPaid < order.total) {
      toast({
        title: "Error en el pago",
        description:
          "El monto total pagado debe ser igual o mayor al total del pedido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const updatedOrders = storedOrders.map((o: any) => {
        if (o.id === order.id) {
          return {
            ...o,
            paymentStatus: "Pagado",
            paymentDetails: {
              date: currentDateTime.toISOString(),
              cash: Number.parseFloat(paymentInfo.cash) || 0,
              yape: Number.parseFloat(paymentInfo.yape) || 0,
              transfer: Number.parseFloat(paymentInfo.transfer) || 0,
              totalPaid: totalPaid,
              customerName: paymentInfo.customerName,
              customerPhone: paymentInfo.customerPhone,
              clientId: paymentInfo.clientId,
            },
          };
        }
        return o;
      });

      localStorage.setItem("orders", JSON.stringify(updatedOrders));
      toast({
        title: "Pago completado",
        description: `El pago del pedido #${order.id} ha sido registrado correctamente.`,
      });

      onPaymentComplete();
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar el pago.",
        variant: "destructive",
      });
    }
  };

  // Formatear fecha y hora
  const formattedDate = currentDateTime.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const formattedTime = currentDateTime.toLocaleTimeString();

  // Calcular vuelto
  const change = Math.max(0, totalPaid - order.total);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-2">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <CreditCard className="h-5 w-5 text-green-600" />
            Pago - {order?.numero}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="bg-gray-50 p-2 rounded-md text-sm grid grid-cols-1 gap-1">
            <div className="flex justify-between">
              <span className="font-bold">Fecha:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Hora:</span>
              <span>{formattedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold">Total:</span>
              <span className="font-bold text-blue-700">S/.{order?.total}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="clientSelect" className="text-sm mb-1 block">
                Cliente
              </Label>
              <Select
                value={paymentInfo.clientId}
                onValueChange={handleClientSelect}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {loadingClients ? (
                    <div className="py-2 text-center text-sm text-gray-500">
                      Cargando clientes...
                    </div>
                  ) : clients.length === 0 ? (
                    <div className="py-2 text-center text-sm text-gray-500">
                      No hay clientes disponibles
                    </div>
                  ) : (
                    <>
                      {/* Grupo de Empresas (con RUC) */}
                      {clientsWithRUC.length > 0 && (
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-1 text-xs">
                            <CreditCard className="h-3 w-3" /> Empresas
                          </SelectLabel>
                          {clientsWithRUC.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                              className="py-1.5 pl-6 pr-2 text-sm"
                            >
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {client.nombre}
                                </span>
                                <span className="text-xs text-blue-600">
                                  RUC: {client.numero_documento}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}

                      {/* Grupo de Personas (sin RUC) */}
                      {clientsWithoutRUC.length > 0 && (
                        <SelectGroup>
                          {/* <SelectLabel className="flex items-center gap-1 text-xs">
                            <User className="h-3 w-3" /> Personas
                          </SelectLabel> */}
                          {clientsWithoutRUC.map((client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                              className="py-1.5 pl-6 pr-2 text-sm"
                            >
                              <span className="font-medium">
                                {client.nombre}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      )}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="customerName" className="text-sm mb-1 block">
                  Nombre
                </Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={paymentInfo.customerName}
                  onChange={handleChange}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone" className="text-sm mb-1 block">
                  Teléfono
                </Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  placeholder="999 888 777"
                  value={paymentInfo.customerPhone}
                  onChange={handleChange}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-2 mt-2">
            <h3 className="font-medium text-sm mb-2">Métodos de Pago</h3>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <Label
                  htmlFor="cash"
                  className="flex items-center gap-1 text-sm mb-1"
                >
                  <DollarSign className="h-3.5 w-3.5 text-green-600" /> Efectivo
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    S/.
                  </span>
                  <Input
                    id="cash"
                    name="cash"
                    className="pl-8 h-9 text-sm"
                    value={paymentInfo.cash}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="yape"
                  className="flex items-center gap-1 text-sm mb-1"
                >
                  <Smartphone className="h-3.5 w-3.5 text-purple-600" /> Yape
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    S/.
                  </span>
                  <Input
                    id="yape"
                    name="yape"
                    className="pl-8 h-9 text-sm"
                    value={paymentInfo.yape}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="transfer"
                  className="flex items-center gap-1 text-sm mb-1"
                >
                  <CreditCard className="h-3.5 w-3.5 text-blue-600" />{" "}
                  Transferencia
                </Label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    S/.
                  </span>
                  <Input
                    id="transfer"
                    name="transfer"
                    className="pl-8 h-9 text-sm"
                    value={paymentInfo.transfer}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-2 rounded-md space-y-1 mt-2">
            <div className="flex justify-between text-base font-bold">
              <span>Total Pagado:</span>
              <span
                className={
                  totalPaid >= order?.total ? "text-green-600" : "text-red-600"
                }
              >
                S/.{totalPaid.toFixed(2)}
              </span>
            </div>
            {totalPaid > order?.total && (
              <div className="flex justify-between text-xs">
                <span>Vuelto:</span>
                <span className="text-orange-600 font-medium">
                  S/.{change.toFixed(2)}
                </span>
              </div>
            )}
            {totalPaid < order?.total && (
              <div className="text-red-500 text-xs">
                Falta S/.{(order?.total - totalPaid).toFixed(2)}
              </div>
            )}
            {totalPaid === order?.total && (
              <div className="text-green-600 text-xs font-medium">
                ¡Monto exacto!
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white pt-2 z-10">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancelar
          </Button>
          <Button
            onClick={handleCompletePayment}
            className={`${
              totalPaid >= order?.total
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            disabled={totalPaid < order?.total}
            size="sm"
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Registrar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
