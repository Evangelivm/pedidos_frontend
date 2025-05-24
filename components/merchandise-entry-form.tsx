"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, Plus, Trash2, Save, X } from "lucide-react";
import connections from "@/data/connections"; // Conexión real a la API
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MerchandiseEntryFormProps {
  onComplete: () => void;
}

interface ProductFromAPI {
  id: number;
  descripcion: string;
  precio_minimo: string;
}

interface EntryItem {
  id: string;
  producto_id: number;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export function MerchandiseEntryForm({
  onComplete,
}: MerchandiseEntryFormProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [provider, setProvider] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [entryItems, setEntryItems] = useState<EntryItem[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductFromAPI[]>([]);

  // Cargar productos desde la API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await connections.productos.getAll({
          page: 1,
          limit: 1000,
        });
        setProducts(response.data.items || []);
      } catch (error) {
        console.error("Error al cargar los productos:", error);
        alert("No se pudieron cargar los productos.");
      }
    };

    loadProducts();
  }, []);

  // Actualizar costo unitario cuando se selecciona un producto
  useEffect(() => {
    if (selectedProduct) {
      const product = products.find((p) => p.id.toString() === selectedProduct);
      if (product) {
        const precioMin = parseFloat(product.precio_minimo);
        setUnitCost(isNaN(precioMin) ? 0 : precioMin);
      }
    } else {
      setUnitCost(0);
    }
  }, [selectedProduct, products]);

  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0 || unitCost <= 0) return;

    const product = products.find((p) => p.id.toString() === selectedProduct);
    if (!product) return;

    const newItem: EntryItem = {
      id: Date.now().toString(),
      producto_id: product.id,
      descripcion: product.descripcion,
      cantidad: quantity,
      precio_unitario: unitCost,
      subtotal: quantity * unitCost,
    };

    setEntryItems([...entryItems, newItem]);
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
  };

  const handleRemoveItem = (id: string) => {
    setEntryItems(entryItems.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return entryItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const handleSubmit = async () => {
    console.log("Guardando entrada...");

    if (entryItems.length === 0 || !provider || !invoiceNumber) {
      alert(
        "Por favor complete todos los campos requeridos y añada al menos un producto."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        fecha: date,
        proveedor: provider.trim(),
        numero_factura: invoiceNumber.trim(),
        total: calculateTotal(),
        notas: notes.trim() || undefined, // ✅ Aquí corregimos: null → undefined
        detalle: entryItems.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
        })),
      };

      // Llamamos a la conexión para guardar en backend
      const response = await connections.entradasMercaderia.create(payload);
      // console.log(payload);
      console.log("Entrada guardada exitosamente:", response);

      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error al guardar la entrada:", error);
      alert("Ocurrió un error al guardar la entrada de mercadería.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmComplete = () => {
    setShowConfirmDialog(false);
    resetForm();
    onComplete();
  };

  const resetForm = () => {
    setDate(new Date());
    setProvider("");
    setInvoiceNumber("");
    setNotes("");
    setSelectedProduct("");
    setQuantity(1);
    setUnitCost(0);
    setEntryItems([]);
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-xl font-semibold mb-6">
        Registrar Nueva Entrada de Mercadería
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Fecha */}
        <div className="space-y-2">
          <Label htmlFor="date">Fecha de Entrada</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date
                  ? format(date, "PPP", { locale: es })
                  : "Seleccionar fecha"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                locale={es}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Proveedor */}
        <div className="space-y-2">
          <Label htmlFor="provider">Proveedor</Label>
          <Input
            id="provider"
            value={provider}
            onChange={(e) => setProvider(e.target.value.toUpperCase())}
            placeholder="Nombre del proveedor"
            // style={{ textTransform: "uppercase" }}
          />
        </div>

        {/* Número de Factura */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Número de Factura</Label>
          <Input
            id="invoiceNumber"
            value={invoiceNumber}
            onChange={(e) => setInvoiceNumber(e.target.value)}
            placeholder="Ej: F001-00012345"
          />
        </div>
      </div>

      <div className="border-t border-b py-6 my-6">
        <h3 className="text-lg font-medium mb-4">Detalle de Productos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Producto */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="product">Producto</Label>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.descripcion}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number.parseInt(e.target.value) || 0)
              }
            />
          </div>

          {/* Costo Unitario */}
          <div className="space-y-2">
            <Label htmlFor="unitCost">Costo Unitario (S/)</Label>
            <Input
              id="unitCost"
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) =>
                setUnitCost(Number.parseFloat(e.target.value) || 0)
              }
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleAddItem}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!selectedProduct || quantity <= 0 || unitCost <= 0}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>

          <Button
            onClick={() =>
              (window.location.href =
                process.env.NEXT_PUBLIC_PRODUCTS_NEW_URL ?? "")
            }
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {entryItems.length > 0 && (
          <div className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Costo Unit.</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entryItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.descripcion}</TableCell>
                    <TableCell className="text-right">
                      {item.cantidad}
                    </TableCell>
                    <TableCell className="text-right">
                      S/ {item.precio_unitario.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      S/ {item.subtotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    S/ {calculateTotal().toFixed(2)}
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Notas */}
      <div className="space-y-2 mb-6">
        <Label htmlFor="notes">Notas / Observaciones</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Información adicional sobre esta entrada de mercadería..."
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onComplete}>
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white"
          disabled={isSubmitting || entryItems.length === 0}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Guardando..." : "Guardar Entrada"}
        </Button>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entrada registrada con éxito</AlertDialogTitle>
            <AlertDialogDescription>
              La entrada de mercadería ha sido registrada correctamente en el
              sistema. El inventario ha sido actualizado con las nuevas
              cantidades.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmComplete}>
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
