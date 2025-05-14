"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowUpCircle, ArrowDownCircle, Search } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface DailyTransactionsTableProps {
  payments: any[]
  expenses: any[]
  isLoading: boolean
}

export function DailyTransactionsTable({ payments, expenses, isLoading }: DailyTransactionsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")

  // Combinar pagos y gastos
  const allTransactions = [
    ...payments.map((payment) => ({
      ...payment,
      time: new Date(payment.date).toLocaleTimeString(),
      formattedDate: new Date(payment.date).toLocaleDateString(),
    })),
    ...expenses.map((expense) => ({
      ...expense,
      type: "expense",
      time: new Date(expense.date).toLocaleTimeString(),
      formattedDate: new Date(expense.date).toLocaleDateString(),
    })),
  ]

  // Ordenar por fecha/hora (más reciente primero)
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Filtrar transacciones
  const filteredTransactions = allTransactions.filter((transaction) => {
    // Filtrar por tipo
    if (filterType !== "all" && transaction.type !== filterType) {
      return false
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        transaction.description.toLowerCase().includes(searchLower) ||
        (transaction.customerName && transaction.customerName.toLowerCase().includes(searchLower)) ||
        (transaction.category && transaction.category.toLowerCase().includes(searchLower))
      )
    }

    return true
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="ml-3 text-gray-600">Cargando transacciones...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar transacciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
            className={filterType === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            Todos
          </Button>
          <Button
            variant={filterType === "income" ? "default" : "outline"}
            onClick={() => setFilterType("income")}
            className={filterType === "income" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <ArrowUpCircle className="h-4 w-4 mr-2" />
            Ingresos
          </Button>
          <Button
            variant={filterType === "expense" ? "default" : "outline"}
            onClick={() => setFilterType("expense")}
            className={filterType === "expense" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            <ArrowDownCircle className="h-4 w-4 mr-2" />
            Gastos
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-3">Hora</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Descripción</th>
                <th className="p-3">Detalles</th>
                <th className="p-3 text-right">Monto</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No hay transacciones que coincidan con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction, index) => (
                  <tr
                    key={`${transaction.type}-${transaction.id}-${index}`}
                    className={`border-t hover:bg-gray-50 ${
                      transaction.type === "income" ? "hover:bg-green-50" : "hover:bg-red-50"
                    }`}
                  >
                    <td className="p-3 whitespace-nowrap">{transaction.time}</td>
                    <td className="p-3">
                      {transaction.type === "income" ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <ArrowUpCircle className="h-3 w-3 mr-1" />
                          Ingreso
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          <ArrowDownCircle className="h-3 w-3 mr-1" />
                          Gasto
                        </Badge>
                      )}
                    </td>
                    <td className="p-3">{transaction.description}</td>
                    <td className="p-3">
                      {transaction.type === "income" ? (
                        <span className="text-gray-600">{transaction.paymentMethod}</span>
                      ) : (
                        <span className="text-gray-600">{transaction.category}</span>
                      )}
                    </td>
                    <td className="p-3 text-right font-medium whitespace-nowrap">
                      <span className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-500">
        Mostrando {filteredTransactions.length} de {allTransactions.length} transacciones
      </div>
    </div>
  )
}
