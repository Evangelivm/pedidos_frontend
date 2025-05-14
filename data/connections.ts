import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Types for DTOs
interface PaginationParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

interface Cliente {
  id: number;
  nombre: string;
  tipo_documento: "DNI" | "RUC" | "CE" | "PASAPORTE";
  numero_documento: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  activo: boolean;
}

interface Producto {
  id: number;
  codigo: string;
  descripcion: string;
  categoria_id: number;
  presentacion_id: number;
  precio_sugerido?: number;
  precio_minimo?: number;
  stock: number;
  stock_minimo: number;
  imagen?: string;
  activo: boolean;
}

interface Pedido {
  id: number;
  numero: string;
  fecha: Date;
  cliente_id: number;
  subtotal: number;
  igv: number;
  total: number;
  estado: "PENDIENTE" | "COMPLETADO" | "CANCELADO";
  notas?: string;
  detalle: DetallePedido[];
}

interface DetallePedido {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

interface Despacho {
  id: number;
  pedido_id: number;
  fecha: Date;
  direccion_entrega: string;
  contacto_entrega?: string;
  telefono_entrega?: string;
  estado: "PENDIENTE" | "EN_RUTA" | "ENTREGADO" | "CANCELADO";
  notas?: string;
}

interface EntradaMercaderia {
  id: number;
  fecha: Date;
  proveedor_id: number;
  numero_factura?: string;
  total: number;
  notas?: string;
  detalle: DetalleEntradaMercaderia[];
}

interface DetalleEntradaMercaderia {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

// API Client
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const connections = {
  // Clientes
  clientes: {
    getAll: (params: PaginationParams) => api.get("/clientes", { params }),
    getById: (id: number) => api.get(`/clientes/${id}`),
    getByDocumento: (numero: string) =>
      api.get(`/clientes/documento/${numero}`),
    create: (data: Omit<Cliente, "id">) => api.post("/clientes", data),
    update: (id: number, data: Partial<Cliente>) =>
      api.put(`/clientes/${id}`, data),
    delete: (id: number) => api.delete(`/clientes/${id}`),
  },

  // Productos
  productos: {
    getAll: (params: PaginationParams) => api.get("/productos", { params }),
    getById: (id: number) => api.get(`/productos/${id}`),
    getByCodigo: (codigo: string) => api.get(`/productos/codigo/${codigo}`),
    getByCategoria: (categoriaId: number, params: PaginationParams) =>
      api.get(`/productos/categoria/${categoriaId}`, { params }),
    create: (data: Omit<Producto, "id">) => api.post("/productos", data),
    update: (id: number, data: Partial<Producto>) =>
      api.put(`/productos/${id}`, data),
    delete: (id: number) => api.delete(`/productos/${id}`),
  },

  // Pedidos
  pedidos: {
    getAll: (params: PaginationParams) => api.get("/pedidos", { params }),
    getById: (id: number) => api.get(`/pedidos/${id}`),
    getByCliente: (clienteId: number, params: PaginationParams) =>
      api.get(`/pedidos/cliente/${clienteId}`, { params }),
    getByNumero: (numero: string) => api.get(`/pedidos/numero/${numero}`),
    create: (data: Omit<Pedido, "id">) => api.post("/pedidos", data),
    update: (id: number, data: Partial<Pedido>) =>
      api.put(`/pedidos/${id}`, data),
    delete: (id: number) => api.delete(`/pedidos/${id}`),
  },

  // Despachos
  despachos: {
    getAll: (params: PaginationParams) => api.get("/despachos", { params }),
    getById: (id: number) => api.get(`/despachos/${id}`),
    getByPedido: (pedidoId: number) => api.get(`/despachos/pedido/${pedidoId}`),
    getByEstado: (estado: Despacho["estado"], params: PaginationParams) =>
      api.get(`/despachos/estado/${estado}`, { params }),
    create: (data: Omit<Despacho, "id">) => api.post("/despachos", data),
    update: (id: number, data: Partial<Despacho>) =>
      api.put(`/despachos/${id}`, data),
    delete: (id: number) => api.delete(`/despachos/${id}`),
  },

  // Entradas de Mercadería
  entradasMercaderia: {
    getAll: (params: PaginationParams) =>
      api.get("/entradas-mercaderia", { params }),
    getById: (id: number) => api.get(`/entradas-mercaderia/${id}`),
    getByProveedor: (proveedorId: number, params: PaginationParams) =>
      api.get(`/entradas-mercaderia/proveedor/${proveedorId}`, { params }),
    getByFecha: (fecha: string, params: PaginationParams) =>
      api.get(`/entradas-mercaderia/fecha/${fecha}`, { params }),
    create: (data: Omit<EntradaMercaderia, "id">) =>
      api.post("/entradas-mercaderia", data),
    update: (id: number, data: Partial<EntradaMercaderia>) =>
      api.put(`/entradas-mercaderia/${id}`, data),
    delete: (id: number) => api.delete(`/entradas-mercaderia/${id}`),
  },
};

export type {
  PaginationParams,
  Cliente,
  Producto,
  Pedido,
  DetallePedido,
  Despacho,
  EntradaMercaderia,
  DetalleEntradaMercaderia,
};

export default connections;
