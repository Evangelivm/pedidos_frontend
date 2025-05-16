"use client";

import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { SearchBar } from "@/components/search-bar";
import { ProductsGrid } from "@/components/products-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Package, Download } from "lucide-react";
import Link from "next/link";
import { exportProductsToExcel } from "@/lib/export-utils";
import { useToast } from "@/components/ui/use-toast";
import { connections } from "@/data/connections";
import { Producto } from "@/data/connections";

// Category mapping
const CATEGORIES = {
  1: "Abarrotes",
  2: "Trigos, harinas y hojuelas",
  3: "Condimentos y especias",
  4: "Frutos secos",
  5: "Productos para panificacion",
  6: "Hierbas, aromaticas y semillas",
  7: "Legumbres y cereales",
  8: "Alimentos balanceados para mascotas",
};

// Presentation mapping
const PRESENTATIONS = {
  1: "CAJA",
  2: "SACO",
  3: "PAQUETE",
  4: "BOLSA",
  5: "KILO",
  6: "DOCENA",
  7: "DISPLAY",
  8: "UNIDAD",
  9: "PLANCHA",
  10: "50 KILOS",
  11: "HARINAS",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedPresentation, setSelectedPresentation] = useState("Todos");
  const [sortBy, setSortBy] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await connections.productos.getAll({
          page: 1,
          limit: 1000, // Adjust based on your needs
        });

        // Convert string prices to numbers
        const productsWithNumericPrices = response.data.items.map(
          (product: any) => ({
            ...product,
            precio_sugerido: Number(product.precio_sugerido),
            precio_minimo: Number(product.precio_minimo),
          })
        );

        setProducts(productsWithNumericPrices);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los productos",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Get unique categories for filter dropdown
  const availableCategories = [
    "Todos",
    ...Array.from(
      new Set(
        products.map(
          (p) => CATEGORIES[p.categoria_id as keyof typeof CATEGORIES]
        )
      )
    ),
  ];

  // Get unique presentations for filter dropdown
  const availablePresentations = [
    "Todos",
    ...Array.from(
      new Set(
        products.map(
          (p) => PRESENTATIONS[p.presentacion_id as keyof typeof PRESENTATIONS]
        )
      )
    ),
  ];

  // Filter and sort products (client-side)
  const filteredAndSortedProducts = (() => {
    let filtered = [...products];

    // Apply category filter
    if (selectedCategory !== "Todos") {
      filtered = filtered.filter(
        (product) =>
          CATEGORIES[product.categoria_id as keyof typeof CATEGORIES] ===
          selectedCategory
      );
    }

    // Apply presentation filter
    if (selectedPresentation !== "Todos") {
      filtered = filtered.filter(
        (product) =>
          PRESENTATIONS[
            product.presentacion_id as keyof typeof PRESENTATIONS
          ] === selectedPresentation
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.descripcion.toLowerCase().includes(term) ||
          product.codigo.toLowerCase().includes(term) ||
          CATEGORIES[product.categoria_id as keyof typeof CATEGORIES]
            ?.toLowerCase()
            .includes(term) ||
          PRESENTATIONS[product.presentacion_id as keyof typeof PRESENTATIONS]
            ?.toLowerCase()
            .includes(term)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.descripcion.localeCompare(b.descripcion));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.descripcion.localeCompare(a.descripcion));
        break;
      case "price-asc":
        filtered.sort(
          (a, b) => (a.precio_sugerido || 0) - (b.precio_sugerido || 0)
        );
        break;
      case "price-desc":
        filtered.sort(
          (a, b) => (b.precio_sugerido || 0) - (a.precio_sugerido || 0)
        );
        break;
      case "stock-asc":
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case "stock-desc":
        filtered.sort((a, b) => b.stock - a.stock);
        break;
    }

    return filtered;
  })();

  // Handle search input
  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  // Handle export to Excel
  const handleExportToExcel = () => {
    try {
      // Map the products to the format expected by your export function
      const productsToExport = filteredAndSortedProducts.map((product) => ({
        id: product.id,
        codigo: product.codigo,
        descripcion: product.descripcion,
        categoria: CATEGORIES[product.categoria_id as keyof typeof CATEGORIES],
        presentacion:
          PRESENTATIONS[product.presentacion_id as keyof typeof PRESENTATIONS],
        precio_sugerido: product.precio_sugerido,
        precio_minimo: product.precio_minimo,
        stock: product.stock,
        stock_minimo: product.stock_minimo,
        activo: product.activo,
      }));

      exportProductsToExcel(productsToExport);

      toast({
        title: "Exportación exitosa",
        description: `Se han exportado ${filteredAndSortedProducts.length} productos a Excel.`,
      });
    } catch (error) {
      console.error("Error al exportar a Excel:", error);

      toast({
        title: "Error de exportación",
        description:
          "No se pudieron exportar los productos. Inténtelo de nuevo.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-gray-50">
        <TopBar />
        <div className="p-4 md:p-6 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-3 text-gray-600">Cargando productos...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-gray-50">
      <TopBar />
      <div className="p-4 md:p-6 flex-1 flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-1 flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Catálogo de Productos
            </h1>
            <p className="text-gray-500 text-sm">
              Gestione su inventario y productos disponibles
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/productos/nuevo">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Producto
              </Button>
            </Link>
            <Button
              variant="outline"
              className="border-gray-300"
              onClick={handleExportToExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar XLS
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center">
          <div className="flex-1">
            <SearchBar
              onSearch={handleSearch}
              placeholder="Buscar por código, descripción, categoría o presentación..."
            />
          </div>

          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px] bg-white shadow-sm">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedPresentation}
              onValueChange={setSelectedPresentation}
            >
              <SelectTrigger className="w-[180px] bg-white shadow-sm">
                <SelectValue placeholder="Presentación" />
              </SelectTrigger>
              <SelectContent>
                {availablePresentations.map((presentation) => (
                  <SelectItem key={presentation} value={presentation}>
                    {presentation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-white shadow-sm">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Descripción (A-Z)</SelectItem>
                <SelectItem value="name-desc">Descripción (Z-A)</SelectItem>
                <SelectItem value="price-asc">
                  Precio (Menor a Mayor)
                </SelectItem>
                <SelectItem value="price-desc">
                  Precio (Mayor a Menor)
                </SelectItem>
                <SelectItem value="stock-asc">Stock (Menor a Mayor)</SelectItem>
                <SelectItem value="stock-desc">
                  Stock (Mayor a Menor)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <ProductsGrid
            products={filteredAndSortedProducts.map((p) => ({
              id: p.id,
              codigo: p.codigo,
              descripcion: p.descripcion,
              categoria: CATEGORIES[p.categoria_id as keyof typeof CATEGORIES],
              presentacion:
                PRESENTATIONS[p.presentacion_id as keyof typeof PRESENTATIONS],
              precio_sugerido: p.precio_sugerido ?? 0, // default value if undefined
              precio_minimo: p.precio_minimo ?? 0, // default value if undefined
              stock: p.stock,
              stock_minimo: p.stock_minimo,
              imagen: p.imagen ?? "/abarrote.webp", // default value if undefined
              activo: p.activo,
            }))}
            onProductDeleted={(id: number | void) => {
              setProducts((prev) => prev.filter((p) => p.id !== id));
            }}
          />
        </div>

        <div className="mt-4 text-sm text-gray-500 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
          Mostrando {filteredAndSortedProducts.length} de {products.length}{" "}
          productos
        </div>
      </div>
    </main>
  );
}
