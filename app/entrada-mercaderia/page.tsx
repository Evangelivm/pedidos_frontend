"use client";

import { useState } from "react";
import { TopBar } from "@/components/top-bar";
import { MerchandiseEntryForm } from "@/components/merchandise-entry-form";
import { MerchandiseEntriesTable } from "@/components/merchandise-entries-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";

export default function EntradaMercaderiaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("historial");

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleNewEntry = () => {
    setShowForm(true);
    setActiveTab("nueva");
  };

  const handleEntryComplete = () => {
    setShowForm(false);
    setActiveTab("historial");
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
                onSearch={handleSearch}
                placeholder="Buscar por producto, proveedor, factura..."
                // className="w-full md:w-80"
              />

              <Button
                onClick={handleNewEntry}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Entrada
              </Button>

              <Button
                variant="outline"
                className="border-blue-600 text-blue-600"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
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
              <MerchandiseEntriesTable searchTerm={searchTerm} />
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
