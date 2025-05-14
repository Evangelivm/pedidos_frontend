"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { TopBar } from "@/components/top-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Building } from "lucide-react"
import Link from "next/link"

export default function NewProviderPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [providerData, setProviderData] = useState({
    name: "",
    category: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [providerId, setProviderId] = useState<string | null>(null)

  // Categorías predefinidas
  const categories = [
    "Abarrotes",
    "Bebidas",
    "Electrónicos",
    "Limpieza",
    "Papelería",
    "Perecederos",
    "Servicios",
    "Otros",
  ]

  useEffect(() => {
    // Verificar si estamos editando un proveedor existente
    const checkIfEditing = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const id = searchParams.get("id")

      if (id) {
        setProviderId(id)
        setIsEditing(true)

        // Cargar datos del proveedor
        const storedProviders = JSON.parse(localStorage.getItem("providers") || "[]")
        const provider = storedProviders.find((p: any) => p.id === id)

        if (provider) {
          setProviderData({
            name: provider.name || "",
            category: provider.category || "",
            contact: provider.contact || "",
            phone: provider.phone || "",
            email: provider.email || "",
            address: provider.address || "",
            notes: provider.notes || "",
          })
        }
      }
    }

    checkIfEditing()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProviderData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProviderData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!providerData.name || !providerData.category || !providerData.contact) {
        throw new Error("Por favor complete los campos requeridos: Nombre, Categoría y Contacto")
      }

      // Obtener proveedores existentes
      const storedProviders = JSON.parse(localStorage.getItem("providers") || "[]")

      if (isEditing && providerId) {
        // Actualizar proveedor existente
        const updatedProviders = storedProviders.map((provider: any) => {
          if (provider.id === providerId) {
            return {
              ...provider,
              ...providerData,
              updatedAt: new Date().toISOString(),
            }
          }
          return provider
        })

        localStorage.setItem("providers", JSON.stringify(updatedProviders))

        toast({
          title: "Proveedor actualizado",
          description: `El proveedor "${providerData.name}" ha sido actualizado correctamente.`,
        })
      } else {
        // Crear nuevo proveedor
        const newProvider = {
          id: `prov-${Date.now()}`,
          ...providerData,
          status: "Activo",
          createdAt: new Date().toISOString(),
        }

        localStorage.setItem("providers", JSON.stringify([...storedProviders, newProvider]))

        toast({
          title: "Proveedor creado",
          description: `El proveedor "${providerData.name}" ha sido creado correctamente.`,
        })
      }

      // Redireccionar a la lista de proveedores
      router.push("/proveedores")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar el proveedor",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/proveedores">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              {isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre del Proveedor *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={providerData.name}
                    onChange={handleChange}
                    placeholder="Ej: Distribuidora Nacional S.A."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={providerData.category}
                    onValueChange={(value) => handleSelectChange("category", value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="Otra">Otra Categoría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {providerData.category === "Otra" && (
                  <div>
                    <Label htmlFor="newCategory">Nueva Categoría *</Label>
                    <Input
                      id="newCategory"
                      name="newCategory"
                      value=""
                      onChange={(e) => handleSelectChange("category", e.target.value)}
                      placeholder="Ej: Materiales de Construcción"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="contact">Persona de Contacto *</Label>
                  <Input
                    id="contact"
                    name="contact"
                    value={providerData.contact}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={providerData.phone}
                    onChange={handleChange}
                    placeholder="Ej: 999-888-777"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={providerData.email}
                    onChange={handleChange}
                    placeholder="Ej: contacto@empresa.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Input
                    id="address"
                    name="address"
                    value={providerData.address}
                    onChange={handleChange}
                    placeholder="Ej: Av. Principal 123, Ciudad"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                name="notes"
                value={providerData.notes}
                onChange={handleChange}
                placeholder="Información adicional sobre el proveedor..."
                className="h-32"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href="/proveedores">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Proveedor" : "Guardar Proveedor"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
