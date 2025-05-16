"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Truck, Clock, Phone, MapPin, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface DeliveryInfoModalProps {
  orderId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeliveryInfoModal({
  orderId,
  isOpen,
  onClose,
}: DeliveryInfoModalProps) {
  const { toast } = useToast();
  const [deliveryInfo, setDeliveryInfo] = useState({
    address: "",
    phone: "",
    departureTime: new Date().toISOString().slice(0, 16),
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, you would save this to a database
    // For this demo, we'll save to localStorage

    const existingDeliveries = JSON.parse(
      localStorage.getItem("deliveries") || "{}"
    );

    existingDeliveries[orderId] = {
      ...deliveryInfo,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("deliveries", JSON.stringify(existingDeliveries));

    toast({
      title: "Información de entrega guardada",
      description: "Los datos de entrega han sido guardados correctamente.",
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Información de Entrega - Pedido #{orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Dirección de Entrega
            </Label>
            <Input
              id="address"
              name="address"
              placeholder="Av. Principal 123, Ciudad"
              value={deliveryInfo.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Teléfono del Cliente
            </Label>
            <Input
              id="phone"
              name="phone"
              placeholder="+51 999 888 777"
              value={deliveryInfo.phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departureTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Hora de Salida
            </Label>
            <Input
              id="departureTime"
              name="departureTime"
              type="datetime-local"
              value={deliveryInfo.departureTime}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              Notas Adicionales
            </Label>
            <Input
              id="notes"
              name="notes"
              placeholder="Instrucciones especiales para la entrega..."
              value={deliveryInfo.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Información
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
