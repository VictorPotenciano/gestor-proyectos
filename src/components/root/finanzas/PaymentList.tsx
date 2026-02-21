import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PaginationTable from "@/components/root/PaginationTable";
import ProjectFilters from "@/components/root/proyectos/ProjectFilters";
import { Euro, FolderKanban } from "lucide-react";
import { PaymentStatus, Project } from "../../../../typing";
import PaymentCard from "./PaymentCard";

interface PaymentListProps {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedPaymentStatus: "todos" | PaymentStatus;
  handlePaymentStatusClick: (status: "todos" | PaymentStatus) => void;
  handlePageChange: (page: number) => void;
  handleClickProject: (projectId: string) => void;
}

const PaymentList = ({
  projects,
  currentPage,
  totalPages,
  searchTerm,
  setSearchTerm,
  selectedPaymentStatus,
  handlePaymentStatusClick,
  handlePageChange,
  handleClickProject,
}: PaymentListProps) => {
  return (
    <Card className="bg-white border border-blue-600 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Euro className="h-7 w-7" />
            Estado de Pagos
          </CardTitle>
          <ProjectFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedPaymentStatus={selectedPaymentStatus}
            handlePaymentStatusClick={handlePaymentStatusClick}
            showStatusFilter={false}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center text-blue-600">
            <FolderKanban className="h-16 w-16 mb-4 opacity-50" />
            <p className="text-xl font-medium mb-2">
              No se han encontrado proyectos
            </p>
          </div>
        ) : (
          projects.map((project) => {
            return (
              <PaymentCard
                key={project.id}
                project={project}
                handleClickProject={handleClickProject}
              />
            );
          })
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

export default PaymentList;
