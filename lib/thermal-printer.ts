/**
 * Biblioteca para manejar la impresión térmica mediante JavaScript
 */

// Comandos ESC/POS comunes para impresoras térmicas
const ESC = "\x1B";
const GS = "\x1D";
const COMMANDS = {
  INIT: `${ESC}@`,
  BOLD_ON: `${ESC}E\x01`,
  BOLD_OFF: `${ESC}E\x00`,
  ALIGN_CENTER: `${ESC}a\x01`,
  ALIGN_LEFT: `${ESC}a\x00`,
  ALIGN_RIGHT: `${ESC}a\x02`,
  TEXT_SIZE_NORMAL: `${GS}!\x00`,
  TEXT_SIZE_DOUBLE_HEIGHT: `${GS}!\x01`,
  TEXT_SIZE_DOUBLE_WIDTH: `${GS}!\x10`,
  TEXT_SIZE_DOUBLE: `${GS}!\x11`,
  CUT_PAPER: `${GS}V\x00`,
  LINE_FEED: "\n",
  DOUBLE_LINE_FEED: "\n\n",
};

// Clase para manejar la impresión térmica
export class ThermalPrinter {
  private buffer = "";
  private printerName = "";
  private connected = false;

  constructor(printerName?: string) {
    if (printerName) {
      this.printerName = printerName;
    }
    this.init();
  }

  // Inicializar la impresora
  private init() {
    this.buffer = COMMANDS.INIT;
    return this;
  }

  // Conectar con la impresora
  public async connect(): Promise<boolean> {
    try {
      console.log(`Conectando a impresora: ${this.printerName || "Default"}`);
      this.connected = true;
      return true;
    } catch (error) {
      console.error("Error al conectar con la impresora:", error);
      this.connected = false;
      return false;
    }
  }

  // Añadir texto al buffer
  public text(text: string): ThermalPrinter {
    this.buffer += text;
    return this;
  }

  // Añadir texto en negrita
  public bold(text: string): ThermalPrinter {
    this.buffer += COMMANDS.BOLD_ON + text + COMMANDS.BOLD_OFF;
    return this;
  }

  // Activar negrita
  public boldOn(): ThermalPrinter {
    this.buffer += COMMANDS.BOLD_ON;
    return this;
  }

  // Desactivar negrita
  public boldOff(): ThermalPrinter {
    this.buffer += COMMANDS.BOLD_OFF;
    return this;
  }

  // Centrar texto
  public center(): ThermalPrinter {
    this.buffer += COMMANDS.ALIGN_CENTER;
    return this;
  }

  // Alinear texto a la izquierda
  public left(): ThermalPrinter {
    this.buffer += COMMANDS.ALIGN_LEFT;
    return this;
  }

  // Alinear texto a la derecha
  public right(): ThermalPrinter {
    this.buffer += COMMANDS.ALIGN_RIGHT;
    return this;
  }

  // Añadir salto de línea
  public newLine(count = 1): ThermalPrinter {
    this.buffer += "\n".repeat(count);
    return this;
  }

  // Añadir línea divisoria
  public divider(char = "-"): ThermalPrinter {
    this.left();
    this.buffer += char.repeat(32) + "\n";
    return this;
  }

  // Añadir texto con tamaño doble
  public doubleSize(text: string): ThermalPrinter {
    this.buffer += COMMANDS.TEXT_SIZE_DOUBLE + text + COMMANDS.TEXT_SIZE_NORMAL;
    return this;
  }

  // Cortar el papel
  public cut(): ThermalPrinter {
    this.buffer += COMMANDS.CUT_PAPER;
    return this;
  }

  // Imprimir el contenido del buffer
  public async print(): Promise<boolean> {
    if (!this.connected) {
      const connected = await this.connect();
      if (!connected) {
        return false;
      }
    }

    try {
      console.log("Enviando datos a la impresora...");
      console.log("Buffer de impresión:", this.buffer);
      this.buffer = COMMANDS.INIT;
      return true;
    } catch (error) {
      console.error("Error al imprimir:", error);
      return false;
    }
  }

  // Método para imprimir un recibo
  public static async printReceipt(
    receiptData: any,
    options: { showDialog?: boolean } = {}
  ): Promise<boolean> {
    try {
      if (options.showDialog) {
        const confirmed = window.confirm(
          "¿Desea imprimir el recibo en la impresora térmica?"
        );
        if (!confirmed) {
          return false;
        }
      }

      const printer = new ThermalPrinter();

      // Encabezado
      printer
        .center()
        .boldOn()
        .text("TIENDA ACME")
        .boldOff()
        .left()
        .newLine()
        .center()
        .text("Av. Principal 123, Ciudad")
        .left()
        .newLine()
        .center()
        .text("Tel: 123-456789")
        .left()
        .divider();

      // Tipo de documento
      printer
        .center()
        .boldOn()
        .text(receiptData.paymentMethod.toUpperCase())
        .boldOff()
        .left()
        .newLine()
        .divider();

      // Información del pedido
      const date = new Date(receiptData.date);
      printer
        .text(`Fecha: ${date.toLocaleDateString()}`)
        .newLine()
        .text(`Hora: ${date.toLocaleTimeString()}`)
        .newLine()
        .text(`Pedido #: ${receiptData.id}`)
        .divider();

      // Productos
      printer
        .boldOn()
        .text("Descripción                Precio")
        .boldOff()
        .newLine();

      receiptData.items.forEach((item: any) => {
        const name =
          item.name.length > 20
            ? item.name.substring(0, 17) + "..."
            : item.name;
        const quantity = item.quantity > 1 ? ` x${item.quantity}` : "";
        const price = formatCurrency(item.price * item.quantity);

        const nameWithQuantity = `${name}${quantity}`;
        const spaces = 32 - nameWithQuantity.length - price.length;

        printer
          .text(`${nameWithQuantity}${" ".repeat(Math.max(1, spaces))}${price}`)
          .newLine();
      });

      printer.divider();

      // Total
      const total = receiptData.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      printer
        .boldOn()
        .text(
          `Total${" ".repeat(
            27 - formatCurrency(total).length
          )}${formatCurrency(total)}`
        )
        .boldOff()
        .divider()
        .center()
        .boldOn()
        .text("¡GRACIAS POR SU COMPRA!")
        .boldOff()
        .left()
        .newLine(2)
        .center()
        .text("||||| |||| ||| |||| |||")
        .left()
        .center()
        .text(receiptData.id)
        .left()
        .newLine(3)
        .cut();

      return await printer.print();
    } catch (error) {
      console.error("Error al imprimir recibo:", error);
      return false;
    }
  }

  // Método para imprimir un despacho
  public static async printDispatch(
    dispatchData: any,
    options: { showDialog?: boolean } = {}
  ): Promise<boolean> {
    try {
      if (options.showDialog) {
        const confirmed = window.confirm(
          "¿Desea imprimir el despacho en la impresora térmica?"
        );
        if (!confirmed) {
          return false;
        }
      }

      const printer = new ThermalPrinter();

      // Encabezado
      printer
        .center()
        .boldOn()
        .text("TIENDA ACME")
        .boldOff()
        .left()
        .newLine()
        .center()
        .text("Av. Principal 123, Ciudad")
        .left()
        .newLine()
        .center()
        .text("Tel: 123-456789")
        .left()
        .divider();

      // Tipo de documento
      printer
        .center()
        .boldOn()
        .text("ORDEN DE DESPACHO")
        .boldOff()
        .left()
        .newLine()
        .center()
        .text(`Pedido #: ${dispatchData.orderId.slice(0, 8)}`)
        .left()
        .divider();

      // Información del despacho
      printer
        .boldOn()
        .text("DATOS DE ENTREGA:")
        .boldOff()
        .newLine()
        .text(`Cliente: ${dispatchData.customerName}`)
        .newLine()
        .text(`Dirección: ${dispatchData.address}`)
        .newLine()
        .text(`Teléfono: ${dispatchData.phone}`)
        .newLine()
        .text(
          `Fecha de entrega: ${new Date(
            dispatchData.deliveryDate
          ).toLocaleDateString()}`
        )
        .newLine()
        .text(`Creado: ${new Date(dispatchData.creationTime).toLocaleString()}`)
        .divider();

      // Productos
      printer
        .boldOn()
        .text("Producto                    Cant")
        .boldOff()
        .newLine();

      dispatchData.items.forEach((item: any) => {
        const name =
          item.name.length > 25
            ? item.name.substring(0, 22) + "..."
            : item.name;
        const spaces = 32 - name.length - String(item.quantity).length;
        printer
          .text(`${name}${" ".repeat(Math.max(1, spaces))}${item.quantity}`)
          .newLine();
      });

      printer.divider();
      printer
        .boldOn()
        .text(`Total de productos: ${dispatchData.totalProductCount}`)
        .boldOff()
        .newLine();

      if (dispatchData.notes) {
        printer
          .divider()
          .boldOn()
          .text("NOTAS:")
          .boldOff()
          .newLine()
          .text(dispatchData.notes);
      }

      // Firma
      printer
        .divider()
        .center()
        .boldOn()
        .text("FIRMA DE RECEPCIÓN:")
        .boldOff()
        .left()
        .newLine(2)
        .center()
        .text("_________________________________")
        .left()
        .center()
        .text("Nombre y DNI")
        .left()
        .newLine(2)
        .center()
        .text("||||| |||| ||| |||| |||")
        .left()
        .center()
        .text(dispatchData.orderId)
        .left()
        .newLine(3)
        .cut();

      return await printer.print();
    } catch (error) {
      console.error("Error al imprimir despacho:", error);
      return false;
    }
  }
}

// Función auxiliar para formatear moneda
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(amount);
}

// Función para detectar impresoras disponibles
export async function detectPrinters(): Promise<string[]> {
  return [
    "Impresora Térmica POS-58",
    "Impresora Térmica POS-80",
    "Impresora Térmica Bluetooth",
  ];
}

// Función para obtener la impresora predeterminada
export function getDefaultPrinter(): string | null {
  return localStorage.getItem("defaultPrinter");
}

// Función para establecer la impresora predeterminada
export function setDefaultPrinter(printerName: string): void {
  localStorage.setItem("defaultPrinter", printerName);
}

// Función para imprimir usando la API de impresión del navegador
export function printElement(element: HTMLElement): void {
  try {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.visibility = "hidden";

    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (frameDoc) {
      frameDoc.open();
      frameDoc.write(`
        <html>
          <head>
            <title>Impresión</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                font-family: 'Courier New', monospace;
                width: 80mm;
                margin: 0;
                padding: 0;
              }
              .receipt-content {
                width: 80mm;
                padding: 0;
                margin: 0;
              }
            </style>
          </head>
          <body><div class="receipt-content">${element.outerHTML}</div></body>
        </html>
      `);
      frameDoc.close();

      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();

      setTimeout(() => {
        if (iframe.parentNode === document.body) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }
  } catch (error) {
    console.error("Error al imprimir:", error);
  }
}
