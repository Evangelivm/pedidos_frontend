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
  metodo_pago: string;
  punto_venta: string;
  created_at: string;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO" | "EN_RUTA" | "ENTREGADO";
  estado_pago: "PAGADO" | "PENDIENTE" | "CANCELADO";
  clientes: {
    nombre: string;
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

  useEffect(() => {
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

  // Contar filtros activos
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

  // Limpiar todos los filtros
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
          {/* <Button
            variant={activeFiltersCount > 0 ? "default" : "outline"}
            className={
              activeFiltersCount > 0
                ? "bg-blue-600 text-white"
                : "border-gray-300"
            }
            onClick={() => setShowFilters(!showFilters)}
          >
            {activeFiltersCount > 0 ? (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Filtros ({activeFiltersCount})
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </>
            )}
          </Button> */}
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6 animate-in fade-in-50 slide-in-from-top-5 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Filtros de búsqueda</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Limpiar filtros
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Estado del pedido */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <div className="bg-blue-100 p-1 rounded-full">
                    <Filter className="h-4 w-4 text-blue-600" />
                  </div>
                  Estado del pedido
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_proceso">En proceso</SelectItem>
                    <SelectItem value="completado">Completado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vendedor */}
              <div className="space-y-2">
                <Label htmlFor="seller" className="flex items-center gap-2">
                  <div className="bg-purple-100 p-1 rounded-full">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  Vendedor
                </Label>
                <Input
                  id="seller"
                  value={sellerFilter}
                  onChange={(e) => setSellerFilter(e.target.value)}
                  placeholder="Nombre del vendedor"
                />
              </div>

              {/* Método de pago */}
              <div className="space-y-2">
                <Label
                  htmlFor="paymentMethod"
                  className="flex items-center gap-2"
                >
                  <div className="bg-yellow-100 p-1 rounded-full">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                  </div>
                  Método de pago
                </Label>
                <Select
                  value={paymentMethodFilter}
                  onValueChange={setPaymentMethodFilter}
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Todos los métodos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="tarjeta">Tarjeta</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="yape">Yape</SelectItem>
                    <SelectItem value="plin">Plin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Rango de monto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <div className="bg-red-100 p-1 rounded-full">
                    <DollarSign className="h-4 w-4 text-red-600" />
                  </div>
                  Rango de monto
                </Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="Mínimo"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      type="number"
                      value={maxAmount}
                      onChange={(e) => setMaxAmount(e.target.value)}
                      placeholder="Máximo"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
              <Button
                onClick={() => {
                  toast({
                    title: "Filtros aplicados",
                    description: `Se han aplicado ${activeFiltersCount} filtros a la búsqueda.`,
                  });
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Aplicar filtros
              </Button>
            </div>
          </div>
        )}

        <div className="mt-4 overflow-auto flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          <OrdersTable orders={filteredOrders} />
        </div>
      </div>
    </main>
  );
}
