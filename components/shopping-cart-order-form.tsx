"use client";
import { useState, useEffect, useMemo, memo } from "react";
import {
  Plus,
  Minus,
  X,
  ShoppingCart,
  Search,
  Tag,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { connections } from "@/data/connections";
import { Producto, Pedido, DetallePedido } from "@/data/connections";

const CATEGORIES = {
  1: "Abarrotes",
  2: "Trigos, harinas y hojuelas",
  3: "Condimentos y especias",
  4: "Frutos secos",
  5: "Productos para panificacion",
  6: "Hierbas, aromaticas y semillas",
  7: "Legumbres y cereales",
  8: "Alimentos balanceados para mascotas",
};

const PRESENTATIONS = {
  1: "CAJA",
  2: "SACO",
  3: "PAQUETE",
  4: "BOLSA",
  5: "KILO",
  6: "DOCENA",
  7: "DISPLAY",
  8: "UNIDAD",
  9: "PLANCHA",
  10: "50 KILOS",
  11: "HARINAS",
};

type CartItem = {
  id: number;
  codigo: string;
  descripcion: string;
  precio_sugerido: number;
  precio_minimo: number;
  imagen: string;
  quantity: number;
  discountEnabled?: boolean;
  categoria_id: number;
  presentacion_id: number;
  stock: number;
};

interface ShoppingCartOrderFormProps {
  id?: number;
  orderId?: string;
  initialCart?: CartItem[];
  paymentMethod?: string;
  pointOfSale?: string;
}

const CartItem = memo(
  ({
    item,
    updateQuantity,
    removeFromCart,
    enableDiscount,
  }: {
    item: CartItem;
    updateQuantity: (id: number, newQuantity: number) => void;
    removeFromCart: (id: number) => void;
    enableDiscount: (id: number, checked: boolean) => void;
  }) => {
    const total = useMemo(() => {
      const price = item.discountEnabled
        ? item.precio_minimo
        : item.precio_sugerido;
      return price * item.quantity;
    }, [item]);

    const savings = useMemo(() => {
      if (item.discountEnabled && item.quantity >= 2) {
        return (item.precio_sugerido - item.precio_minimo) * item.quantity;
      }
      return 0;
    }, [item]);

    return (
      <div key={item.id} className="flex flex-col border-b pb-3">
        <div className="flex gap-3">
          <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded">
            <Image
              src={item.imagen || "/abarrote.webp"}
              alt={item.descripcion}
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1 break-words whitespace-normal">
              {item.descripcion}
            </h3>
            <div className="text-xs text-gray-500">
              Código: {item.codigo} | Presentación:{" "}
              {
                PRESENTATIONS[
                  item.presentacion_id as keyof typeof PRESENTATIONS
                ]
              }
            </div>
            <div className="flex flex-col gap-2 mb-2">
              <div className="flex items-center">
                <Switch
                  checked={!!item.discountEnabled}
                  onCheckedChange={(checked) =>
                    enableDiscount(item.id, checked)
                  }
                  className="h-3 w-6 data-[state=checked]:bg-blue-600"
                />
                <span className="text-xs text-blue-700 font-medium ml-6">
                  USAR PRECIO MÍNIMO
                </span>
              </div>
              <div className="flex flex-col">
                {item.discountEnabled && item.quantity >= 2 ? (
                  <>
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-400 line-through">
                        Precio sugerido: S/.{item.precio_sugerido.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Percent className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600 font-medium">
                        Precio mínimo: S/.{item.precio_minimo.toFixed(2)} x{" "}
                        {item.quantity} = S/.{total.toFixed(2)}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="text-[10px] text-green-600 font-medium">
                        Ahorro: S/.{savings.toFixed(2)}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs">
                      Precio sugerido: S/.{item.precio_sugerido.toFixed(2)} x{" "}
                      {item.quantity} = S/.{total.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center border rounded">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-none"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => removeFromCart(item.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export function ShoppingCartOrderForm({
  id,
  orderId,
  initialCart = [],
  paymentMethod = "efectivo",
  pointOfSale = "tienda1",
}: ShoppingCartOrderFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState(paymentMethod);
  const [selectedPointOfSale, setSelectedPointOfSale] = useState(pointOfSale);
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const isEditing = !!orderId;

  useEffect(() => {
    setIsClient(true);

    // Priorizar initialCart si estamos editando
    if (isEditing && initialCart.length > 0) {
      setCart(initialCart);
    } else {
      // Si no es edición, intentar cargar del localStorage
      const savedCart = localStorage.getItem("cart");
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCart(parsedCart);
        } catch (e) {
          console.error("Error parsing cart", e);
          setCart(initialCart);
        }
      } else {
        setCart(initialCart);
      }
    }
  }, [initialCart, isEditing]);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isClient]);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await connections.productos.getAll({
          page: 1,
          limit: 1000,
        });
        const productsWithNumericPrices = response.data.items.map(
          (product: any) => ({
            ...product,
            precio_sugerido: Number(product.precio_sugerido),
            precio_minimo: Number(product.precio_minimo),
          })
        );
        setProducts(productsWithNumericPrices);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const productMap = useMemo(() => {
    return Object.fromEntries(products.map((p) => [p.id, p]));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "Todos" ||
        CATEGORIES[product.categoria_id as keyof typeof CATEGORIES] ===
          selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const addToCart = (product: Producto) => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast({
          title: "Stock insuficiente",
          description: "No hay suficiente stock.",
          variant: "destructive",
        });
        return;
      }
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                discountEnabled: item.discountEnabled ?? false,
              }
            : item
        )
      );
    } else {
      if (product.stock <= 0) {
        toast({
          title: "Producto sin stock",
          description: "Este producto no tiene stock disponible.",
          variant: "destructive",
        });
        return;
      }
      setCart([
        ...cart,
        {
          id: product.id,
          codigo: product.codigo,
          descripcion: product.descripcion,
          precio_sugerido: product.precio_sugerido || 0,
          precio_minimo: product.precio_minimo || 0,
          imagen: product.imagen || "/abarrote.webp",
          quantity: 1,
          discountEnabled: false,
          categoria_id: product.categoria_id,
          presentacion_id: product.presentacion_id,
          stock: product.stock,
        },
      ]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const product = productMap[id];
    if (!product) return;
    if (newQuantity > product.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${product.stock} unidades disponibles.`,
        variant: "destructive",
      });
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              discountEnabled: item.discountEnabled ?? false,
            }
          : item
      )
    );
  };

  const enableDiscount = (id: number, checked: boolean) => {
    setCart(
      cart.map((item) =>
        item.id === id
          ? {
              ...item,
              discountEnabled: checked,
            }
          : item
      )
    );
  };

  const calculateTotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const shouldApplyDiscount = item.quantity >= 5 && item.discountEnabled;
      const itemPrice = shouldApplyDiscount
        ? item.precio_minimo
        : item.precio_sugerido;
      return sum + itemPrice * item.quantity;
    }, 0);
  }, [cart]);

  const handleSubmitOrder = async () => {
    const productsWithoutStock = cart.filter((item) => {
      const product = productMap[item.id];
      return product && product.stock < item.quantity;
    });

    if (productsWithoutStock.length > 0) {
      const productNames = productsWithoutStock
        .map((item) => item.descripcion)
        .join(", ");
      toast({
        title: "Stock insuficiente",
        description: `No hay suficiente stock para: ${productNames}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const detallesPedido: DetallePedido[] = cart.map((item) => ({
        producto_id: item.id,
        cantidad: item.quantity,
        precio_unitario:
          item.discountEnabled && item.quantity >= 5
            ? item.precio_minimo
            : item.precio_sugerido,
        subtotal:
          (item.discountEnabled && item.quantity >= 5
            ? item.precio_minimo
            : item.precio_sugerido) * item.quantity,
      }));

      const subtotal = detallesPedido.reduce(
        (sum, item) => sum + item.subtotal,
        0
      );
      const igv = subtotal * 0.18;
      const total = subtotal + igv;

      const pedidoData: Partial<Pedido> = {
        subtotal: subtotal,
        igv: igv,
        total: total,
        notas: `Método de pago: ${selectedPaymentMethod}, Punto de venta: ${selectedPointOfSale}`,
        detalle: detallesPedido,
      };

      if (isEditing && id) {
        // Ahora verificamos el id numérico en lugar de orderId
        // Actualizar pedido existente usando el ID numérico
        await connections.pedidos.update(id, pedidoData);
        localStorage.removeItem("cart");
        //console.log(pedidoData);
        toast({
          title: "Pedido actualizado",
          description: `El pedido #${orderId} ha sido actualizado correctamente.`,
        });
      } else {
        // Crear nuevo pedido
        function generarNumeroPedidoConFecha(): string {
          const ahora = new Date();
          const fecha = [
            ahora.getFullYear().toString().slice(-2),
            String(ahora.getMonth() + 1).padStart(2, "0"),
            String(ahora.getDate()).padStart(2, "0"),
          ].join("");

          const caracteres = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let randomPart = "";

          for (let i = 0; i < 4; i++) {
            randomPart += caracteres.charAt(
              Math.floor(Math.random() * caracteres.length)
            );
          }

          return `PED-${fecha}-${randomPart}`;
        }

        const newPedidoData: Omit<Pedido, "id"> = {
          ...pedidoData,
          cliente_id: 1, // Asumiendo cliente por defecto
          numero: generarNumeroPedidoConFecha(),
          fecha: new Date(),
          estado: "PENDIENTE",
        } as Omit<Pedido, "id">;

        const response = await connections.pedidos.create(newPedidoData);
        toast({
          title: "Pedido creado",
          description: "El pedido ha sido creado correctamente.",
        });
      }

      localStorage.removeItem("cart");
      router.push("/");
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error al procesar el pedido",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = () => {
    localStorage.removeItem("cart");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 border rounded-lg p-4 bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Cargando productos...</p>
        </div>
        <div className="border rounded-lg p-4 bg-white flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Selector */}
      <div className="lg:col-span-2 border rounded-lg p-4 bg-white">
        {/* Search & Filter */}
        <div className="mb-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar por código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos</SelectItem>
              {Object.entries(CATEGORIES).map(([id, name]) => (
                <SelectItem key={id} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="relative h-24 bg-gray-100">
                <Image
                  src={product.imagen || "/abarrote.webp"}
                  alt={product.descripcion}
                  fill
                  className="object-contain p-2"
                />
              </div>
              <CardContent className="p-2">
                <h3 className="font-medium text-xs mb-1 break-words whitespace-normal">
                  {product.descripcion}
                </h3>
                {/* Prices */}
                <div className="flex flex-col mb-1 border-t border-b border-gray-100 py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Tag className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs text-blue-600">
                        Precio sugerido:
                      </span>
                    </div>
                    <span className="font-bold text-xs text-blue-600">
                      S/.{product.precio_sugerido?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <Percent className="h-3 w-3 text-green-600 mr-1" />
                      <span className="text-xs text-green-600">
                        Precio mínimo:
                      </span>
                    </div>
                    <span className="font-bold text-xs text-green-600">
                      S/.{product.precio_minimo?.toFixed(2)}
                    </span>
                  </div>
                  {/* <div className="text-[10px] text-gray-500 text-right italic">
                    Desde 5 unidades
                  </div> */}
                </div>
                <div className="flex justify-between items-center mb-1">
                  <Badge
                    variant="outline"
                    className={`text-xs px-1 py-0 ${
                      product.stock < 5
                        ? "bg-red-50 text-red-600 border-red-300"
                        : ""
                    }`}
                  >
                    Stock: {product.stock}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {
                      PRESENTATIONS[
                        product.presentacion_id as keyof typeof PRESENTATIONS
                      ]
                    }
                  </span>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  className={`w-full h-7 text-xs ${
                    product.stock < 5
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                  disabled={product.stock === 0}
                >
                  <Plus className="h-3 w-3 mr-1" /> Agregar
                </Button>
              </CardContent>
            </Card>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No se encontraron productos que coincidan con la búsqueda.
            </div>
          )}
        </div>
      </div>
      {/* Shopping Cart */}
      <div className="border rounded-lg p-4 bg-white">
        <div className="flex items-center gap-2 mb-4 text-blue-700">
          <ShoppingCart className="h-5 w-5" />
          <h2 className="text-lg font-bold">
            {isEditing ? `Editar Pedido #${orderId}` : "Carrito de Compras"}
          </h2>
          <Badge variant="secondary" className="ml-auto">
            {cart.length} {cart.length === 1 ? "producto" : "productos"}
          </Badge>
        </div>
        {cart.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-t border-b">
            El carrito está vacío
          </div>
        ) : (
          <div className="space-y-4 max-h-[calc(100vh-350px)] overflow-y-auto pr-2">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                enableDiscount={enableDiscount}
              />
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total:</span>
            <span>S/.{calculateTotal.toFixed(2)} soles</span>
          </div>
          <div className="space-y-2">
            <Select
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
            >
              <SelectTrigger>
                <SelectValue placeholder="Método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">
                  Contra Entrega Efectivo
                </SelectItem>
                <SelectItem value="tarjeta">Tarjeta de Crédito</SelectItem>
                <SelectItem value="transferencia">
                  Transferencia Bancaria
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedPointOfSale}
              onValueChange={setSelectedPointOfSale}
            >
              <SelectTrigger>
                <SelectValue placeholder="Punto de venta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tienda1">
                  Punto de Venta - Tienda 1
                </SelectItem>
                <SelectItem value="tienda2">
                  Punto de Venta - Tienda 2
                </SelectItem>
                <SelectItem value="tienda3">
                  Punto de Venta - Tienda 3
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800 mt-4"
              disabled={cart.length === 0}
              onClick={handleSubmitOrder}
            >
              {isEditing ? "Guardar Cambios" : "Finalizar Pedido"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleCancelOrder}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
