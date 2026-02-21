import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  itemLabel?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  disabled = false,
  itemLabel = "elementos",
}: PaginationProps) => {
  // Lógica para los botones de paginación
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      // Si hay 5 páginas o menos, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Siempre mostrar la primera página
    pages.push(1);

    if (currentPage <= 3) {
      // Cerca del inicio: [1] 2 3 ... última
      pages.push(2, 3);
      if (totalPages > 4) pages.push("ellipsis-end");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      // Cerca del final: 1 ... antepenúltima penúltima [última]
      pages.push("ellipsis-start");
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // En el medio: 1 ... anterior [actual] siguiente ... última
      pages.push("ellipsis-start");
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push("ellipsis-end");
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  // Determinar cuántos números de página mostrar según el tamaño de pantalla
  const getVisiblePageNumbers = () => {
    if (typeof window === "undefined") return pageNumbers; // SSR

    if (window.innerWidth < 640) {
      // móvil
      return pageNumbers.filter((page) => {
        if (typeof page === "string") return true;
        // En móvil, mostrar solo página actual, primera, última y una alrededor
        return (
          page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1
        );
      });
    }
    return pageNumbers;
  };

  const visiblePageNumbers = getVisiblePageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 bg-linear-to-r from-blue-50 to-white border-t border-blue-100">
      {/* Información de paginación */}
      <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <span className="hidden sm:inline ml-2 text-gray-500">
          ({totalItems} {itemLabel} en total)
        </span>
        {/* Versión corta para móvil */}
        <span className="sm:hidden ml-1 text-gray-500">({totalItems})</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center">
        {/* Botón anterior - texto oculto en móvil */}
        <Button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || disabled}
          variant="outline"
          type="button"
          size="sm"
          className="border-blue-200 hover:bg-blue-50 disabled:opacity-50 cursor-pointer px-2 sm:px-3"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Números de página */}
        <div className="flex gap-1 overflow-x-auto max-w-50 sm:max-w-none px-1 py-1 scrollbar-hide">
          {visiblePageNumbers.map((page, index) => {
            if (typeof page === "string") {
              // Renderizar puntos suspensivos
              return (
                <span
                  key={`${page}-${index}`}
                  className="px-1 sm:px-2 py-1 text-gray-500 text-sm"
                >
                  ...
                </span>
              );
            }

            // Ocultar algunos números en móvil si hay muchos
            const isMobile =
              typeof window !== "undefined" && window.innerWidth < 640;
            const shouldShow =
              !isMobile ||
              page === 1 ||
              page === totalPages ||
              Math.abs(page - currentPage) <= 1;

            if (!shouldShow) return null;

            return (
              <Button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                variant={page === currentPage ? "default" : "outline"}
                type="button"
                size="sm"
                className={
                  page === currentPage
                    ? "bg-blue-600 hover:bg-blue-700 text-white min-w-6 sm:min-w-8 px-1 sm:px-2"
                    : "border-blue-200 hover:bg-blue-50 min-w-6 sm:min-w-8 px-1 sm:px-2 cursor-pointer"
                }
              >
                {page}
              </Button>
            );
          })}
        </div>

        {/* Botón siguiente */}
        <Button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || disabled}
          variant="outline"
          type="button"
          size="sm"
          className="border-blue-200 hover:bg-blue-50 disabled:opacity-50 cursor-pointer px-2 sm:px-3"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
