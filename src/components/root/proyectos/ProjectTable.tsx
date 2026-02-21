import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { paymentConfig, statusConfig } from "@/utils/getColors";
import { Project, TaskStatus } from "../../../../typing";
import { FolderKanban, MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

type Column = {
  header: string;
  accessorKey: string;
};

interface ProjectTableProps {
  projects: Project[];
  calculateProgress: (project: Project) => number;
  handleClickProject: (projectId: string) => void;
  handleEditProject: (project: Project) => void;
  handleDeleteProject: (project: Project) => void;
  selectedProjects: Project | null;
  setSelectedProjects: React.Dispatch<React.SetStateAction<Project | null>>;
  handleSelectionChange?: (selectedProjects: Project) => void;
}

const ProjectTable = ({
  projects,
  calculateProgress,
  handleClickProject,
  handleEditProject,
  handleDeleteProject,
  selectedProjects,
  setSelectedProjects,
  handleSelectionChange,
}: ProjectTableProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const columns: Column[] = [
    { header: "", accessorKey: "select" },
    { header: "Proyecto", accessorKey: "project" },
    { header: "Estado", accessorKey: "status" },
    { header: "Progreso", accessorKey: "tasks" },
    { header: "Progreso Pago", accessorKey: "paymentStatus" },
    { header: "Fecha Límite", accessorKey: "dueDate" },
    { header: "", accessorKey: "actions" },
  ];

  const handleSelectOne = (checked: boolean, project: Project) => {
    if (checked) {
      setSelectedProjects(project);
    } else {
      setSelectedProjects(null);
    }
  };

  // Efecto para propagar cambios de selección
  useEffect(() => {
    if (handleSelectionChange && selectedProjects) {
      handleSelectionChange(selectedProjects);
    }
  }, [selectedProjects, handleSelectionChange]);

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-blue-100 bg-blue-50">
          {columns.map((col) => (
            <TableHead
              key={col.accessorKey}
              className={`text-blue-900 font-semibold ${
                col.accessorKey === "dueDate" ? "text-right" : ""
              }`}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-20">
              <div className="flex flex-col items-center text-blue-600">
                <FolderKanban className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">
                  No se han encontrado proyectos
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project) => {
            const taskProgress = calculateProgress(project);
            const paymentProgress =
              (project.paidAmount / project.totalAmount) * 100;
            const status =
              statusConfig[project.status as keyof typeof statusConfig];
            const payment =
              paymentConfig[
                project.paymentStatus as keyof typeof paymentConfig
              ];

            return (
              <TableRow
                key={project.id}
                className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  handleClickProject(project.id);
                }}
              >
                <TableCell
                  onClick={(e) => e.stopPropagation()}
                  className="py-5 px-6"
                >
                  <Checkbox
                    checked={
                      selectedProjects
                        ? selectedProjects.id === project.id
                        : false
                    }
                    onCheckedChange={(checked) =>
                      handleSelectOne(checked as boolean, project)
                    }
                    className="text-blue-600 cursor-pointer"
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium text-blue-900">{project.name}</p>
                    <p className="text-sm text-blue-600">
                      {project.customer?.name}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={status.color}>
                    {status.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{taskProgress}%</span>
                      <span className="text-muted-foreground">
                        {project.tasks?.filter(
                          (t) => t.status === TaskStatus.COMPLETADA
                        ).length || 0}
                        /{project.tasks?.length || 0} tareas
                      </span>
                    </div>
                    <Progress
                      value={taskProgress}
                      className={`h-2 [&>div]:transition-all ${
                        taskProgress >= 90
                          ? "[&>div]:bg-blue-600"
                          : taskProgress < 30
                            ? "[&>div]:bg-blue-300"
                            : "[&>div]:bg-blue-500"
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <Badge variant="outline" className={payment.color}>
                        {payment.label}
                      </Badge>
                      <span className="text-muted-foreground">
                        {project.paidAmount.toLocaleString("es-ES")}€ /{" "}
                        {project.totalAmount.toLocaleString("es-ES")}€
                      </span>
                    </div>
                    <Progress
                      value={paymentProgress}
                      className={`h-2.5 bg-blue-100 [&>div]:transition-all ${
                        paymentProgress >= 90
                          ? "[&>div]:bg-blue-600"
                          : paymentProgress < 30
                            ? "[&>div]:bg-blue-300"
                            : "[&>div]:bg-blue-500"
                      }`}
                    />
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-blue-600">
                    {project.dueDate
                      ? new Date(project.dueDate).toLocaleDateString("es-ES")
                      : "Sin fecha"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="border-blue-200 bg-white"
                    >
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                        className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                      >
                        Editar proyecto
                      </DropdownMenuItem>
                      {project.ownerId === user?.id && (
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project);
                          }}
                          className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                        >
                          Eliminar proyecto
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default ProjectTable;
