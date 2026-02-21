import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { PaymentStatus, ProjectStatus } from "../../../../typing";

const allStatuses: ProjectStatus[] = [
  ProjectStatus.EN_PROCESO,
  ProjectStatus.COMPLETADO,
  ProjectStatus.PAUSADO,
  ProjectStatus.CANCELADO,
];

const allPaymentStatuses: PaymentStatus[] = [
  PaymentStatus.A_PLAZOS,
  PaymentStatus.PAGADO,
  PaymentStatus.NO_PAGADO,
];

interface ProjectFiltersProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedStatus?: "todos" | ProjectStatus;
  handleStatusClick?: (filter: ProjectStatus) => void;
  selectedPaymentStatus?: "todos" | PaymentStatus;
  handlePaymentStatusClick?: (filter: PaymentStatus) => void;
  showStatusFilter?: boolean;
}

const ProjectFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  handleStatusClick,
  selectedPaymentStatus,
  handlePaymentStatusClick,
  showStatusFilter = true,
}: ProjectFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Buscar</h4>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
          <Input
            placeholder="Buscar proyectos..."
            className="pl-9 w-full text-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showStatusFilter && (
        <div className="flex flex-col gap-2 w-full lg:w-auto">
          <h4 className="text-blue-600 text-sm font-medium">Estado</h4>
          <Select value={selectedStatus} onValueChange={handleStatusClick}>
            <SelectTrigger className="w-full text-blue-600 cursor-pointer">
              <Filter className="h-4 w-4 mr-2 shrink-0" />
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              align="start"
              sideOffset={5}
              className="bg-white border-blue-200"
            >
              <SelectItem
                value="todos"
                className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                Todos
              </SelectItem>
              {allStatuses.map((status) => (
                <SelectItem
                  key={status}
                  value={status}
                  className="text-sm text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                >
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Estado de Pago</h4>
        <Select
          value={selectedPaymentStatus}
          onValueChange={handlePaymentStatusClick}
        >
          <SelectTrigger className="w-full text-blue-600 cursor-pointer">
            <Filter className="h-4 w-4 mr-2 shrink-0" />
            <SelectValue placeholder="Estado de Pago" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={5}
            className="bg-white border-blue-200"
          >
            <SelectItem
              value="todos"
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Todos
            </SelectItem>
            {allPaymentStatuses.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-sm text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ProjectFilters;
