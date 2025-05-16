/**
 * Utilidades para exportar datos a diferentes formatos
 */
import ExcelJS from "exceljs";

// Función para exportar datos a Excel (XLSX) usando ExcelJS
export async function exportToExcel(
  data: any[],
  headers: { key: string; label: string }[],
  filename = "export.xlsx"
): Promise<void> {
  try {
    // Crear un nuevo libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // Añadir una hoja de trabajo
    const worksheet = workbook.addWorksheet("Datos");

    // Añadir encabezados
    worksheet.columns = headers.map((header) => ({
      header: header.label,
      key: header.key,
      width: 20, // Ancho predeterminado para todas las columnas
    }));

    // Aplicar estilo a los encabezados
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F81BD" }, // Color azul para encabezados
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };

    // Añadir datos
    data.forEach((item) => {
      const row: any = {};
      headers.forEach((header) => {
        row[header.key] = item[header.key];
      });
      worksheet.addRow(row);
    });

    // Aplicar bordes a todas las celdas con datos
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        // Alineación para todas las celdas excepto encabezados
        if (rowNumber > 1) {
          cell.alignment = { vertical: "middle" };

          // Si es un número, alinearlo a la derecha
          if (typeof cell.value === "number") {
            cell.alignment = { vertical: "middle", horizontal: "right" };
          }
        }
      });
    });

    // Aplicar filtros automáticos a los encabezados
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: headers.length },
    };

    // Generar el archivo y descargarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();

    // Limpiar
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error al exportar a Excel:", error);
    throw error;
  }
}

// Función específica para exportar productos
export function exportProductsToExcel(products: any[]): void {
  // Definir los encabezados para el archivo Excel
  const headers = [
    { key: "id", label: "ID" },
    { key: "name", label: "Nombre del Producto" },
    { key: "price", label: "Precio" },
    { key: "category", label: "Categoría" },
    { key: "stock", label: "Stock" },
    { key: "description", label: "Descripción" },
  ];

  // Exportar los productos
  exportToExcel(products, headers, "productos.xlsx");
}

// Función específica para exportar pedidos
export function exportOrdersToExcel(orders: any[]): void {
  // Definir los encabezados para el archivo Excel
  const headers = [
    { key: "id", label: "ID" },
    { key: "customerName", label: "Cliente" },
    { key: "total", label: "Total" },
    { key: "paymentMethod", label: "Método de Pago" },
    { key: "date", label: "Fecha" },
    { key: "status", label: "Estado" },
  ];

  // Preparar los datos de pedidos para exportación
  const formattedOrders = orders.map((order) => {
    return {
      id: order.id,
      customerName: `Cliente de Pedido #${order.id}`,
      total: order.total,
      paymentMethod: getPaymentMethodName(order.paymentMethod),
      date: new Date(order.date).toLocaleString(),
      status: order.status,
    };
  });

  // Exportar los pedidos
  exportToExcel(formattedOrders, headers, "pedidos.xlsx");
}

// Función específica para exportar despachos
export function exportDispatchesToExcel(dispatches: any[]): void {
  // Definir los encabezados para el archivo Excel
  const headers = [
    { key: "orderId", label: "ID Pedido" },
    { key: "customerName", label: "Cliente" },
    { key: "address", label: "Dirección" },
    { key: "phone", label: "Teléfono" },
    { key: "deliveryDate", label: "Fecha de Entrega" },
    { key: "totalProductCount", label: "Total Productos" },
    { key: "status", label: "Estado" },
    { key: "createdAt", label: "Fecha de Creación" },
  ];

  // Preparar los datos de despachos para exportación
  const formattedDispatches = dispatches.map((dispatch) => {
    return {
      ...dispatch,
      deliveryDate: new Date(dispatch.deliveryDate).toLocaleDateString(),
      createdAt: new Date(dispatch.createdAt).toLocaleString(),
    };
  });

  // Exportar los despachos
  exportToExcel(formattedDispatches, headers, "despachos.xlsx");
}

// Función específica para exportar pagos
export function exportPaymentsToExcel(payments: any[]): void {
  // Definir los encabezados para el archivo Excel
  const headers = [
    { key: "id", label: "ID" },
    { key: "date", label: "Fecha" },
    { key: "customerName", label: "Cliente" },
    { key: "customerPhone", label: "Teléfono" },
    { key: "total", label: "Total Pedido" },
    { key: "cash", label: "Efectivo" },
    { key: "yape", label: "Yape" },
    { key: "transfer", label: "Transferencia" },
    { key: "totalPaid", label: "Total Pagado" },
    { key: "status", label: "Estado" },
  ];

  // Preparar los datos de pagos para exportación
  const formattedPayments = payments.map((payment) => {
    return {
      ...payment,
      date: new Date(payment.date).toLocaleString(),
    };
  });

  // Exportar los pagos
  exportToExcel(formattedPayments, headers, "pagos.xlsx");
}

// Función específica para exportar caja chica
export function exportCashRegisterToExcel(
  transactions: any[],
  date: Date
): void {
  // Definir los encabezados para el archivo Excel
  const headers = [
    { key: "time", label: "Hora" },
    { key: "type", label: "Tipo" },
    { key: "description", label: "Descripción" },
    { key: "details", label: "Detalles" },
    { key: "amount", label: "Monto" },
  ];

  // Preparar los datos de transacciones para exportación
  const formattedTransactions = transactions.map((transaction) => {
    return {
      time: new Date(transaction.date).toLocaleTimeString(),
      type: transaction.type === "income" ? "Ingreso" : "Gasto",
      description: transaction.description,
      details:
        transaction.type === "income"
          ? transaction.paymentMethod
          : transaction.category,
      amount: transaction.amount,
    };
  });

  // Formatear fecha para el nombre del archivo
  const formattedDate = date.toISOString().split("T")[0];

  // Exportar las transacciones
  exportToExcel(
    formattedTransactions,
    headers,
    `caja-chica-${formattedDate}.xlsx`
  );
}

// Función auxiliar para obtener el nombre del método de pago
function getPaymentMethodName(method: string): string {
  switch (method) {
    case "efectivo":
      return "Contra Entrega Efectivo";
    case "tarjeta":
      return "Tarjeta de Crédito";
    case "transferencia":
      return "Transferencia Bancaria";
    default:
      return method;
  }
}
