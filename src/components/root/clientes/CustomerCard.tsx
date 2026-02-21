import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Phone, Mail } from "lucide-react";
import { Customer } from "../../../../typing";

interface CustomerCardProps {
  customer: Customer;
  activeProjects: number;
  handleEditCustomer: (customer: Customer) => void;
  handleDeleteCustomer: (customer: Customer) => void;
}

const CustomerCard = ({
  customer,
  activeProjects,
  handleEditCustomer,
  handleDeleteCustomer,
}: CustomerCardProps) => {
  return (
    <div
      key={customer.id}
      className="relative flex items-start gap-4 p-5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/70 transition-all duration-200"
    >
      {/* Menú en movil */}
      <div className="absolute top-3 right-3 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4 text-blue-600" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-blue-200 bg-white">
            <DropdownMenuItem
              onClick={() => handleEditCustomer(customer)}
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Editar cliente
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteCustomer(customer)}
              className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avatar */}
      <div className="shrink-0 h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
        {customer.name.charAt(0)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-3 md:grid md:grid-cols-[1fr_1.5fr_auto] md:items-center md:gap-x-6">
          {/* Nombre y fecha */}
          <div className="flex flex-col gap-1 pr-8 md:pr-0">
            <p className="font-semibold text-blue-900 text-base leading-tight">
              {customer.name}
            </p>
            <span className="text-xs text-blue-600">
              Cliente desde{" "}
              {new Date(customer.createdAt).toLocaleDateString("es-ES", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Información de contacto */}
          <div className="flex flex-col gap-2">
            {customer.email && (
              <div className="flex items-center gap-2 text-xs lg:text-sm text-blue-700">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
          </div>

          {/* Estadísticas y menú */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300 text-xs px-3 py-1 font-medium"
              >
                {activeProjects} activos
              </Badge>
              <span className="text-xs text-blue-600 font-medium">
                {customer.projectCount} proyectos
              </span>
            </div>

            {/* Menú en tablet y ordenador */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4 text-blue-600" />
                    <span className="sr-only">Abrir menú</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-blue-200 bg-white"
                >
                  <DropdownMenuItem
                    onClick={() => handleEditCustomer(customer)}
                    className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                  >
                    Editar cliente
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteCustomer(customer)}
                    className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;
