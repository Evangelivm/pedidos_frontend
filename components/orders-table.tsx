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
  metodo_pago: string;
  punto_venta: string;
  created_at: string;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "EN_RUTA" | "ENTREGADO";
  estado_pago: "PAGADO" | "PENDIENTE" | "CANCELADO";
  clientes: {
    nombre: string;
  };
};

export default function OrdersTable({ orders }: { orders: Order[] }) {
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
      // Buscar el pedido por número para obtener su id
      const orderToDelete = orders.find((order) => order.numero === numero);
      if (!orderToDelete) {
        throw new Error("Pedido no encontrado");
      }

      // Llamar al endpoint de eliminación usando el ID del pedido
      await connections.pedidos.delete(orderToDelete.id);

      // Actualizar la lista local de pedidos
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
      const response = await connections.pedidos.getAll({
        page: 1,
        limit: 100,
      });

      // No es necesario actualizar aquí porque `orders` viene desde afuera
      toast({
        title: "Pago actualizado",
        description: "El estado del pago ha sido actualizado.",
      });
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get customer name
  const getCustomerName = (order: Order) => {
    return order.clientes?.nombre || `Cliente de Pedido #${order.numero}`;
  };

  // Get seller name from point of sale
  const getSellerName = (punto_venta: string) => {
    switch (punto_venta) {
      case "tienda1":
        return "[42845079] Punto de Venta - Tienda 1";
      case "tienda2":
        return "[74563065] Punto de Venta - Tienda 2";
      case "tienda3":
        return "[45875037] Punto de Venta - Tienda 3";
      default:
        return punto_venta;
    }
  };

  // Get payment method display name
  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "efectivo":
        return "Contra Entrega Efectivo";
      case "tarjeta":
        return "Tarjeta de Crédito";
      case "transferencia":
        return "Transferencia Bancaria";
      default:
        return method;
    }
  };

  // Get status badge
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

  // Get payment status badge
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
                  <td className="p-3">{getSellerName(order.punto_venta)}</td>
                  <td className="p-3">{getPaymentMethod(order.metodo_pago)}</td>
                  <td className="p-3">{formatDate(order.created_at)}</td>
                  <td className="p-3">{getStatusBadge(order.estado)}</td>
                  <td className="p-3">
                    {getPaymentStatusBadge(order.estado_pago)}
                  </td>
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
                      <Button
                        size="icon"
                        variant="ghost"
                        className={`${
                          order.estado_pago === "PAGADO"
                            ? "btn-icon-success"
                            : "btn-icon-success opacity-50"
                        }`}
                        onClick={() => handleDispatchOrder(order)}
                        disabled={order.estado_pago !== "PAGADO"}
                        title={
                          order.estado_pago === "PAGADO"
                            ? "Gestionar Despacho"
                            : "Debe completar el pago antes de despachar"
                        }
                      >
                        <Truck className="h-5 w-5" />
                      </Button>
                      {order.estado_pago !== "PAGADO" && (
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
                      {order.estado_pago === "PAGADO" && (
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
