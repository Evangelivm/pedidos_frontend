"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Interfaces reales de tu API
interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  categoria_id: number;
  presentacion_id: number;
  precio_sugerido: string;
  precio_minimo: string;
  stock: number;
  stock_minimo: number;
  imagen: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

interface DetalleEntradaMercaderia {
  id: number;
  entrada_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  created_at: string;
  updated_at: string;
  productos: Producto;
}

export interface EntradaMercaderia {
  id: number;
  fecha: string;
  proveedor: string;
  numero_factura: string;
  total: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
  detalle_entradas_mercaderia: DetalleEntradaMercaderia[];
}

interface MerchandiseEntriesTableProps {
  entries?: EntradaMercaderia[]; // opcional para evitar errores
  loading: boolean;
}

export function MerchandiseEntriesTable({
  entries = [], // valor por defecto
  loading,
}: MerchandiseEntriesTableProps) {
  const [selectedEntry, setSelectedEntry] = useState<EntradaMercaderia | null>(
    null
  );
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: es });
  };
  const wrapText = (text: string, charsPerLine: number) => {
    const regex = new RegExp(`(.{${charsPerLine}})`, "g");
    return text.replace(regex, "$1\n");
  };

  const handleViewDetails = (entry: EntradaMercaderia) => {
    setSelectedEntry(entry);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  return (
    <div className="bg-white rounded-lg border">
      {entries.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>N° Factura</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.fecha)}</TableCell>
                <TableCell>{entry.proveedor}</TableCell>
                <TableCell>{entry.numero_factura || "-"}</TableCell>
                <TableCell>
                  {entry.detalle_entradas_mercaderia.length} productos
                </TableCell>
                <TableCell className="text-left font-medium">
                  S/ {parseFloat(entry.total).toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(entry)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center">
          <p>No se encontraron resultados.</p>
        </div>
      )}

      {/* Diálogo de detalles */}
      {selectedEntry && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle de Entrada de Mercadería</DialogTitle>
              <DialogDescription>
                Información completa de la entrada de mercadería
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Fecha de Entrada
                </p>
                <p>{formatDate(selectedEntry.fecha)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proveedor</p>
                <p>{selectedEntry.proveedor}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  N° de Factura
                </p>
                <p>{selectedEntry.numero_factura || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="font-semibold">
                  S/.{parseFloat(selectedEntry.total).toFixed(2)}
                </p>
              </div>
              {selectedEntry.notas && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">
                    Notas / Observaciones
                  </p>
                  <p>{selectedEntry.notas}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Productos Recibidos</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Cantidad</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEntry.detalle_entradas_mercaderia.map(
                    (item, index) => (
                      <TableRow key={`${item.id}-${index}`}>
                        <TableCell>
                          <div className="whitespace-pre-line max-w-xs">
                            {wrapText(
                              item.productos?.descripcion ||
                                `Producto ID ${item.producto_id}`,
                              60
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.cantidad}
                        </TableCell>
                        <TableCell className="text-right">
                          S/.{parseFloat(item.precio_unitario).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          S/.{parseFloat(item.subtotal).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      S/.{parseFloat(selectedEntry.total).toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsDialog(false)}
              >
                Cerrar
              </Button>
              {/* <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button> */}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
