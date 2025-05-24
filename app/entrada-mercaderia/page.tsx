"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { MerchandiseEntryForm } from "@/components/merchandise-entry-form";
import { MerchandiseEntriesTable } from "@/components/merchandise-entries-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import connections from "@/data/connections";

// Interfaces definidas localmente (copiadas de MerchandiseEntriesTable)
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

export default function EntradaMercaderiaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("historial");
  const [entries, setEntries] = useState<EntradaMercaderia[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<EntradaMercaderia[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Cargar entradas desde la API
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setLoading(true);
        const res = await connections.entradasMercaderia.getAll({
          page: 1,
          limit: 50,
        });

        setEntries(res.data.items || []);
      } catch (error) {
        console.error("Error fetching entries:", error);
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  // Filtrar entradas según término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredEntries(entries);
      return;
    }

    const term = searchTerm.toLowerCase();

    const filtered = entries.filter(
      (entry) =>
        entry.detalle_entradas_mercaderia.some((item) =>
          item.productos.descripcion.toLowerCase().includes(term)
        ) ||
        entry.proveedor.toLowerCase().includes(term) ||
        entry.numero_factura.toLowerCase().includes(term)
    );

    setFilteredEntries(filtered);
  }, [searchTerm, entries]);

  const handleNewEntry = () => {
    setShowForm(true);
    setActiveTab("nueva");
  };

  const handleEntryComplete = () => {
    setShowForm(false);
    setActiveTab("historial");

    // Recargar entradas después de crear una nueva
    const fetchEntries = async () => {
      const res = await connections.entradasMercaderia.getAll({
        page: 1,
        limit: 50,
      });
      setEntries(res.data.items || []);
    };
    fetchEntries();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="p-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Entrada de Mercadería
              </h1>
              <p className="text-gray-500">
                Gestiona el ingreso de productos al inventario
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <SearchBar
                onSearch={setSearchTerm}
                placeholder="Buscar por producto, proveedor, factura..."
              />

              <Button
                onClick={handleNewEntry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>

              {/* <Button
                variant="outline"
                className="border-blue-600 text-blue-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button> */}
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full md:w-80 grid-cols-2">
              <TabsTrigger value="historial">Historial de Entradas</TabsTrigger>
              <TabsTrigger value="nueva">Nueva Entrada</TabsTrigger>
            </TabsList>

            <TabsContent value="historial" className="mt-4">
              <MerchandiseEntriesTable
                entries={filteredEntries}
                loading={loading}
              />
            </TabsContent>

            <TabsContent value="nueva" className="mt-4">
              <MerchandiseEntryForm onComplete={handleEntryComplete} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
