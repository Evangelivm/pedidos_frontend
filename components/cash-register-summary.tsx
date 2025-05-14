"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDownCircle, ArrowUpCircle, DollarSign, TrendingDown, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CashRegisterSummaryProps {
  payments: any[]
  expenses: any[]
  date: Date
  isLoading: boolean
}

export function CashRegisterSummary({ payments, expenses, date, isLoading }: CashRegisterSummaryProps) {
  const [summaryData, setSummaryData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    cashIncome: 0,
    yapeIncome: 0,
    transferIncome: 0,
    expensesByCategory: {} as Record<string, number>,
  })

  useEffect(() => {
    if (!isLoading) {
      calculateSummary()
    }
  }, [payments, expenses, isLoading])

  const calculateSummary = () => {
    // Calcular ingresos totales y por método de pago
    const totalIncome = payments.reduce((sum, payment) => sum + payment.amount, 0)
    const cashIncome = payments.reduce((sum, payment) => sum + (payment.details.cash || 0), 0)
    const yapeIncome = payments.reduce((sum, payment) => sum + (payment.details.yape || 0), 0)
    const transferIncome = payments.reduce((sum, payment) => sum + (payment.details.transfer || 0), 0)

    // Calcular gastos totales y por categoría
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    // Agrupar gastos por categoría
    const expensesByCategory = expenses.reduce((categories: Record<string, number>, expense) => {
      const category = expense.category
      if (!categories[category]) {
        categories[category] = 0
      }
      categories[category] += expense.amount
      return categories
    }, {})

    // Calcular balance
    const balance = totalIncome - totalExpenses

    setSummaryData({
      totalIncome,
      totalExpenses,
      balance,
      cashIncome,
      yapeIncome,
      transferIncome,
      expensesByCategory,
    })
  }

  // Formatear fecha para mostrar correctamente
  const formattedDate = date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Añadir un mensaje cuando no hay datos
  const noDataMessage = (
    <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200 mt-4">
      <p className="text-gray-500">No hay datos de caja para el {formattedDate}</p>
      <p className="text-sm text-gray-400 mt-1">Selecciona otra fecha o registra transacciones para este día</p>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="ml-3 text-gray-600">Cargando datos...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-2">Resumen de Caja - {formattedDate}</h2>
        <p className="text-gray-500 text-sm mb-6">Resumen de todos los ingresos y gastos registrados en el día</p>

        {payments.length === 0 && expenses.length === 0 ? (
          noDataMessage
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Ingresos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatCurrency(summaryData.totalIncome)}</div>
                    <ArrowUpCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{payments.length} transacciones de ingreso</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Gastos Totales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{formatCurrency(summaryData.totalExpenses)}</div>
                    <ArrowDownCircle className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{expenses.length} transacciones de gasto</p>
                </CardContent>
              </Card>

              <Card className={`border-l-4 ${summaryData.balance >= 0 ? "border-l-blue-500" : "border-l-red-500"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Balance del Día</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`flex items-center justify-between`}>
                    <div
                      className={`text-2xl font-bold ${summaryData.balance >= 0 ? "text-blue-600" : "text-red-600"}`}
                    >
                      {formatCurrency(summaryData.balance)}
                    </div>
                    {summaryData.balance >= 0 ? (
                      <TrendingUp className="h-6 w-6 text-blue-500" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {summaryData.balance >= 0 ? "Balance positivo" : "Balance negativo"}
                  </p>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ingresos por Método de Pago</CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No hay ingresos registrados para esta fecha</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-md">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                    <span>Efectivo</span>
                  </div>
                  <span className="font-bold">{formatCurrency(summaryData.cashIncome)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-md">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-purple-600 mr-2" />
                    <span>Yape</span>
                  </div>
                  <span className="font-bold">{formatCurrency(summaryData.yapeIncome)}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-md">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                    <span>Transferencia</span>
                  </div>
                  <span className="font-bold">{formatCurrency(summaryData.transferIncome)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {expenses.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No hay gastos registrados para esta fecha</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(summaryData.expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between p-3 bg-red-50 rounded-md">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                      <span>{category}</span>
                    </div>
                    <span className="font-bold">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
