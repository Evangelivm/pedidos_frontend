"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Download, Filter, Plus, Building } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ProvidersTable } from "@/components/providers-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

export default function ProvidersPage() {
  const { toast } = useToast()
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("Todos")

  // Cargar proveedores al iniciar
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = () => {
    setLoading(true)
    try {
      // Cargar proveedores desde localStorage
      const storedProviders = localStorage.getItem("providers")
      if (storedProviders) {
        setProviders(JSON.parse(storedProviders))
      } else {
        // Si no hay proveedores, inicializar con algunos de ejemplo
        const initialProviders = [
          {
            id: "prov-1",
            name: "Distribuidora Nacional S.A.",
            category: "Abarrotes",
            contact: "Juan Pérez",
            phone: "999-888-777",
            email: "distribuidora@example.com",
            address: "Av. Industrial 123, Lima",
            status: "Activo",
            createdAt: new Date().toISOString(),
          },
          {
            id: "prov-2",
            name: "Importadora del Sur E.I.R.L.",
            category: "Electrónicos",
            contact: "María López",
            phone: "999-777-666",
            email: "importadora@example.com",
            address: "Jr. Comercio 456, Arequipa",
            status: "Activo",
            createdAt: new Date().toISOString(),
          },
          {
            id: "prov-3",
            name: "Mayorista Express S.A.C.",
            category: "Bebidas",
            contact: "Carlos Rodríguez",
            phone: "999-666-555",
            email: "mayorista@example.com",
            address: "Calle Principal 789, Trujillo",
            status: "Inactivo",
            createdAt: new Date().toISOString(),
          },
        ]
        setProviders(initialProviders)
        localStorage.setItem("providers", JSON.stringify(initialProviders))
      }
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Obtener categorías únicas de los proveedores
  const categories = ["Todos", ...Array.from(new Set(providers.map((provider) => provider.category)))]

  // Filtrar proveedores según búsqueda y categoría
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.phone.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = filterCategory === "Todos" || provider.category === filterCategory

    return matchesSearch && matchesCategory
  })

  // Manejar eliminación de proveedor
  const handleDeleteProvider = (providerId: string) => {
    try {
      const updatedProviders = providers.filter((provider) => provider.id !== providerId)
      setProviders(updatedProviders)
      localStorage.setItem("providers", JSON.stringify(updatedProviders))

      toast({
        title: "Proveedor eliminado",
        description: "El proveedor ha sido eliminado correctamente.",
      })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor.",
        variant: "destructive",
      })
    }
  }

  // Manejar cambio de estado de proveedor
  const handleToggleStatus = (providerId: string) => {
    try {
      const updatedProviders = providers.map((provider) => {
        if (provider.id === providerId) {
          return {
            ...provider,
            status: provider.status === "Activo" ? "Inactivo" : "Activo",
          }
        }
        return provider
      })
      setProviders(updatedProviders)
      localStorage.setItem("providers", JSON.stringify(updatedProviders))

      toast({
        title: "Estado actualizado",
        description: "El estado del proveedor ha sido actualizado correctamente.",
      })
    } catch (error) {
      console.error("Error al actualizar estado:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del proveedor.",
        variant: "destructive",
      })
    }
  }

  // Exportar proveedores a Excel
  const handleExportToExcel = () => {
    try {
      if (filteredProviders.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay proveedores disponibles para exportar.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Exportación iniciada",
        description: "Los proveedores se están exportando a Excel.",
      })

      // Aquí iría la lógica de exportación a Excel
      // Por ahora solo mostramos un mensaje de éxito
      setTimeout(() => {
        toast({
          title: "Exportación exitosa",
          description: `Se han exportado ${filteredProviders.length} proveedores a Excel.`,
        })
      }, 1000)
    } catch (error) {
      console.error("Error al exportar a Excel:", error)
      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los proveedores. Inténtelo de nuevo.",
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
              <Building className="h-5 w-5 text-blue-600" />
              Gestión de Proveedores
            </h1>
            <p className="text-gray-500 text-sm">Administre todos sus proveedores desde un solo lugar</p>
          </div>
          <div className="flex gap-2">
            <Link href="/proveedores/nuevo">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Proveedor
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
              placeholder="Buscar por nombre, contacto, email o teléfono..."
              onSearch={(value) => setSearchTerm(value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              <p className="ml-3 text-gray-600">Cargando proveedores...</p>
            </div>
          ) : (
            <ProvidersTable
              providers={filteredProviders}
              onDelete={handleDeleteProvider}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>
    </main>
  )
}
