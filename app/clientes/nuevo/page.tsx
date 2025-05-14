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
import { ArrowLeft, Save, Users } from "lucide-react"
import Link from "next/link"

export default function NewClientPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [clientData, setClientData] = useState({
    name: "",
    ruc: "",
    type: "Persona",
    documentType: "DNI",
    documentNumber: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si estamos editando un cliente existente
    const checkIfEditing = () => {
      const searchParams = new URLSearchParams(window.location.search)
      const id = searchParams.get("id")

      if (id) {
        setClientId(id)
        setIsEditing(true)

        // Cargar datos del cliente
        const storedClients = JSON.parse(localStorage.getItem("clients") || "[]")
        const client = storedClients.find((c: any) => c.id === id)

        if (client) {
          setClientData({
            name: client.name || "",
            ruc: client.ruc || "",
            type: client.type || "Persona",
            documentType: client.documentType || "DNI",
            documentNumber: client.documentNumber || "",
            phone: client.phone || "",
            email: client.email || "",
            address: client.address || "",
            notes: client.notes || "",
          })
        }
      }
    }

    checkIfEditing()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setClientData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setClientData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!clientData.name) {
        throw new Error("Por favor complete el campo Nombre / Razón Social")
      }

      // Validar RUC si se proporciona
      if (clientData.ruc && !/^\d{11}$/.test(clientData.ruc)) {
        throw new Error("El RUC debe tener 11 dígitos numéricos")
      }

      // Validar formato de documento según tipo
      if (
        clientData.documentType === "DNI" &&
        clientData.documentNumber &&
        !/^\d{8}$/.test(clientData.documentNumber)
      ) {
        throw new Error("El DNI debe tener 8 dígitos numéricos")
      }

      if (
        clientData.documentType === "RUC" &&
        clientData.documentNumber &&
        !/^\d{11}$/.test(clientData.documentNumber)
      ) {
        throw new Error("El RUC debe tener 11 dígitos numéricos")
      }

      // Validar formato de email si se proporciona
      if (clientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)) {
        throw new Error("El formato del correo electrónico no es válido")
      }

      // Obtener clientes existentes
      const storedClients = JSON.parse(localStorage.getItem("clients") || "[]")

      if (isEditing && clientId) {
        // Actualizar cliente existente
        const updatedClients = storedClients.map((client: any) => {
          if (client.id === clientId) {
            return {
              ...client,
              ...clientData,
              updatedAt: new Date().toISOString(),
            }
          }
          return client
        })

        localStorage.setItem("clients", JSON.stringify(updatedClients))

        toast({
          title: "Cliente actualizado",
          description: `El cliente "${clientData.name}" ha sido actualizado correctamente.`,
        })
      } else {
        // Crear nuevo cliente
        const newClient = {
          id: `client-${Date.now()}`,
          ...clientData,
          status: "Activo",
          createdAt: new Date().toISOString(),
        }

        localStorage.setItem("clients", JSON.stringify([...storedClients, newClient]))

        toast({
          title: "Cliente creado",
          description: `El cliente "${clientData.name}" ha sido creado correctamente.`,
        })
      }

      // Redireccionar a la lista de clientes
      router.push("/clientes")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al guardar el cliente",
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
            <Link href="/clientes">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              {isEditing ? "Editar Cliente" : "Nuevo Cliente"}
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre / Razón Social *</Label>
                    <Input
                      id="name"
                      name="name"
                      value={clientData.name}
                      onChange={handleChange}
                      placeholder="Ej: Juan Pérez o Empresa S.A.C."
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="ruc">RUC</Label>
                    <Input
                      id="ruc"
                      name="ruc"
                      value={clientData.ruc}
                      onChange={handleChange}
                      placeholder="Ej: 20123456789"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      El RUC debe tener 11 dígitos. Para empresas comienza con 20
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Tipo de Cliente *</Label>
                  <Select value={clientData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Persona">Persona Natural</SelectItem>
                      <SelectItem value="Empresa">Empresa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  <Select
                    value={clientData.documentType}
                    onValueChange={(value) => handleSelectChange("documentType", value)}
                  >
                    <SelectTrigger id="documentType">
                      <SelectValue placeholder="Seleccionar tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input
                    id="documentNumber"
                    name="documentNumber"
                    value={clientData.documentNumber}
                    onChange={handleChange}
                    placeholder={clientData.documentType === "DNI" ? "Ej: 45678912" : "Ej: AE123456"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {clientData.documentType === "DNI" ? "El DNI debe tener 8 dígitos" : ""}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={clientData.phone}
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
                    value={clientData.email}
                    onChange={handleChange}
                    placeholder="Ej: cliente@example.com"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Dirección</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={clientData.address}
                    onChange={handleChange}
                    placeholder="Ej: Av. Principal 123, Distrito, Ciudad"
                    className="h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Incluya calle, número, distrito y ciudad para facilitar entregas
                  </p>
                </div>

                <div>
                  <Label htmlFor="notes">Notas Adicionales</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={clientData.notes}
                    onChange={handleChange}
                    placeholder="Información adicional sobre el cliente..."
                    className="h-24"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href="/clientes">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Guardando..." : isEditing ? "Actualizar Cliente" : "Guardar Cliente"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
