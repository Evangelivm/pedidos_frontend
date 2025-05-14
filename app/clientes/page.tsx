"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Users } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ClientsTable } from "@/components/clients-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ClientsPage() {
  const { toast } = useToast()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("Todos")

  // Cargar clientes al iniciar
  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = () => {
    setLoading(true)
    try {
      // Cargar clientes desde localStorage
      const storedClients = localStorage.getItem("clients")
      if (storedClients) {
        setClients(JSON.parse(storedClients))
      } else {
        // Si no hay clientes, inicializar con algunos de ejemplo
        const initialClients = [
          {
            id: "client-1",
            name: "Juan Pérez",
            ruc: "",
            type: "Persona",
            documentType: "DNI",
            documentNumber: "45678912",
            phone: "999-888-777",
            email: "juan.perez@example.com",
            address: "Av. Los Pinos 123, San Isidro, Lima",
            status: "Activo",
            createdAt: new Date().toISOString(),
          },
          {
            id: "client-2",
            name: "Comercial Express S.A.C.",
            ruc: "20123456789",
            type: "Empresa",
            documentType: "",
            documentNumber: "",
            phone: "999-777-666",
            email: "contacto@comercialexpress.com",
            address: "Jr. Comercio 456, Miraflores, Arequipa",
            status: "Activo",
            createdAt: new Date().toISOString(),
          },
          {
            id: "client-3",
            name: "María Rodríguez",
            ruc: "",
            type: "Persona",
            documentType: "DNI",
            documentNumber: "09876543",
            phone: "999-666-555",
            email: "maria.rodriguez@example.com",
            address: "Calle Las Flores 789, Centro Histórico, Trujillo",
            status: "Inactivo",
            createdAt: new Date().toISOString(),
          },
          {
            id: "client-4",
            name: "Distribuidora Nacional E.I.R.L.",
            ruc: "20987654321",
            type: "Empresa",
            documentType: "",
            documentNumber: "",
            phone: "998-765-432",
            email: "ventas@distribuidoranacional.com",
            address: "Av. Industrial 567, Zona Industrial, Callao",
            status: "Activo",
            createdAt: new Date().toISOString(),
          },
        ]
        setClients(initialClients)
        localStorage.setItem("clients", JSON.stringify(initialClients))
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener tipos únicos de los clientes
  const clientTypes = ["Todos", "Persona", "Empresa"]

  // Filtrar clientes según búsqueda y tipo
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.ruc && client.ruc.toLowerCase().includes(searchTerm.toLowerCase())) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.documentNumber && client.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = filterType === "Todos" || client.type === filterType

    return matchesSearch && matchesType
  })

  // Manejar eliminación de cliente
  const handleDeleteClient = (clientId: string) => {
    try {
      const updatedClients = clients.filter((client) => client.id !== clientId)
      setClients(updatedClients)
      localStorage.setItem("clients", JSON.stringify(updatedClients))

      toast({
        title: "Cliente eliminado",
        description: "El cliente ha sido eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar cliente:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      })
    }
  }

  // Manejar cambio de estado de cliente
  const handleToggleStatus = (clientId: string) => {
    try {
      const updatedClients = clients.map((client) => {
        if (client.id === clientId) {
          return {
            ...client,
            status: client.status === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return client
      })
      setClients(updatedClients)
      localStorage.setItem("clients", JSON.stringify(updatedClients))

      toast({
        title: "Estado actualizado",
        description: "El estado del cliente ha sido actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del cliente.",
        variant: "destructive",
      })
    }
  }

  // Exportar clientes a Excel
  const handleExportToExcel = () => {
    try {
      if (filteredClients.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay clientes disponibles para exportar.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Exportación iniciada",
        description: "Los clientes se están exportando a Excel.",
      })

      // Aquí iría la lógica de exportación a Excel
      // Por ahora solo mostramos un mensaje de éxito
      setTimeout(() => {
        toast({
          title: "Exportación exitosa",
          description: `Se han exportado ${filteredClients.length} clientes a Excel.`,
        })
      }, 1000)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los clientes. Inténtelo de nuevo.",
        variant: "destructive",
      })
    }
  }

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
            <p className="text-gray-500 text-sm">Administre todos sus clientes desde un solo lugar</p>
          </div>
          <div className="flex gap-2">
            <Link href="/clientes/nuevo">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Cliente
              </Button>
            </Link>
            <Button variant="outline" className="border-gray-300" onClick={handleExportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <div className="flex-1">
            <SearchBar
              placeholder="Buscar por nombre, RUC, documento, email o teléfono..."
              onSearch={(value) => setSearchTerm(value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                {clientTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-gray-300 whitespace-nowrap">
              <Filter className="h-4 w-4 mr-2" />
              Más filtros
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-auto flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Cargando clientes...</p>
            </div>
          ) : (
            <ClientsTable clients={filteredClients} onDelete={handleDeleteClient} onToggleStatus={handleToggleStatus} />
          )}
        </div>
      </div>
    </main>
  )
}
