"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowDownCircle, Receipt } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ExpenseFormProps {
  onAddExpense: (expense: any) => void
  date: Date
}

export function ExpenseForm({ onAddExpense, date }: ExpenseFormProps) {
  const { toast } = useToast()
  const [expenseData, setExpenseData] = useState({
    amount: "",
    category: "",
    description: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Categorías de gastos predefinidas
  const expenseCategories = [
    "Servicios",
    "Suministros",
    "Transporte",
    "Mantenimiento",
    "Salarios",
    "Impuestos",
    "Alquiler",
    "Marketing",
    "Otros",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Validar que el monto sea un número válido
    if (name === "amount") {
      // Permitir solo números y punto decimal
      if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
        setExpenseData((prev) => ({ ...prev, [name]: value }))
      }
    } else {
      setExpenseData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (value: string) => {
    setExpenseData((prev) => ({ ...prev, category: value }))
  }

  // Actualizar el formulario de gastos para usar la fecha seleccionada
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar campos requeridos
      if (!expenseData.amount || !expenseData.category || !expenseData.description) {
        throw new Error("Por favor complete todos los campos requeridos")
      }

      // Validar que el monto sea mayor que cero
      const amount = Number.parseFloat(expenseData.amount)
      if (isNaN(amount) || amount <= 0) {
        throw new Error("El monto debe ser mayor que cero")
      }

      // Crear objeto de gasto con la fecha seleccionada
      const expenseDate = new Date(date)
      // Establecer la hora actual pero mantener la fecha seleccionada
      const now = new Date()
      expenseDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds())

      const newExpense = {
        id: `expense-${Date.now()}`,
        type: "expense",
        date: expenseDate.toISOString(),
        amount: amount,
        category: expenseData.category,
        description: expenseData.description,
        notes: expenseData.notes,
      }

      // Llamar a la función para añadir el gasto
      onAddExpense(newExpense)

      // Limpiar el formulario
      setExpenseData({
        amount: "",
        category: "",
        description: "",
        notes: "",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ha ocurrido un error al registrar el gasto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownCircle className="h-5 w-5 text-red-500" />
            Registrar Nuevo Gasto
          </CardTitle>
          <CardDescription>Complete el formulario para registrar un nuevo gasto en la caja chica</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">S/.</span>
                  <Input
                    id="amount"
                    name="amount"
                    placeholder="0.00"
                    className="pl-10"
                    value={expenseData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Select value={expenseData.category} onValueChange={handleSelectChange} required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                name="description"
                placeholder="Ej: Compra de útiles de oficina"
                value={expenseData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Detalles adicionales sobre el gasto..."
                value={expenseData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700 flex items-start gap-2">
              <Receipt className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Recomendación:</p>
                <p>
                  Guarde todos los comprobantes físicos de gastos para mantener un registro adecuado y facilitar la
                  conciliación de caja.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Registrando...
                  </>
                ) : (
                  <>
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Registrar Gasto
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
