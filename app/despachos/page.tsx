"use client"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { SearchBar } from "@/components/search-bar"
import { DispatchesTable } from "@/components/dispatches-table"
import { Button } from "@/components/ui/button"
import { Download, Filter, Truck, X, Calendar, MapPin, TruckIcon, User } from "lucide-react"
import { exportDispatchesToExcel } from "@/lib/export-utils"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

export default function DispatchesPage() {
  const [dispatches, setDispatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  // Estado para controlar la visibilidad del panel de filtros
  const [showFilters, setShowFilters] = useState(false)

  // Estados para los filtros
  const [statusFilter, setStatusFilter] = useState("")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [zoneFilter, setZoneFilter] = useState("")
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("")
  const [courierFilter, setCourierFilter] = useState("")

  // Contador de filtros activos
  const getActiveFiltersCount = () => {
    let count = 0
    if (statusFilter) count++
    if (startDate) count++
    if (endDate) count++
    if (zoneFilter) count++
    if (deliveryTypeFilter) count++
    if (courierFilter) count++
    return count
  }

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setStatusFilter("")
    setStartDate(undefined)
    setEndDate(undefined)
    setZoneFilter("")
    setDeliveryTypeFilter("")
    setCourierFilter("")
  }

  // Aplicar filtros
  const applyFilters = () => {
    toast({
      title: "Filtros aplicados",
      description: `Se han aplicado ${getActiveFiltersCount()} filtros a los despachos.`,
    })
    setShowFilters(false)
  }

  useEffect(() => {
    // Load dispatches from localStorage
    const storedDispatches = localStorage.getItem("dispatches")
    if (storedDispatches) {
      const dispatchesObj = JSON.parse(storedDispatches)
      // Convert object to array
      const dispatchesArray = Object.keys(dispatchesObj).map((key) => ({
        ...dispatchesObj[key],
        id: key,
      }))
      setDispatches(dispatchesArray)
    }
    setLoading(false)
  }, [])

  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      if (dispatches.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay despachos disponibles para exportar.",
          variant: "destructive",
        })
        return
      }

      // Exportar los despachos
      exportDispatchesToExcel(dispatches)

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${dispatches.length} despachos a Excel.`,
      })
    } catch (error) {
      console.error("Error al exportar a Excel:", error)

      toast({
        title: "Error de exportación",
        description: "No se pudieron exportar los despachos. Inténtelo de nuevo.",
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
              <Truck className="h-5 w-5 text-green-600" />
              Gestión de Despachos
            </h1>
            <p className="text-gray-500 text-sm">Administre y realice seguimiento a todos sus despachos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-300" onClick={handleExportToExcel}>
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <SearchBar placeholder="Buscar por cliente, dirección o estado..." />
          <div className="relative">
            <Button
              variant={getActiveFiltersCount() > 0 ? "default" : "outline"}
              className={cn(
                "whitespace-nowrap",
                getActiveFiltersCount() > 0 ? "bg-blue-600 hover:bg-blue-700" : "border-gray-300",
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
            </Button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[340px] sm:w-[500px] animate-in fade-in-0 zoom-in-95">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">Filtros de Despachos</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  {/* Estado del despacho */}
                  <div>
                    <Label htmlFor="status" className="flex items-center gap-2 mb-1.5">
                      <div className="bg-orange-100 p-1 rounded-full">
                        <TruckIcon className="h-3.5 w-3.5 text-orange-600" />
                      </div>
                      Estado
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en-ruta">En ruta</SelectItem>
                        <SelectItem value="entregado">Entregado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zona de entrega */}
                  <div>
                    <Label htmlFor="zone" className="flex items-center gap-2 mb-1.5">
                      <div className="bg-green-100 p-1 rounded-full">
                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      Zona de entrega
                    </Label>
                    <Input
                      id="zone"
                      placeholder="Ej: Miraflores, San Isidro"
                      value={zoneFilter}
                      onChange={(e) => setZoneFilter(e.target.value)}
                    />
                  </div>

                  {/* Fecha desde */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1.5">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      Fecha desde
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !startDate && "text-muted-foreground",
                          )}
                        >
                          {startDate ? format(startDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Fecha hasta */}
                  <div>
                    <Label className="flex items-center gap-2 mb-1.5">
                      <div className="bg-blue-100 p-1 rounded-full">
                        <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      </div>
                      Fecha hasta
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !endDate && "text-muted-foreground",
                          )}
                        >
                          {endDate ? format(endDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Tipo de entrega */}
                  <div>
                    <Label htmlFor="deliveryType" className="flex items-center gap-2 mb-1.5">
                      <div className="bg-purple-100 p-1 rounded-full">
                        <TruckIcon className="h-3.5 w-3.5 text-purple-600" />
                      </div>
                      Tipo de entrega
                    </Label>
                    <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
                      <SelectTrigger id="deliveryType" className="w-full">
                        <SelectValue placeholder="Todos los tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los tipos</SelectItem>
                        <SelectItem value="estandar">Estándar</SelectItem>
                        <SelectItem value="express">Express</SelectItem>
                        <SelectItem value="programado">Programado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Repartidor */}
                  <div>
                    <Label htmlFor="courier" className="flex items-center gap-2 mb-1.5">
                      <div className="bg-red-100 p-1 rounded-full">
                        <User className="h-3.5 w-3.5 text-red-600" />
                      </div>
                      Repartidor
                    </Label>
                    <Input
                      id="courier"
                      placeholder="Nombre del repartidor"
                      value={courierFilter}
                      onChange={(e) => setCourierFilter(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Limpiar filtros
                  </Button>
                  <Button onClick={applyFilters}>Aplicar filtros</Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-auto flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="ml-3 text-gray-600">Cargando despachos...</p>
            </div>
          ) : (
            <DispatchesTable dispatches={dispatches} />
          )}
        </div>
      </div>
    </main>
  )
}
