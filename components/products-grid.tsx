"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
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
import { useState } from "react";

interface Product {
  id: number;
  precio_minimo: number;
  precio_sugerido: number;
  imagen?: string;
  categoria: string;
  stock: number;
  descripcion: string;
  presentacion?: string;
  codigo?: string;
}

interface ProductsGridProps {
  products: Product[];
  onProductDeleted?: () => void;
}

export function ProductsGrid({
  products,
  onProductDeleted,
}: ProductsGridProps) {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!productToDelete) return;

    try {
      // Get current products from localStorage
      const storedProducts = localStorage.getItem("products");
      if (storedProducts) {
        const currentProducts = JSON.parse(storedProducts);
        // Filter out the product to delete
        const updatedProducts = currentProducts.filter(
          (p: Product) => p.id !== productToDelete.id
        );
        // Save back to localStorage
        localStorage.setItem("products", JSON.stringify(updatedProducts));

        toast({
          title: "Producto eliminado",
          description: `El producto "${productToDelete.descripcion}" ha sido eliminado correctamente.`,
        });

        // Notify parent component
        if (onProductDeleted) {
          onProductDeleted();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error al eliminar el producto",
        variant: "destructive",
      });
    }

    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full flex items-center justify-center h-64 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center">
              <Tag className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-lg font-medium">No se encontraron productos</p>
              <p className="text-sm text-gray-400 mt-1">
                Intente con otra búsqueda o categoría
              </p>
            </div>
          </div>
        ) : (
          products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200"
            >
              <div className="relative h-40 bg-gray-100">
                <Image
                  src={product.imagen || "/placeholder.svg"}
                  alt={product.descripcion || "Producto"}
                  fill
                  className="object-contain p-2"
                />
                <Badge
                  className={`absolute top-2 right-2 ${
                    product.stock < 5
                      ? "bg-red-100 text-red-800 border-red-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  }`}
                >
                  Stock: {product.stock}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-medium text-lg mb-1 break-words whitespace-normal">
                    {product.descripcion}
                  </h3>
                  <Badge
                    variant="outline"
                    className="mb-2 bg-blue-50 text-blue-700 border-blue-200"
                  >
                    {product.categoria}
                  </Badge>

                  <div className="flex flex-col gap-1 mt-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">
                        Precio sugerido:
                      </span>
                      <p className="font-bold text-lg text-blue-700 ml-auto">
                        S/.{product.precio_sugerido.toFixed(2)}
                      </p>
                    </div>
                    {product.presentacion && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">
                          Presentación:
                        </span>
                        <p className="text-md text-gray-800 ml-auto">
                          {product.presentacion}
                        </p>
                      </div>
                    )}
                    {product.codigo && (
                      <div className="flex items-center">
                        <span className="text-sm text-gray-600">Código:</span>
                        <p className="text-md text-gray-800 ml-auto">
                          {product.codigo}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center border-t pt-1">
                      <span className="text-sm text-gray-600">
                        Precio mínimo:
                      </span>
                      <div className="ml-auto flex flex-col items-end">
                        <p className="font-bold text-lg text-green-600">
                          S/.{product.precio_minimo.toFixed(2)}
                        </p>
                        <span className="text-xs text-green-700">
                          Desde 5 unidades
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/productos/nuevo?id=${product.id}`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span>Editar</span>
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center justify-center w-9 text-red-600 border-red-200 hover:bg-red-50 transition-colors"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              ¿Está seguro de eliminar este producto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "
              {productToDelete?.descripcion}" será eliminado permanentemente.
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
    </>
  );
}
