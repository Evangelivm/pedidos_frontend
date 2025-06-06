"use client";
import { useState, useEffect } from "react";
import { TopBar } from "@/components/top-bar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Tag, Percent } from "lucide-react";
import Link from "next/link";
import { connections } from "@/data/connections";

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

export default function NewProductPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [productData, setProductData] = useState({
    codigo: "",
    descripcion: "",
    precio_sugerido: "",
    precio_minimo: "",
    categoria_id: "",
    presentacion_id: "",
    stock: "",
    stock_minimo: "5",
    activo: true,
    imagen: null, // Add imagen field
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));

    if (name === "precio_sugerido" && value) {
      const suggestedPrice = Number.parseFloat(value);
      if (!isNaN(suggestedPrice)) {
        const calculatedMinPrice = (suggestedPrice * 0.9).toFixed(2);
        setProductData((prev) => ({
          ...prev,
          precio_minimo: calculatedMinPrice,
        }));
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const productId = searchParams.get("id");
    if (productId) {
      const loadProduct = async () => {
        try {
          const response = await connections.productos.getById(
            Number(productId)
          );
          const product = response.data;
          setProductData({
            codigo: product.codigo,
            descripcion: product.descripcion,
            precio_sugerido: product.precio_sugerido?.toString() || "",
            precio_minimo: product.precio_minimo?.toString() || "",
            categoria_id: product.categoria_id.toString(),
            presentacion_id: product.presentacion_id.toString(),
            stock: product.stock.toString(),
            stock_minimo: product.stock_minimo.toString(),
            activo: product.activo,
            imagen: product.imagen, // Set existing image
          });
          setIsEditing(true);
        } catch (error) {
          toast({
            title: "Error",
            description: "No se pudo cargar el producto",
            variant: "destructive",
          });
          router.push("/productos");
        }
      };
      loadProduct();
    }
  }, [router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (
        !productData.descripcion ||
        !productData.precio_sugerido ||
        !productData.categoria_id ||
        !productData.stock
      ) {
        throw new Error("Por favor complete todos los campos requeridos");
      }

      const suggestedPrice = Number.parseFloat(productData.precio_sugerido);
      const minimumPrice = Number.parseFloat(productData.precio_minimo);
      if (isNaN(suggestedPrice)) {
        throw new Error("El precio sugerido debe ser un número válido");
      }
      if (isNaN(minimumPrice)) {
        throw new Error("El precio mínimo debe ser un número válido");
      }
      if (minimumPrice >= suggestedPrice) {
        throw new Error(
          "El precio mínimo debe ser menor que el precio sugerido"
        );
      }

      const formData = new FormData();

      formData.append("codigo", productData.codigo);
      formData.append("descripcion", productData.descripcion);
      formData.append("categoria_id", productData.categoria_id);
      formData.append("presentacion_id", productData.presentacion_id);
      formData.append("precio_sugerido", suggestedPrice.toString());
      formData.append("precio_minimo", minimumPrice.toString());
      formData.append("stock", productData.stock);
      formData.append("stock_minimo", productData.stock_minimo || "5");
      formData.append("activo", "true");

      if (imageFile) {
        formData.append("imagen", imageFile); // Imagen como archivo
      }

      const searchParams = new URLSearchParams(window.location.search);
      const productId = searchParams.get("id");

      if (isEditing && productId) {
        await connections.productos.update(Number(productId), formData);
        toast({
          title: "Producto actualizado",
          description: `El producto "${productData.descripcion}" ha sido actualizado correctamente.`,
        });
      } else {
        await connections.productos.create(formData);
        toast({
          title: "Producto creado",
          description: `El producto "${productData.descripcion}" ha sido creado correctamente.`,
        });
      }

      router.push("/productos");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Ha ocurrido un error al guardar el producto",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview && typeof imagePreview !== "string") {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/productos">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">
              {isEditing ? "Editar Producto" : "Nuevo Producto"}
            </h1>
          </div>
        </div>
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="descripcion">
                    Descripción del Producto *
                  </Label>
                  <Input
                    id="descripcion"
                    name="descripcion"
                    value={productData.descripcion}
                    onChange={handleChange}
                    placeholder="Ej: Arroz Faraon 10kg"
                    required
                  />
                </div>

                <div className="space-y-4 p-3 border rounded-md bg-gray-50">
                  <div>
                    <Label
                      htmlFor="precio_sugerido"
                      className="flex items-center gap-1"
                    >
                      <Tag className="h-4 w-4 text-blue-600" />
                      Precio Sugerido *
                    </Label>
                    <Input
                      id="precio_sugerido"
                      name="precio_sugerido"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.precio_sugerido}
                      onChange={handleChange}
                      placeholder="Ej: 599.99"
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="precio_minimo"
                      className="flex items-center gap-1"
                    >
                      <Percent className="h-4 w-4 text-green-600" />
                      Precio Mínimo *
                    </Label>
                    <Input
                      id="precio_minimo"
                      name="precio_minimo"
                      type="number"
                      step="0.01"
                      min="0"
                      value={productData.precio_minimo}
                      onChange={handleChange}
                      placeholder="Ej: 539.99"
                      className="border-green-200 focus:border-green-400"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="categoria_id">Categoría *</Label>
                  <Select
                    value={productData.categoria_id}
                    onValueChange={(value) =>
                      handleSelectChange("categoria_id", value)
                    }
                  >
                    <SelectTrigger id="categoria_id">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="presentacion_id">Presentación *</Label>
                  <Select
                    value={productData.presentacion_id}
                    onValueChange={(value) =>
                      handleSelectChange("presentacion_id", value)
                    }
                  >
                    <SelectTrigger id="presentacion_id">
                      <SelectValue placeholder="Seleccionar presentación" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PRESENTATIONS).map(([id, name]) => (
                        <SelectItem key={id} value={id}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    name="codigo"
                    value={productData.codigo}
                    onChange={handleChange}
                    placeholder="Ej: 2258"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stock *</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    value={productData.stock}
                    onChange={handleChange}
                    placeholder="Ej: 25"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                  <Input
                    id="stock_minimo"
                    name="stock_minimo"
                    type="number"
                    min="0"
                    value={productData.stock_minimo}
                    onChange={handleChange}
                    placeholder="Ej: 5"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="imagen">Imagen</Label>
                  <div className="mt-1 flex flex-col items-center gap-2">
                    <input
                      id="imagen"
                      name="imagen"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="relative w-full h-48 border rounded-md overflow-hidden mt-2">
                      <img
                        src={
                          imagePreview
                            ? imagePreview
                            : productData.imagen
                            ? `${process.env.NEXT_PUBLIC_API_URL}${productData.imagen}`
                            : "/abarrote.webp"
                        }
                        alt={
                          imagePreview
                            ? "Vista previa del producto"
                            : "Imagen por defecto"
                        }
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = "/abarrote.webp";
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Link href="/productos">
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting
                  ? "Guardando..."
                  : isEditing
                  ? "Actualizar Producto"
                  : "Guardar Producto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
