"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, FileText, Printer } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

interface EntryItem {
  id: string
  productId: string
  productName: string
  quantity: number
  unitCost: number
  total: number
}

interface MerchandiseEntry {
  id: string
  date: string | Date
  provider: string
  invoiceNumber: string
  notes: string
  items: EntryItem[]
  total: number
  createdAt: string
}

interface MerchandiseEntriesTableProps {
  searchTerm: string
}

export function MerchandiseEntriesTable({ searchTerm }: MerchandiseEntriesTableProps) {
  const [entries, setEntries] = useState<MerchandiseEntry[]>([])
  const [filteredEntries, setFilteredEntries] = useState<MerchandiseEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<MerchandiseEntry | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  // Cargar entradas desde localStorage
  useEffect(() => {
    const storedEntries = JSON.parse(localStorage.getItem("merchandiseEntries") || "[]")

    // Si no hay entradas guardadas, crear datos de ejemplo
    if (storedEntries.length === 0) {
      const sampleEntries = generateSampleEntries()
      localStorage.setItem("merchandiseEntries", JSON.stringify(sampleEntries))
      setEntries(sampleEntries)
    } else {
      setEntries(storedEntries)
    }
  }, [])

  // Filtrar entradas según término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEntries(entries)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = entries.filter(
      (entry) =>
        entry.provider.toLowerCase().includes(term) ||
        entry.invoiceNumber.toLowerCase().includes(term) ||
        entry.items.some((item) => item.productName.toLowerCase().includes(term)),
    )

    setFilteredEntries(filtered)
  }, [searchTerm, entries])

  const handleViewDetails = (entry: MerchandiseEntry) => {
    setSelectedEntry(entry)
    setShowDetailsDialog(true)
  }

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return format(date, "dd/MM/yyyy", { locale: es })
  }

  // Generar datos de ejemplo para la tabla
  const generateSampleEntries = (): MerchandiseEntry[] => {
    return [
      {
        id: "1",
        date: new Date(2023, 4, 15),
        provider: "Distribuidora Nacional S.A.",
        invoiceNumber: "F001-00012345",
        notes: "Entrega completa en buen estado",
        items: [
          { id: "1-1", productId: "1", productName: "Smartphone XYZ", quantity: 10, unitCost: 800, total: 8000 },
          { id: "1-2", productId: "2", productName: "Laptop Pro 15", quantity: 5, unitCost: 2100, total: 10500 },
        ],
        total: 18500,
        createdAt: new Date(2023, 4, 15, 10, 30).toISOString(),
      },
      {
        id: "2",
        date: new Date(2023, 4, 10),
        provider: "Importadora del Sur",
        invoiceNumber: "F002-00054321",
        notes: "Faltó un producto que será entregado en la próxima semana",
        items: [
          { id: "2-1", productId: "3", productName: "Auriculares Bluetooth", quantity: 20, unitCost: 70, total: 1400 },
          { id: "2-2", productId: "4", productName: "Smartwatch Series 5", quantity: 8, unitCost: 350, total: 2800 },
        ],
        total: 4200,
        createdAt: new Date(2023, 4, 10, 14, 15).toISOString(),
      },
      {
        id: "3",
        date: new Date(2023, 4, 5),
        provider: "Mayorista Express",
        invoiceNumber: "F003-00098765",
        notes: "",
        items: [
          { id: "3-1", productId: "5", productName: "Cámara DSLR Pro", quantity: 3, unitCost: 1200, total: 3600 },
          { id: "3-2", productId: "6", productName: "Altavoz Bluetooth", quantity: 15, unitCost: 120, total: 1800 },
        ],
        total: 5400,
        createdAt: new Date(2023, 4, 5, 9, 45).toISOString(),
      },
    ]
  }

  return (
    <div className="bg-white rounded-lg border">
      {filteredEntries.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>N° Factura</TableHead>
              <TableHead>Productos</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[100px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEntries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>{entry.provider}</TableCell>
                <TableCell>{entry.invoiceNumber}</TableCell>
                <TableCell>{entry.items.length} productos</TableCell>
                <TableCell className="text-right font-medium">S/ {entry.total.toFixed(2)}</TableCell>
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
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700 hover:bg-gray-50">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="p-8 text-center">
          <p className="text-gray-500">No se encontraron entradas de mercadería.</p>
        </div>
      )}

      {/* Diálogo de detalles */}
      {selectedEntry && (
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Detalle de Entrada de Mercadería</DialogTitle>
              <DialogDescription>Información completa de la entrada de mercadería</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Fecha de Entrada</p>
                <p>{formatDate(selectedEntry.date)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Proveedor</p>
                <p>{selectedEntry.provider}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">N° de Factura</p>
                <p>{selectedEntry.invoiceNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="font-semibold">S/ {selectedEntry.total.toFixed(2)}</p>
              </div>
              {selectedEntry.notes && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-gray-500">Notas / Observaciones</p>
                  <p>{selectedEntry.notes}</p>
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
                  {selectedEntry.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">S/ {item.unitCost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">S/ {item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Total:
                    </TableCell>
                    <TableCell className="text-right font-bold">S/ {selectedEntry.total.toFixed(2)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                Cerrar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
