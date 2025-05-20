"use client";
import type React from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Users } from "lucide-react";
import Link from "next/link";
// Importamos Cliente y connections
import connections, { Cliente } from "@/data/connections";

export default function NewClientPage() {
  const { toast } = useToast();
  const router = useRouter();

  // Estado inicial basado en la interfaz Cliente
  const [clientData, setClientData] = useState<Partial<Cliente>>({
    nombre: "",
    tipo_documento: "DNI",
    numero_documento: "",
    telefono: "",
    email: "",
    direccion: "",
    activo: true,
    created_at: new Date(),
    notas: "",
  });

  const [initialData, setInitialData] = useState<Partial<Cliente>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos si estamos editando
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const idParam = searchParams.get("id");
    if (idParam) {
      const id = parseInt(idParam, 10);
      setIsEditing(true);
      setClientId(id);
      connections.clientes
        .getById(id)
        .then((response) => {
          const data = response.data;
          setClientData({
            ...data,
            created_at: new Date(data.created_at),
          });
          setInitialData({
            ...data,
            created_at: new Date(data.created_at),
          });
        })
        .catch((error) => {
          console.error("Error al obtener cliente:", error);
          toast({
            title: "Error",
            description: "No se pudo cargar la información del cliente.",
            variant: "destructive",
          });
          router.push("/clientes");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [router, toast]);

  // Manejar cambios en inputs
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio en selects
  const handleSelectChange = (name: string, value: string) => {
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar estado activo/inactivo
  const handleToggleStatus = (e: ChangeEvent<HTMLInputElement>) => {
    const isActive = e.target.checked;
    setClientData((prev) => ({ ...prev, activo: isActive }));
  };

  // Validación y envío
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!clientData.nombre?.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingrese un nombre válido.",
        variant: "destructive",
      });
      return;
    }

    // Si no es 'SD', validar número de documento
    if (
      clientData.tipo_documento !== "SD" &&
      !clientData.numero_documento?.trim()
    ) {
      toast({
        title: "Error",
        description: "Por favor ingrese un número de documento válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar DNI o RUC solo si fue modificado
    if (
      initialData.numero_documento !== clientData.numero_documento &&
      clientData.numero_documento?.trim()
    ) {
      if (
        clientData.tipo_documento === "DNI" &&
        clientData.numero_documento.length !== 8
      ) {
        toast({
          title: "Formato inválido",
          description: "El DNI debe tener 8 dígitos.",
          variant: "destructive",
        });
        return;
      }
      if (
        clientData.tipo_documento === "RUC" &&
        clientData.numero_documento.length !== 11
      ) {
        toast({
          title: "Formato inválido",
          description: "El RUC debe tener 11 dígitos.",
          variant: "destructive",
        });
        return;
      }
    }

    // Validar correo solo si fue modificado
    if (
      initialData.email !== clientData.email &&
      clientData.email?.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientData.email)
    ) {
      toast({
        title: "Correo no válido",
        description: "Por favor ingrese un correo electrónico válido.",
        variant: "destructive",
      });
      return;
    }

    const finalData = {
      ...clientData,
      numero_documento:
        clientData.tipo_documento === "SD"
          ? ""
          : clientData.numero_documento || "",
    };

    try {
      if (isEditing && clientId !== null) {
        await connections.clientes.update(clientId, finalData);
        toast({
          title: "Cliente actualizado",
          description: `"${finalData.nombre}" ha sido actualizado correctamente.`,
        });
      } else {
        const createData = {
          ...finalData,
          created_at: new Date(),
        } as Omit<Cliente, "id">;

        const response = await connections.clientes.create(createData);
        const newClient = response.data;
        toast({
          title: "Cliente creado",
          description: `"${newClient.nombre}" ha sido agregado correctamente.`,
        });
      }

      setTimeout(() => {
        router.push("/clientes");
      }, 500);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el cliente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Cargando información...</p>
      </main>
    );
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
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre / Razón Social *</Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    value={clientData.nombre || ""}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez o Empresa S.A.C."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                  <Select
                    value={clientData.tipo_documento || "DNI"}
                    onValueChange={(value) =>
                      handleSelectChange("tipo_documento", value)
                    }
                  >
                    <SelectTrigger id="tipo_documento">
                      <SelectValue placeholder="Seleccionar tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="CE">Carnet de Extranjería</SelectItem>
                      <SelectItem value="SD">Sin Documento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="numero_documento">Número de Documento</Label>
                  <Input
                    id="numero_documento"
                    name="numero_documento"
                    value={clientData.numero_documento || ""}
                    onChange={handleChange}
                    placeholder={
                      clientData.tipo_documento === "DNI"
                        ? "Ej: 45678912"
                        : clientData.tipo_documento === "RUC"
                        ? "Ej: 20123456789"
                        : clientData.tipo_documento === "SD"
                        ? "No es necesario"
                        : "Campo opcional"
                    }
                    disabled={clientData.tipo_documento === "SD"}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {clientData.tipo_documento === "DNI"
                      ? "El DNI debe tener 8 dígitos"
                      : clientData.tipo_documento === "RUC"
                      ? "El RUC debe tener 11 dígitos"
                      : clientData.tipo_documento === "SD"
                      ? "Este cliente no requiere documento"
                      : "Campo opcional"}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    value={clientData.telefono || ""}
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
                    value={clientData.email || ""}
                    onChange={handleChange}
                    placeholder="Ej: cliente@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    name="direccion"
                    value={clientData.direccion || ""}
                    onChange={handleChange}
                    placeholder="Ej: Av. Principal 123, Distrito, Ciudad"
                    className="h-20"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Incluya calle, número, distrito y ciudad para facilitar
                    entregas
                  </p>
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                name="notas"
                value={clientData.notas || ""}
                onChange={handleChange}
                placeholder="Información adicional sobre el cliente..."
                className="h-24"
              />
            </div>

            {/* Checkbox de estado activo/inactivo (solo en modo edición) */}
            {isEditing && (
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={clientData.activo ?? true}
                  onChange={handleToggleStatus}
                  className="h-4 w-4"
                />
                <Label htmlFor="activo">Activo</Label>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href="/clientes">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Actualizar Cliente" : "Guardar Cliente"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
