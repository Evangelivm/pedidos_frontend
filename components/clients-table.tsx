"use client";

import { useState } from "react";
import {
  Users,
  Pencil,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import connections, { Cliente } from "@/data/connections";

interface ClientsTableProps {
  clients: Cliente[];
  onDelete: (id: number) => void;
  onToggleStatus: (id: number) => void;
}

export function ClientsTable({
  clients,
  onDelete,
  onToggleStatus,
}: ClientsTableProps) {
  const { toast } = useToast();

  const [selectedClients, setSelectedClients] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Cliente | null>(null);
  const [viewClient, setViewClient] = useState<Cliente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map((c) => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter((i) => i !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const handleDeleteClick = (client: Cliente) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      // Llamada al backend para eliminar cliente
      await connections.clientes.delete(clientToDelete.id);

      // Notificar eliminación exitosa
      toast({
        title: "Cliente eliminado",
        description: `"${clientToDelete.nombre}" ha sido eliminado correctamente.`,
      });

      // Actualizar estado local
      onDelete(clientToDelete.id);
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el cliente.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const handleViewClient = (client: Cliente) => {
    setViewClient(client);
    setIsViewModalOpen(true);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return "Fecha no disponible";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "Fecha inválida";
    return dateObj.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (activo: boolean) => {
    return activo ? (
      <Badge className="bg-green-500">Activo</Badge>
    ) : (
      <Badge className="bg-red-500">Inactivo</Badge>
    );
  };

  return (
    <>
      <div className="w-full overflow-x-auto rounded-lg shadow-sm">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium text-sm">
              <th className="p-3 w-10">
                <Checkbox
                  checked={
                    selectedClients.length === clients.length &&
                    clients.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Nombre / Razón Social</th>
              <th className="p-3">Tipo de Documento</th>
              <th className="p-3">Número de Documento</th>
              <th className="p-3">Teléfono</th>
              <th className="p-3">Email</th>
              <th className="p-3">Dirección</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Opciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="p-6 text-center text-gray-500 bg-white"
                >
                  <div className="flex flex-col items-center justify-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-lg font-medium">
                      No hay clientes disponibles
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Haga clic en "Nuevo Cliente" para agregar uno
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              clients.map((client, index) => (
                <tr
                  key={client.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50 transition-colors duration-150`}
                >
                  <td className="p-3">
                    <Checkbox
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleSelect(client.id)}
                    />
                  </td>
                  <td className="p-3 font-medium">{index + 1}</td>
                  <td className="p-3 font-medium">{client.nombre}</td>
                  <td className="p-3">
                    <span className="font-medium text-blue-700">
                      {client.tipo_documento}
                    </span>
                  </td>
                  <td className="p-3">{client.numero_documento}</td>
                  <td className="p-3">{client.telefono || "-"}</td>
                  <td className="p-3">{client.email || "-"}</td>
                  <td className="p-3">{client.direccion || "-"}</td>
                  <td className="p-3">{getStatusBadge(client.activo)}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-primary"
                        onClick={() => handleViewClient(client)}
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      <Link href={`/clientes/nuevo?id=${client.id}`}>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="btn-icon-success"
                          title="Editar cliente"
                        >
                          <Pencil className="h-5 w-5" />
                        </Button>
                      </Link>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-warning"
                        onClick={() => onToggleStatus(client.id)}
                        title={
                          client.activo
                            ? "Desactivar cliente"
                            : "Activar cliente"
                        }
                      >
                        {client.activo ? (
                          <ToggleRight className="h-5 w-5" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="btn-icon-danger"
                        onClick={() => handleDeleteClick(client)}
                        title="Eliminar cliente"
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

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de eliminar este cliente?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El cliente "
              {clientToDelete?.nombre}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de detalles del cliente */}
      {viewClient && (
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-blue-600" />
                Detalles del Cliente
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-md">
                <h3 className="font-semibold text-lg mb-2 text-blue-700">
                  {viewClient.nombre}
                </h3>
                <div className="flex items-center gap-2 mb-2">
                  {getStatusBadge(viewClient.activo)}
                </div>
                <p className="text-sm text-gray-600">
                  Registrado el {formatDate(viewClient.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Documento:</div>
                <div>{viewClient.numero_documento}</div>
                <div className="font-medium">Teléfono:</div>
                <div>{viewClient.telefono || "No especificado"}</div>
                <div className="font-medium">Email:</div>
                <div>{viewClient.email || "No especificado"}</div>
                <div className="font-medium">Dirección:</div>
                <div>{viewClient.direccion || "No especificada"}</div>
              </div>
              {viewClient.notas && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <h4 className="font-medium mb-1">Notas:</h4>
                  <p className="text-sm">{viewClient.notas}</p>
                </div>
              )}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Cerrar
                </Button>
                <Link href={`/clientes/nuevo?id=${viewClient.id}`}>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar Cliente
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
