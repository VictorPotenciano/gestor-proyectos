import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerFilters from "./CustomerFilters";
import CustomerCard from "./CustomerCard";
import PaginationTable from "../PaginationTable";
import { Customer, ProjectStatus } from "../../../../typing";
import Swal from "sweetalert2";
import { deleteCustomer } from "@/lib/customerapi";
import { Users } from "lucide-react";

interface CustomerListProps {
  customers: Customer[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleEditCustomer: (customer: Customer) => void;
  loadCustomers: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const CustomerList = ({
  customers,
  searchTerm,
  setSearchTerm,
  currentPage,
  totalPages,
  handlePageChange,
  handleEditCustomer,
  loadCustomers,
  setError,
}: CustomerListProps) => {
  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar al cliente ${customer.name}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminalo",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deleteCustomer(customer.id);
        loadCustomers();
        Swal.fire({
          title: "Eliminado!",
          text: "El cliente ha sido eliminado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado al eliminar";
      setError(errorMessage);
    }
  };

  return (
    <Card className="bg-white border border-blue-600 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Users className="h-7 w-7" />
            Lista de Clientes
          </CardTitle>
          <CustomerFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {customers.map((customer) => {
          const activeProjects = (customer.projects || []).filter(
            (project) => project.status === ProjectStatus.EN_PROCESO
          ).length;
          return (
            <CustomerCard
              key={customer.id}
              customer={customer}
              activeProjects={activeProjects}
              handleEditCustomer={handleEditCustomer}
              handleDeleteCustomer={handleDeleteCustomer}
            />
          );
        })}
        {customers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <p className="text-blue-600">No se encontraron clientes</p>
          </div>
        )}
        {totalPages > 1 && (
          <PaginationTable
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerList;
