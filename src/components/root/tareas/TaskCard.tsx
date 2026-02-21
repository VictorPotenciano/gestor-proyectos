import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Calendar } from "lucide-react";
import { Task } from "../../../../typing";
import { priorityConfig, taskStatusConfig } from "@/utils/getColors";
import { useRouter } from "next/navigation";

interface TaskCardProps {
  task: Task;
  handleViewTask: (task: Task) => void;
  handleDeleteTask: (task: Task) => void;
}

const TaskCard = ({
  task,
  handleViewTask,
  handleDeleteTask,
}: TaskCardProps) => {
  const priority = priorityConfig[task.priority as keyof typeof priorityConfig];
  const status = taskStatusConfig[task.status as keyof typeof taskStatusConfig];
  const isCompleted = task.status === "COMPLETADA";
  const router = useRouter();

  const handleClickProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  return (
    <div
      onClick={() => handleViewTask(task)}
      className={`relative flex flex-col md:flex-row md:items-start gap-4 p-4 sm:p-5 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50/70 transition-all duration-200 cursor-pointer group ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      {/* Menú en móvil/tablet */}
      <div className="absolute top-3 right-3 z-10 md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100/80 backdrop-blur-sm cursor-pointer"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Abrir menú</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="border-blue-200 bg-white/95 backdrop-blur-sm"
          >
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleClickProject(task.projectId);
              }}
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Ver Proyecto
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteTask(task);
              }}
              className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-2 items-start md:items-center gap-4 md:gap-x-6 pr-10 md:pr-0">
        {/* Título y proyecto */}
        <div className="flex flex-col gap-1.5">
          <p
            className={`font-semibold text-blue-900 text-base sm:text-lg leading-tight ${
              isCompleted ? "line-through" : ""
            }`}
          >
            {task.title}
          </p>
          <span className="inline-block text-xs text-blue-600 bg-blue-100/70 px-2.5 py-1 rounded-full w-fit">
            {task.project.name}
          </span>
        </div>

        {/* Fecha, status, prioridad */}
        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 order-3 md:order-0 md:justify-end">
          <Badge
            variant="outline"
            className={`${status.className} text-xs px-2.5 sm:px-3 py-1 font-medium min-w-22.5 sm:w-24 justify-center`}
          >
            {status.label}
          </Badge>

          <Badge
            variant="outline"
            className={`${priority.className} text-xs px-2.5 sm:px-3 py-1 font-medium min-w-20 sm:w-20 justify-center`}
          >
            {priority.label}
          </Badge>

          <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-white px-2.5 py-1.5 rounded-lg border border-blue-100 min-w-27.5 sm:w-28 justify-center">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium whitespace-nowrap">
              {task.dueDate
                ? new Date(task.dueDate).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                  })
                : "Sin fecha"}
            </span>
          </div>

          {/* Menú solo visible en ordenador */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
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
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClickProject(task.projectId);
                  }}
                  className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                >
                  Ver Proyecto
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask(task);
                  }}
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
  );
};

export default TaskCard;
