"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { SearchBar } from "@/components/search-bar";
import { Button } from "@/components/ui/button";
import { Download, Filter, Plus, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ClientsTable } from "@/components/clients-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import connections, { Cliente } from "@/data/connections";

export default function ClientsPage() {
  const { toast } = useToast();

  const [clients, setClients] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("Todos");
  const [page] = useState(1);
  const [limit] = useState(50);

  // Cargar clientes desde la API
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await connections.clientes.getAll({
          page,
          limit,
          orderBy: "nombre",
          orderDirection: "asc",
        });

        if (response.data && Array.isArray(response.data.items)) {
          setClients(response.data.items);
        } else {
          setClients([]);
        }
        setError(null);
      } catch (err) {
        console.error("Error al cargar los clientes:", err);
        setError("No se pudieron cargar los clientes.");
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [toast]);

  // Filtrar clientes
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.numero_documento.includes(searchTerm);

    const matchesDocumentType =
      filterType === "Todos" || client.tipo_documento === filterType;

    return matchesSearch && matchesDocumentType;
  });

  // Eliminar cliente
  const handleDeleteClient = async (clientId: number) => {
    try {
      await connections.clientes.delete(clientId);
      setClients(clients.filter((c) => c.id !== clientId));
      toast({ title: "Cliente eliminado" });
    } catch (error) {
      console.error("Error al eliminar cliente", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      });
    }
  };

  // Activar o desactivar cliente
  const handleToggleStatus = async (clientId: number) => {
    try {
      const clientToUpdate = clients.find((c) => c.id === clientId);
      if (!clientToUpdate) throw new Error("Cliente no encontrado");

      await connections.clientes.update(clientId, {
        activo: !clientToUpdate.activo,
      });

      setClients(
        clients.map((c) =>
          c.id === clientId ? { ...c, activo: !c.activo } : c
        )
      );

      toast({ title: "Estado actualizado" });
    } catch (error) {
      console.error("Error al actualizar estado", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del cliente.",
        variant: "destructive",
      });
    }
  };

  // Exportar a Excel (simulado)
  const handleExportToExcel = () => {
    if (filteredClients.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay clientes para exportar.",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Exportando clientes..." });
    setTimeout(() => {
      toast({ title: "Clientes exportados" });
    }, 1000);
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="p-4 md:p-6 flex-1 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Gestión de Clientes
            </h1>
            <p className="text-gray-500 text-sm">Administre sus clientes</p>
          </div>
          <div className="flex gap-2">
            <Link href="/clientes/nuevo">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" /> Nuevo Cliente
              </Button>
            </Link>
            <Button variant="outline" onClick={handleExportToExcel}>
              <Download className="h-4 w-4 mr-2" /> Exportar XLS
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchBar
              placeholder="Buscar por nombre o documento..."
              onSearch={(value) => setSearchTerm(value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por documento" />
            </SelectTrigger>
            <SelectContent>
              {["Todos", "DNI", "RUC", "CE", "Pasaporte"].map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-auto bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64 flex-col">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Reintentar
              </Button>
            </div>
          ) : (
            <ClientsTable
              clients={filteredClients}
              onDelete={handleDeleteClient}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>
    </main>
  );
}
