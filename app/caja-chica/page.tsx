"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { CashRegisterSummary } from "@/components/cash-register-summary";
import { ExpenseForm } from "@/components/expense-form";
import { DailyTransactionsTable } from "@/components/daily-transactions-table";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Printer,
  BarChart3,
  DollarSign,
  Calendar,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { exportCashRegisterToExcel } from "@/lib/export-utils";

export default function CashRegisterPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [payments, setPayments] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");

  // Inicializar con la fecha actual al cargar
  useEffect(() => {
    const today = new Date();
    setSelectedDate(today);
  }, []);

  // Cargar datos al iniciar o cambiar la fecha
  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Corregir la función loadData para asegurar que el filtrado por fecha funcione correctamente
  const loadData = () => {
    setLoading(true);

    try {
      // Formatear la fecha seleccionada para comparaciones
      // Crear fechas de inicio y fin del día seleccionado para comparar correctamente
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      // Cargar pagos desde localStorage
      const storedOrders = localStorage.getItem("orders");
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);

        // Filtrar solo los pagos del día seleccionado
        const paymentsData = orders
          .filter((order: any) => {
            if (!order.paymentDetails || !order.paymentDetails.date)
              return false;
            const paymentDate = new Date(order.paymentDetails.date);
            return paymentDate >= startOfDay && paymentDate <= endOfDay;
          })
          .map((order: any) => ({
            id: order.id,
            type: "income",
            date: order.paymentDetails.date,
            description: `Pago de pedido #${order.numero}`,
            customerName:
              order.paymentDetails.customerName ||
              `Cliente de Pedido #${order.numero}`,
            amount: order.paymentDetails.totalPaid || 0,
            paymentMethod: getPaymentMethodsDescription(order.paymentDetails),
            details: {
              cash: order.paymentDetails.cash || 0,
              yape: order.paymentDetails.yape || 0,
              transfer: order.paymentDetails.transfer || 0,
            },
          }));

        setPayments(paymentsData);
      } else {
        setPayments([]);
      }

      // Cargar gastos desde localStorage
      const storedExpenses = localStorage.getItem("expenses");
      if (storedExpenses) {
        const allExpenses = JSON.parse(storedExpenses);

        // Filtrar solo los gastos del día seleccionado
        const filteredExpenses = allExpenses.filter((expense: any) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= startOfDay && expenseDate <= endOfDay;
        });

        setExpenses(filteredExpenses);
      } else {
        setExpenses([]);
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      toast({
        title: "Error al cargar datos",
        description:
          "No se pudieron cargar los datos para la fecha seleccionada.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener descripción de métodos de pago
  const getPaymentMethodsDescription = (paymentDetails: any) => {
    const methods = [];
    if (paymentDetails.cash > 0) methods.push("Efectivo");
    if (paymentDetails.yape > 0) methods.push("Yape");
    if (paymentDetails.transfer > 0) methods.push("Transferencia");
    return methods.join(", ");
  };

  // Función para manejar la adición de un nuevo gasto
  const handleAddExpense = (newExpense: any) => {
    // Añadir el nuevo gasto a la lista
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);

    // Guardar en localStorage
    const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    localStorage.setItem(
      "expenses",
      JSON.stringify([...storedExpenses, newExpense])
    );

    toast({
      title: "Gasto registrado",
      description:
        "El gasto ha sido registrado correctamente en la caja chica.",
    });
  };

  // Función para exportar a Excel
  const handleExportToExcel = () => {
    try {
      const transactions = [...payments, ...expenses];

      if (transactions.length === 0) {
        toast({
          title: "No hay datos para exportar",
          description: "No hay transacciones disponibles para exportar.",
          variant: "destructive",
        });
        return;
      }

      // Exportar las transacciones
      exportCashRegisterToExcel(transactions, selectedDate);

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${transactions.length} transacciones a Excel.`,
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);
      toast({
        title: "Error de exportación",
        description:
          "No se pudieron exportar las transacciones. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  // Función para imprimir el reporte
  const handlePrintReport = () => {
    try {
      const transactions = [...payments, ...expenses];

      if (transactions.length === 0) {
        toast({
          title: "No hay datos para imprimir",
          description: "No hay transacciones disponibles para imprimir.",
          variant: "destructive",
        });
        return;
      }

      // Crear una ventana de impresión
      const printWindow = window.open("", "_blank", "width=800,height=600");

      if (!printWindow) {
        toast({
          title: "Error de impresión",
          description:
            "No se pudo abrir la ventana de impresión. Verifique que los popups estén permitidos.",
          variant: "destructive",
        });
        return;
      }

      // Calcular totales
      const totalIncome = payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      );
      const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );
      const balance = totalIncome - totalExpenses;

      // Formatear fecha
      const formattedDate = selectedDate.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // Escribir el contenido a la nueva ventana
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Reporte de Caja Chica - ${formattedDate}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                font-size: 14px;
              }
              .report {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
              }
              .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
              }
              .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              .subtitle {
                font-size: 16px;
                color: #555;
              }
              .summary {
                margin: 20px 0;
                padding: 15px;
                background-color: #f9f9f9;
                border: 1px solid #eee;
                border-radius: 5px;
              }
              .summary-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
              }
              .summary-label {
                font-weight: bold;
              }
              .summary-value {
                text-align: right;
              }
              .balance {
                font-size: 18px;
                font-weight: bold;
                padding-top: 10px;
                border-top: 1px solid #ddd;
              }
              .positive {
                color: #22c55e;
              }
              .negative {
                color: #ef4444;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .section-title {
                font-size: 18px;
                font-weight: bold;
                margin: 20px 0 10px 0;
                padding-bottom: 5px;
                border-bottom: 1px solid #ddd;
              }
              .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #777;
              }
              @media print {
                body {
                  padding: 0;
                }
                .report {
                  border: none;
                }
                .no-print {
                  display: none;
                }
              }
            </style>
          </head>
          <body>
            <div class="report">
              <div class="header">
                <div class="title">REPORTE DE CAJA CHICA</div>
                <div class="subtitle">TIENDA ACME</div>
                <div class="subtitle">${formattedDate}</div>
              </div>
              
              <div class="summary">
                <div class="summary-row">
                  <div class="summary-label">Total Ingresos:</div>
                  <div class="summary-value">S/.${totalIncome.toFixed(2)}</div>
                </div>
                <div class="summary-row">
                  <div class="summary-label">Total Gastos:</div>
                  <div class="summary-value">S/.${totalExpenses.toFixed(
                    2
                  )}</div>
                </div>
                <div class="summary-row balance">
                  <div class="summary-label">Balance del Día:</div>
                  <div class="summary-value ${
                    balance >= 0 ? "positive" : "negative"
                  }">
                    S/.${balance.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div class="section-title">Ingresos</div>
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Descripción</th>
                    <th>Método de Pago</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    payments.length === 0
                      ? '<tr><td colspan="4" style="text-align: center;">No hay ingresos registrados para esta fecha</td></tr>'
                      : payments
                          .map(
                            (payment) => `
                      <tr>
                        <td>${new Date(payment.date).toLocaleTimeString()}</td>
                        <td>${payment.description}</td>
                        <td>${payment.paymentMethod}</td>
                        <td style="text-align: right;">S/.${payment.amount.toFixed(
                          2
                        )}</td>
                      </tr>
                    `
                          )
                          .join("")
                  }
                </tbody>
              </table>
              
              <div class="section-title">Gastos</div>
              <table>
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Descripción</th>
                    <th>Categoría</th>
                    <th>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    expenses.length === 0
                      ? '<tr><td colspan="4" style="text-align: center;">No hay gastos registrados para esta fecha</td></tr>'
                      : expenses
                          .map(
                            (expense) => `
                      <tr>
                        <td>${new Date(expense.date).toLocaleTimeString()}</td>
                        <td>${expense.description}</td>
                        <td>${expense.category}</td>
                        <td style="text-align: right;">S/.${expense.amount.toFixed(
                          2
                        )}</td>
                      </tr>
                    `
                          )
                          .join("")
                  }
                </tbody>
              </table>
              
              <div class="footer">
                Este documento es un reporte interno de caja.
                <br>
                TIENDA ACME - Av. Principal 123, Ciudad - Tel: 123-456789
              </div>
            </div>
            
            <div class="no-print" style="text-align: center; margin-top: 20px;">
              <button onclick="window.print();" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Imprimir Reporte
              </button>
            </div>
            
            <script>
              // Imprimir automáticamente
              window.onload = function() {
                // Esperar un momento para que se cargue todo
                setTimeout(function() {
                  window.print();
                }, 500);
              };
            </script>
          </body>
        </html>
      `);

      printWindow.document.close();
    } catch (error) {
      console.error("Error al imprimir:", error);
      toast({
        title: "Error de impresión",
        description: "Ocurrió un error al intentar imprimir el reporte.",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="p-4 md:p-6 flex-1 flex flex-col max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Caja Chica
            </h1>
            <p className="text-gray-500 text-sm">
              Gestione los ingresos y gastos diarios de su negocio
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white p-2 rounded-md border shadow-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <DatePicker
                date={selectedDate}
                onDateChange={(date) => {
                  const newDate = date || new Date();
                  setSelectedDate(newDate);
                  // Recargar datos cuando cambia la fecha
                  setLoading(true);
                  setTimeout(() => loadData(), 100);
                }}
                className="w-[180px]"
              />
            </div>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handleExportToExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handlePrintReport}
            >
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger
              value="resumen"
              className="flex items-center gap-2 data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500"
            >
              <BarChart3 className="h-4 w-4" />
              Resumen del Día
            </TabsTrigger>
            <TabsTrigger
              value="transacciones"
              className="flex items-center gap-2 data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500"
            >
              <DollarSign className="h-4 w-4" />
              Transacciones
            </TabsTrigger>
            <TabsTrigger
              value="gastos"
              className="flex items-center gap-2 data-[state=active]:text-orange-500 data-[state=active]:border-b-2 data-[state=active]:border-orange-500"
            >
              <DollarSign className="h-4 w-4 text-red-500" />
              Registrar Gasto
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumen" className="mt-0">
            <CashRegisterSummary
              payments={payments}
              expenses={expenses}
              date={selectedDate}
              isLoading={loading}
            />
          </TabsContent>

          <TabsContent value="transacciones" className="mt-0">
            <DailyTransactionsTable
              payments={payments}
              expenses={expenses}
              isLoading={loading}
            />
          </TabsContent>

          <TabsContent value="gastos" className="mt-0">
            <ExpenseForm onAddExpense={handleAddExpense} date={selectedDate} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
