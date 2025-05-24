"use client";
import OrdersTable from "@/components/orders-table";
import { SearchBar } from "@/components/search-bar";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Download,
  Filter,
  X,
  Calendar,
  CreditCard,
  User,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import { exportOrdersToExcel } from "@/lib/export-utils";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import connections from "@/data/connections";

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
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "EN_RUTA" | "ENTREGADO";
  estado_pago: "PAGADO" | "PENDIENTE" | "CANCELADO";
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

export default function OrdersPage() {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  // Estados para los filtros
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [sellerFilter, setSellerFilter] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  const fetchOrders = async () => {
    try {
      const data = await connections.pedidos.getAll({
        page: 1,
        limit: 100,
      });
      const response = data.data.items;

      if (response && Array.isArray(response)) {
        setOrders(response);
        setFilteredOrders(response);
      } else if (response?.data && Array.isArray(response.data)) {
        setOrders(response.data);
        setFilteredOrders(response.data);
      } else {
        toast({
          title: "Error",
          description: "Formato de datos inesperado al cargar pedidos",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de pedidos",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [toast]);

  const handleExportToExcel = () => {
    try {
      if (!filteredOrders.length) {
        toast({
          title: "Sin datos para exportar",
          description: "No hay pedidos disponibles para exportar.",
          variant: "destructive",
        });
        return;
      }
      exportOrdersToExcel(filteredOrders);
      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${filteredOrders.length} pedidos a Excel.`,
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los pedidos. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleSearch = (term: string) => {
    if (!term.trim()) {
      setFilteredOrders(orders);
      return;
    }
    const lowerTerm = term.toLowerCase();
    const filtered = orders.filter((order) => {
      const numero = order.numero?.toString().toLowerCase() || "";
      const clienteNombre =
        order.clientes?.nombre?.toString().toLowerCase() || "";
      const metodoPago = order.metodo_pago?.toString().toLowerCase() || "";
      const estadoPedido = order.estado?.toString().toLowerCase() || "";
      const estadoPago = order.estado_pago?.toString().toLowerCase() || "";
      return (
        numero.includes(lowerTerm) ||
        clienteNombre.includes(lowerTerm) ||
        metodoPago.includes(lowerTerm) ||
        estadoPedido.includes(lowerTerm) ||
        estadoPago.includes(lowerTerm)
      );
    });
    setFilteredOrders(filtered);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (statusFilter) count++;
    if (startDate) count++;
    if (endDate) count++;
    if (sellerFilter) count++;
    if (paymentMethodFilter) count++;
    if (minAmount) count++;
    if (maxAmount) count++;
    return count;
  };

  const clearAllFilters = () => {
    setStatusFilter("");
    setStartDate(undefined);
    setEndDate(undefined);
    setSellerFilter("");
    setPaymentMethodFilter("");
    setMinAmount("");
    setMaxAmount("");
  };

  const activeFiltersCount = getActiveFiltersCount();

  const refreshOrders = async () => {
    await fetchOrders();
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="p-4 md:p-6 flex-1 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">
              Gestión de Pedidos
            </h1>
            <p className="text-gray-500 text-sm">
              Administre todos sus pedidos desde un solo lugar
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/agregar">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Pedido
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handleExportToExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <SearchBar
            placeholder="Buscar por cliente, vendedor o estado..."
            onSearch={handleSearch}
          />
        </div>

        <div className="mt-4 overflow-auto flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <OrdersTable orders={filteredOrders} onRefresh={refreshOrders} />
        </div>
      </div>
    </main>
  );
}
