import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { paymentConfig, statusConfig } from "@/utils/getColors";
import { Project, TaskStatus } from "../../../../typing";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";

interface ProjectCardProps {
  project: Project;
  calculateProgress: (project: Project) => number;
  handleClickProject: (projectId: string) => void;
  handleEditProject: (project: Project) => void;
  handleDeleteProject: (project: Project) => void;
  selectedProject: Project | null;
  setSelectedProject: React.Dispatch<React.SetStateAction<Project | null>>;
  handleSelectionChange?: (selectedProject: Project) => void;
}

const ProjectCard = ({
  project,
  calculateProgress,
  handleClickProject,
  handleEditProject,
  handleDeleteProject,
  selectedProject,
  setSelectedProject,
  handleSelectionChange,
}: ProjectCardProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const taskProgress = calculateProgress(project);
  const paymentProgress = (project.paidAmount / project.totalAmount) * 100;
  const status = statusConfig[project.status as keyof typeof statusConfig];
  const payment =
    paymentConfig[project.paymentStatus as keyof typeof paymentConfig];

  const isSelected = selectedProject?.id === project.id;

  const handleSelect = (checked: boolean) => {
    if (checked) {
      setSelectedProject(project);
    } else {
      setSelectedProject(null);
    }
  };

  useEffect(() => {
    if (handleSelectionChange && selectedProject) {
      handleSelectionChange(selectedProject);
    }
  }, [selectedProject, handleSelectionChange]);

  return (
    <Card
      className={`
        overflow-hidden border-blue-100 hover:border-blue-300 
        transition-all cursor-pointer hover:shadow-md
        ${isSelected ? "border-blue-500 bg-blue-50/40" : ""}
      `}
      onClick={() => handleClickProject(project.id)}
    >
      {/* Header con título, cliente y checkbox */}
      <CardHeader className="pb-3 pt-4 px-4 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-semibold text-blue-900 truncate">
              {project.name}
            </CardTitle>
            <p className="text-sm text-blue-600 mt-0.5 truncate">
              {project.customer?.name || "—"}
            </p>
          </div>

          <div onClick={(e) => e.stopPropagation()} className="shrink-0 pt-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => handleSelect(checked as boolean)}
              className="text-blue-600 cursor-pointer"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-700 hover:text-blue-800 hover:bg-blue-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Acciones</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="border-blue-200 min-w-45"
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditProject(project);
                  }}
                  className="text-blue-900 focus:bg-blue-50 cursor-pointer"
                >
                  Editar proyecto
                </DropdownMenuItem>
                {project.ownerId === user?.id && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project);
                    }}
                    className="text-red-600 focus:bg-red-50 cursor-pointer"
                  >
                    Eliminar proyecto
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 sm:px-5 pb-4 space-y-4">
        {/* Estado */}
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-blue-900">
            Estado
          </span>
          <Badge
            variant="outline"
            className={`${status.color} text-xs sm:text-sm px-2.5 py-0.5`}
          >
            {status.label}
          </Badge>
        </div>

        {/* Progreso de tareas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-blue-900">Progreso tareas</span>
            <span className="text-muted-foreground">
              {project.tasks?.filter((t) => t.status === TaskStatus.COMPLETADA)
                .length || 0}
              /{project.tasks?.length || 0}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={taskProgress}
              className={`h-2 flex-1 [&>div]:transition-all ${
                taskProgress >= 90
                  ? "[&>div]:bg-blue-600"
                  : taskProgress < 30
                    ? "[&>div]:bg-blue-300"
                    : "[&>div]:bg-blue-500"
              }`}
            />
            <span className="text-xs font-medium tabular-nums w-10 text-right">
              {taskProgress}%
            </span>
          </div>
        </div>

        {/* Progreso de pago */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="font-medium text-blue-900">Progreso pago</span>
            <Badge
              variant="outline"
              className={`${payment.color} text-xs px-2 py-0`}
            >
              {payment.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Progress
              value={paymentProgress}
              className={`h-2 flex-1 bg-blue-100 [&>div]:transition-all ${
                paymentProgress >= 90
                  ? "[&>div]:bg-blue-600"
                  : paymentProgress < 30
                    ? "[&>div]:bg-blue-300"
                    : "[&>div]:bg-blue-500"
              }`}
            />
            <span className="text-xs font-medium tabular-nums w-10 text-right">
              {Math.round(paymentProgress)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {project.paidAmount.toLocaleString("es-ES")}€ /{" "}
            {project.totalAmount.toLocaleString("es-ES")}€
          </p>
        </div>

        {/* Fecha límite */}
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="text-blue-900">Fecha límite</span>
          <span className="font-medium text-blue-700">
            {project.dueDate
              ? new Date(project.dueDate).toLocaleDateString("es-ES")
              : "Sin fecha"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
