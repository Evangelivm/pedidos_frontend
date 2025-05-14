"use client"

import { useState } from "react"
import { Building, Pencil, Trash2, Eye, ToggleLeft, ToggleRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Provider {
  id: string
  name: string
  category: string
  contact: string
  phone: string
  email: string
  address: string
  status: string
  createdAt: string
  notes?: string
}

interface ProvidersTableProps {
  providers: Provider[]
  onDelete: (id: string) => void
  onToggleStatus: (id: string) => void
}

export function ProvidersTable({ providers, onDelete, onToggleStatus }: ProvidersTableProps) {
  const { toast } = useToast()
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [providerToDelete, setProviderToDelete] = useState<Provider | null>(null)
  const [viewProvider, setViewProvider] = useState<Provider | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)

  const toggleSelectAll = () => {
    if (selectedProviders.length === providers.length) {
      setSelectedProviders([])
    } else {
      setSelectedProviders(providers.map((provider) => provider.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedProviders.includes(id)) {
      setSelectedProviders(selectedProviders.filter((providerId) => providerId !== id))
    } else {
      setSelectedProviders([...selectedProviders, id])
    }
  }

  const handleDeleteClick = (provider: Provider) => {
    setProviderToDelete(provider)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (providerToDelete) {
      onDelete(providerToDelete.id)
      setDeleteDialogOpen(false)
      setProviderToDelete(null)
    }
  }

  const handleViewProvider = (provider: Provider) => {
    setViewProvider(provider)
    setIsViewModalOpen(true)
  }

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Activo":
        return <Badge className="bg-green-500">Activo</Badge>
      case "Inactivo":
        return <Badge className="bg-red-500">Inactivo</Badge>
      default:
        return <Badge className="bg-gray-500">Desconocido</Badge>
    }
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm">
              <th className="p-3 w-10">
                <Checkbox
                  checked={selectedProviders.length === providers.length && providers.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Categoría</th>
              <th className="p-3">Contacto</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Email</th>
              <th className="p-3">Fecha de Registro</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {providers.length === 0 ? (
              <tr>
                <td colSpan={10} className="p-6 text-center text-gray-500 bg-white">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Building className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">No hay proveedores disponibles</p>
                    <p className="text-sm text-gray-400 mt-1">Haga clic en "Nuevo Proveedor" para agregar uno</p>
                  </div>
                </td>
              </tr>
            ) : (
              providers.map((provider, index) => (
                <tr
                  key={provider.id}
                  className={`${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedProviders.includes(provider.id)}
                      onCheckedChange={() => toggleSelect(provider.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3 font-medium">{provider.name}</td>
                  <td className="p-3">{provider.category}</td>
                  <td className="p-3">{provider.contact}</td>
                  <td className="p-3">{provider.phone || "-"}</td>
                  <td className="p-3">{provider.email || "-"}</td>
                  <td className="p-3">{formatDate(provider.createdAt)}</td>
                  <td className="p-3">{getStatusBadge(provider.status)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handleViewProvider(provider)}
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Link href={`/proveedores/nuevo?id=${provider.id}`}>
                        <Button size="icon" variant="ghost" className="btn-icon-success" title="Editar proveedor">
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-warning"
                        onClick={() => onToggleStatus(provider.id)}
                        title={provider.status === "Activo" ? "Desactivar proveedor" : "Activar proveedor"}
                      >
                        {provider.status === "Activo" ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-danger"
                        onClick={() => handleDeleteClick(provider)}
                        title="Eliminar proveedor"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de eliminar este proveedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El proveedor "{providerToDelete?.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Provider Details Modal */}
      {viewProvider && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Building className="h-5 w-5 text-blue-600" />
                Detalles del Proveedor
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">{viewProvider.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">{viewProvider.category}</Badge>
                  {getStatusBadge(viewProvider.status)}
                </div>
                <p className="text-sm text-gray-600">Registrado el {formatDate(viewProvider.createdAt)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Contacto:</div>
                <div>{viewProvider.contact}</div>

                <div className="font-medium">Teléfono:</div>
                <div>{viewProvider.phone || "No especificado"}</div>

                <div className="font-medium">Email:</div>
                <div>{viewProvider.email || "No especificado"}</div>

                <div className="font-medium">Dirección:</div>
                <div>{viewProvider.address || "No especificada"}</div>
              </div>

              {viewProvider.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium mb-1">Notas:</h4>
                  <p className="text-sm">{viewProvider.notes}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Cerrar
                </Button>
                <Link href={`/proveedores/nuevo?id=${viewProvider.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Proveedor
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
