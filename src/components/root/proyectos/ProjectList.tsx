import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectFilters from "./ProjectFilters";
import { PaymentStatus, Project, ProjectStatus } from "../../../../typing";
import { FolderKanban } from "lucide-react";
import PaginationTable from "../PaginationTable";
import ProjectTable from "./ProjectTable";
import Swal from "sweetalert2";
import { deleteProject } from "@/lib/projectapi";
import { useActivityLogs } from "@/context/ActivityLogContext";
import ProjectButtons from "./ProjectButtons";
import ProjectCard from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  calculateProgress: (project: Project) => number;
  handleClickProject: (projectId: string) => void;
  handleEditProject: (project: Project) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedStatus: "todos" | ProjectStatus;
  handleStatusClick: (filter: ProjectStatus) => void;
  selectedPaymentStatus: "todos" | PaymentStatus;
  handlePaymentStatusClick: (filter: PaymentStatus) => void;
  loadProjects: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedProjects: Project | null;
  setSelectedProjects: React.Dispatch<React.SetStateAction<Project | null>>;
}

const ProjectList = ({
  projects,
  currentPage,
  totalPages,
  handlePageChange,
  calculateProgress,
  handleClickProject,
  handleEditProject,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  handleStatusClick,
  selectedPaymentStatus,
  handlePaymentStatusClick,
  loadProjects,
  setError,
  selectedProjects,
  setSelectedProjects,
}: ProjectListProps) => {
  const { refreshLogs } = useActivityLogs();

  const handleDeleteProject = async (project: Project) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar el proyecto ${project.name}.`,
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
        await deleteProject(project.id);
        loadProjects();
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "El proyecto ha sido eliminado con exito.",
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

  const handleSelectionChange = (newSelectedProjects: Project) => {
    setSelectedProjects(newSelectedProjects);
  };

  return (
    <Card className="bg-white border border-blue-600 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <FolderKanban className="h-7 w-7" />
            Lista de Proyectos
          </CardTitle>
          <ProjectFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedStatus={selectedStatus}
            handleStatusClick={handleStatusClick}
            selectedPaymentStatus={selectedPaymentStatus}
            handlePaymentStatusClick={handlePaymentStatusClick}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {selectedProjects && (
          <ProjectButtons
            selectedProjects={selectedProjects}
            loadProjects={loadProjects}
            setError={setError}
            projects={projects}
          />
        )}
        {/* En ordenador tabla */}
        <div className="hidden lg:block">
          <ProjectTable
            projects={projects}
            calculateProgress={calculateProgress}
            handleClickProject={handleClickProject}
            handleEditProject={handleEditProject}
            handleDeleteProject={handleDeleteProject}
            selectedProjects={selectedProjects}
            setSelectedProjects={setSelectedProjects}
            handleSelectionChange={handleSelectionChange}
          />
        </div>
        {/* En movil y tablet card */}
        <div className="lg:hidden space-y-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-blue-600">
              <FolderKanban className="h-16 w-16 mx-auto mb-4 opacity-60" />
              <p className="text-lg font-medium">
                No se han encontrado proyectos
              </p>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                calculateProgress={calculateProgress}
                handleClickProject={handleClickProject}
                handleEditProject={handleEditProject}
                handleDeleteProject={handleDeleteProject}
                selectedProject={selectedProjects}
                setSelectedProject={setSelectedProjects}
                handleSelectionChange={handleSelectionChange}
              />
            ))
          )}
        </div>
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

export default ProjectList;
