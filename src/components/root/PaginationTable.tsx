import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
}

const PaginationTable = ({
  currentPage,
  totalPages,
  handlePageChange,
}: PaginationProps) => {
  const getVisiblePages = () => {
    const maxVisible = 3;

    if (totalPages <= maxVisible) {
      // Si hay 3 o menos páginas, mostrarlas todas
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Si estamos en las primeras páginas
    if (currentPage <= 2) {
      return [1, 2, 3];
    }

    // Si estamos en las últimas páginas
    if (currentPage >= totalPages - 1) {
      return [totalPages - 2, totalPages - 1, totalPages];
    }

    // Si estamos en el medio, mostrar la actual y una a cada lado
    return [currentPage - 1, currentPage, currentPage + 1];
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-6 rounded-lg shadow-sm">
      <Pagination className="select-none">
        <PaginationContent className="flex items-center gap-1">
          {/* Botón Anterior */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="gap-1.5 px-3 h-9 rounded-md text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Previus</span>
            </Button>
          </PaginationItem>

          {/* Números de página */}
          {visiblePages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => handlePageChange(page)}
                isActive={currentPage === page}
                className={`cursor-pointer min-w-8 h-8 transition-colors ${
                  currentPage === page
                    ? "text-blue-600 hover:bg-blue-600 hover:text-white"
                    : "bg-white text-blue-600 border border-blue-600 hover:bg-blue-600 hover:text-white"
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {/* Botón Siguiente */}
          <PaginationItem>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="gap-1.5 px-3 h-9 rounded-md text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default PaginationTable;
