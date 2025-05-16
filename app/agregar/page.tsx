"use client";

import { ShoppingCartOrderForm } from "@/components/shopping-cart-order-form";
import { TopBar } from "@/components/top-bar";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { connections } from "@/data/connections";
import { useToast } from "@/components/ui/use-toast";

interface ProductoItem {
  id: number;
  codigo: string;
  descripcion: string;
  precio_sugerido: number;
  precio_minimo: number;
  imagen: string | null;
  categoria_id: number;
  presentacion_id: number;
  stock: number;
}

interface DetallePedido {
  id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  productos: ProductoItem;
}

interface OrderResponse {
  id: number;
  numero: string;
  fecha: string;
  cliente_id: number;
  subtotal: string;
  igv: string;
  total: string;
  estado: string;
  notas: string;
  metodo_pago?: string;
  punto_venta?: string;
  clientes: {
    nombre: string;
  };
  detalle_pedidos: DetallePedido[];
}

export default function AddOrderPage() {
  const searchParams = useSearchParams();
  const orderNumero = searchParams.get("id");
  const [orderData, setOrderData] = useState<{
    id?: number;
    items: Array<{
      id: number;
      codigo: string;
      descripcion: string;
      precio_sugerido: number;
      precio_minimo: number;
      imagen: string;
      quantity: number;
      categoria_id: number;
      presentacion_id: number;
      stock: number;
      discountEnabled?: boolean;
    }>;
    paymentMethod: string;
    pointOfSale: string;
  } | null>(null);
  const [loading, setLoading] = useState(!!orderNumero);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrderData = async () => {
      if (orderNumero) {
        try {
          setLoading(true);

          const response: OrderResponse = (
            await connections.pedidos.getByNumero(orderNumero)
          ).data;

          // Extraer método de pago y punto de venta
          const notas = response.notas || "";
          let metodo_pago = "efectivo";
          let punto_venta = "tienda1";

          if (notas.includes("Método de pago:")) {
            metodo_pago =
              notas.split("Método de pago:")[1]?.split(",")[0]?.trim() ||
              "efectivo";
          }
          if (notas.includes("Punto de venta:")) {
            punto_venta =
              notas.split("Punto de venta:")[1]?.trim() || "tienda1";
          }

          // Transformar los datos
          const transformedItems = response.detalle_pedidos.map((item) => {
            const discountEnabled =
              Number(item.precio_unitario) ===
              Number(item.productos.precio_minimo);

            return {
              id: item.productos.id,
              codigo: item.productos.codigo,
              descripcion: item.productos.descripcion,
              precio_sugerido: Number(item.productos.precio_sugerido),
              precio_minimo: Number(item.productos.precio_minimo),
              imagen: item.productos.imagen || "/abarrote.webp",
              quantity: item.cantidad,
              categoria_id: item.productos.categoria_id,
              presentacion_id: item.productos.presentacion_id,
              stock: item.productos.stock,
              discountEnabled,
            };
          });

          setOrderData({
            id: response.id,
            items: transformedItems,
            paymentMethod: metodo_pago,
            pointOfSale: punto_venta,
          });
        } catch (err) {
          console.error("Error al cargar el pedido:", err);
          toast({
            title: "Error",
            description: "No se pudo cargar el pedido",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrderData();
  }, [orderNumero, toast]);

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col">
        <TopBar />
        <div className="p-4 flex-1 flex items-center justify-center">
          <p>Cargando datos del pedido...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="p-4 flex-1">
        <h1 className="text-2xl font-bold mb-6">
          {orderNumero
            ? `Editando Pedido ${orderNumero}`
            : "Agregar Nuevo Pedido"}
        </h1>
        <ShoppingCartOrderForm
          id={orderData?.id}
          orderId={orderNumero || undefined}
          initialCart={orderData?.items || []}
          paymentMethod={orderData?.paymentMethod}
          pointOfSale={orderData?.pointOfSale}
        />
      </div>
    </main>
  );
}
