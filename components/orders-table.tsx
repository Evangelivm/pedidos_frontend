"use client";
import { useState } from "react";
import {
  Pencil,
  Trash2,
  Printer,
  Truck,
  CreditCard,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { PrintReceiptModal } from "@/components/print-receipt-modal";
import { DispatchFormModal } from "@/components/dispatch-form-modal";
import { PaymentModal } from "@/components/payment-modal";
import { Badge } from "@/components/ui/badge";
import { connections } from "@/data/connections";

// Interfaz actualizada con "PAGADO" incluido en 'estado'
type Order = {
  id: number;
  numero: string;
  detalle_pedidos: Array<{
    id: number;
    descripcion: string;
    precio_sugerido: number;
    precio_minimo: number;
    imagen: string | null;
    cantidad: number;
    productos: {
      id: number;
      codigo: string;
      descripcion: string;
      imagen: string | null;
      presentaciones: {
        id: number;
        nombre: string;
      };
    };
  }>;
  total: number;
  subtotal: number;
  metodo_pago: string;
  punto_venta: string;
  created_at: string;
  estado:
    | "PENDIENTE"
    | "COMPLETADO"
    | "CANCELADO"
    | "EN_RUTA"
    | "ENTREGADO"
    | "PAGADO";
  clientes: {
    nombre: string;
  };
  vendedores: {
    nombre: string;
  };
  pagos: {
    id: number;
    pedido_id: number;
    monto: string;
    metodo_pago: string;
  };
};

export default function OrdersTable({
  orders,
  onRefresh,
}: {
  orders: Order[];
  onRefresh?: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [printOrder, setPrintOrder] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((order) => order.numero));
    }
  };

  const toggleSelect = (numero: string) => {
    if (selectedOrders.includes(numero)) {
      setSelectedOrders(
        selectedOrders.filter((orderNumero) => orderNumero !== numero)
      );
    } else {
      setSelectedOrders([...selectedOrders, numero]);
    }
  };

  const handleEditOrder = (numero: string) => {
    router.push(`/agregar?id=${numero}`);
  };

  const handleDeleteOrder = async (numero: string) => {
    try {
      const orderToDelete = orders.find((order) => order.numero === numero);
      if (!orderToDelete) throw new Error("Pedido no encontrado");
      await connections.pedidos.delete(orderToDelete.id);
      const updatedOrders = orders.filter((order) => order.numero !== numero);
      setSelectedOrders(selectedOrders.filter((num) => num !== numero));
      toast({
        title: "Pedido eliminado",
        description: `El pedido #${numero} ha sido eliminado correctamente.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el pedido #${numero}`,
        variant: "destructive",
      });
    }
  };

  const handlePrintOrder = (order: Order) => {
    setPrintOrder(order);
    setIsPrintModalOpen(true);
  };

  const handleDispatchOrder = (order: Order) => {
    setDispatchOrder(order);
    setIsDispatchModalOpen(true);
  };

  const handlePaymentOrder = (order: Order) => {
    setPaymentOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async () => {
    try {
      if (onRefresh) onRefresh();
      toast({
        title: "Pago actualizado",
        description: "El estado del pago ha sido actualizado.",
      });
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getCustomerName = (order: Order) => {
    return order.clientes?.nombre || `Cliente de Pedido #${order.numero}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ENTREGADO":
        return <Badge className="bg-green-500">Entregado</Badge>;
      case "EN_RUTA":
        return <Badge className="bg-blue-500">En ruta</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      case "COMPLETADO":
        return <Badge className="bg-purple-500">Completado</Badge>;
      default:
        return <Badge className="bg-orange-500">Pendiente</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAGADO":
        return <Badge className="bg-green-500">Pagado</Badge>;
      case "PENDIENTE":
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case "CANCELADO":
        return <Badge className="bg-red-500">Cancelado</Badge>;
      default:
        return <Badge className="bg-blue-500">Creado</Badge>;
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="table-header-warning">
              <th className="p-3 w-10">
                <Checkbox
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">Código</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Vendedor</th>
              <th className="p-3">Monto</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Estado de Pago</th>
              <th className="p-3">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="p-6 text-center text-gray-500 bg-white"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">
                      No hay pedidos disponibles
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Haga clic en "Agregar" para crear un nuevo pedido
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              orders.map((order, index) => (
                <tr
                  key={order.numero}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedOrders.includes(order.numero)}
                      onCheckedChange={() => toggleSelect(order.numero)}
                    />
                  </td>
                  <td className="p-3 font-medium">{order.numero}</td>
                  <td className="p-3 font-medium">{getCustomerName(order)}</td>
                  <td className="p-3">{order.vendedores.nombre}</td>
                  <td className="p-3">
                    {order.subtotal
                      ? `S/. ${Number(order.subtotal).toFixed(2)}`
                      : "-"}
                  </td>
                  <td className="p-3">{formatDate(order.created_at)}</td>
                  <td className="p-3">{getPaymentStatusBadge(order.estado)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-success"
                        onClick={() => handleEditOrder(order.numero)}
                        title="Editar Pedido"
                      >
                        <Pencil className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-danger"
                        onClick={() => handleDeleteOrder(order.numero)}
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
                      {/* <Button
                        size="icon"
                        variant="ghost"
                        className={`${
                          order.estado === "PAGADO"
                            ? "btn-icon-success"
                            : "btn-icon-success opacity-50"
                        }`}
                        onClick={() => handleDispatchOrder(order)}
                        disabled={order.estado !== "PAGADO"}
                        title={
                          order.estado === "PAGADO"
                            ? "Gestionar Despacho"
                            : "Debe completar el pago antes de despachar"
                        }
                      >
                        <Truck className="h-5 w-5" />
                      </Button> */}

                      {order.estado !== "PAGADO" && (
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

                      {order.estado === "PAGADO" && (
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
            setIsPrintModalOpen(false);
            setPrintOrder(null);
          }}
        />
      )}

      {dispatchOrder && (
        <DispatchFormModal
          order={dispatchOrder}
          isOpen={isDispatchModalOpen}
          onClose={() => {
            setIsDispatchModalOpen(false);
            setDispatchOrder(null);
          }}
        />
      )}

      {paymentOrder && (
        <PaymentModal
          order={paymentOrder}
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPaymentOrder(null);
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}
