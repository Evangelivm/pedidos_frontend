"use client";

import {
  ShoppingCart,
  Plus,
  Truck,
  Package,
  CreditCard,
  DollarSign,
  Building,
  Users,
  Menu,
  X,
  PackageCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CurrentDateTime } from "@/components/current-date-time";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function TopBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Función para determinar si un enlace está activo
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  // Función para obtener las clases de estilo según si está activo o no
  const getLinkClasses = (path: string) => {
    return isActive(path)
      ? "text-orange-500 hover:bg-blue-600 hover:text-white hover:scale-105 transition-all duration-200 flex items-center gap-1 font-medium px-2"
      : "text-white hover:bg-blue-600 hover:scale-105 transition-all duration-200 flex items-center gap-1 font-medium px-2";
  };

  // Función para obtener las clases de estilo para el menú móvil
  const getMobileLinkClasses = (path: string) => {
    return isActive(path)
      ? "text-orange-500 hover:bg-blue-600 hover:text-white w-full py-3 px-4 flex items-center gap-2 font-medium"
      : "text-white hover:bg-blue-600 w-full py-3 px-4 flex items-center gap-2 font-medium";
  };

  // Detectar si es móvil
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Comprobar al cargar
    checkIfMobile();

    // Comprobar al cambiar el tamaño de la ventana
    window.addEventListener("resize", checkIfMobile);

    // Limpiar el event listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Cerrar el menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Evitar scroll cuando el menú está abierto en móvil
  useEffect(() => {
    if (isMobile) {
      if (isMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "auto";
      }
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isMenuOpen, isMobile]);

  const menuItems = [
    {
      path: "/agregar",
      icon: <Plus className="h-4 w-4" />,
      label: "Nuevo Pedido",
    },
    { path: "/", icon: <ShoppingCart className="h-5 w-5" />, label: "Pedidos" },
    {
      path: "/productos",
      icon: <Package className="h-5 w-5" />,
      label: "Productos",
    },
    // {
    //   path: "/despachos",
    //   icon: <Truck className="h-5 w-5" />,
    //   label: "Despachos",
    // },
    // {
    //   path: "/pagos",
    //   icon: <CreditCard className="h-5 w-5" />,
    //   label: "Pagos",
    // },
    // {
    //   path: "/caja-chica",
    //   icon: <DollarSign className="h-5 w-5" />,
    //   label: "Caja Chica",
    // },
    // {
    //   path: "/proveedores",
    //   icon: <Building className="h-5 w-5" />,
    //   label: "Proveedores",
    // },
    {
      path: "/clientes",
      icon: <Users className="h-5 w-5" />,
      label: "Clientes",
    },
    {
      path: "/entrada-mercaderia",
      icon: <PackageCheck className="h-5 w-5" />,
      label: "Entrada Mercadería",
    },
  ];

  return (
    <>
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white py-4 px-6 shadow-md relative z-20">
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform hover:scale-105"
            >
              <div className="relative h-10 w-36">
                <Image
                  src="/logo.png"
                  alt="Grupo Fernandez Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <h1 className="text-xl font-bold">CASERITO</h1>
            </Link>
          </div>

          {/* Botón de menú hamburguesa para móvil */}
          <button
            className="lg:hidden text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          {/* Contenedor para menú y fecha/hora */}
          <div className="hidden lg:flex items-center justify-between flex-grow ml-4">
            {/* Menú horizontal para pantallas grandes */}
            <div className="flex justify-center gap-1 items-center">
              {menuItems.map((item) => (
                <Link href={item.path} key={item.path}>
                  <Button variant="ghost" className={getLinkClasses(item.path)}>
                    {item.icon}
                    <span className="hidden xl:inline text-md font-semibold uppercase">
                      {item.label}
                    </span>
                  </Button>
                </Link>
              ))}
            </div>

            {/* Fecha y hora a la derecha del menú */}
            <div className="hidden lg:block">
              <CurrentDateTime />
            </div>
          </div>
        </div>
      </div>

      {/* Menú desplegable para móvil */}
      {isMobile && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-10 transition-opacity duration-300 ${
            isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <div
            className={`fixed top-[72px] right-0 h-[calc(100vh-72px)] w-64 bg-blue-800 shadow-xl transform transition-transform duration-300 ease-in-out ${
              isMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col py-2">
              {/* Fecha y hora en móvil */}
              <div className="px-4 py-2 border-b border-blue-700">
                <CurrentDateTime />
              </div>

              {/* Elementos del menú */}
              <nav className="flex flex-col mt-2">
                {menuItems.map((item) => (
                  <Link href={item.path} key={item.path}>
                    <Button
                      variant="ghost"
                      className={getMobileLinkClasses(item.path)}
                    >
                      {item.icon}
                      <span className="text-lg font-semibold uppercase">
                        {item.label}
                      </span>
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
