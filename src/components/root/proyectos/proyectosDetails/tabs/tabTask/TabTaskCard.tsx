import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { priorityConfig, taskStatusConfig } from "@/utils/getColors";
import { Project, Task, TaskStatus } from "../../../../../../../typing";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  MoreHorizontal,
  Users,
} from "lucide-react";
import Swal from "sweetalert2";
import { deleteTask } from "@/lib/taskapi";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

interface TabTaskCardsProps {
  project: Project;
  handleEditTask: (task: Task) => void;
  handleViewTask: (task: Task) => void;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  selectedTask: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  handleSelectionChange?: (selectedTask: Task | null) => void;
}

const TabTaskCard = ({
  project,
  handleEditTask,
  handleViewTask,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
  error,
  setError,
  selectedTask,
  setSelectedTask,
  handleSelectionChange,
}: TabTaskCardsProps) => {
  const { refreshLogs } = useActivityLogs();
  const { data: session } = useSession();
  const user = session?.user;

  const handleDeleteTask = async (task: Task) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar una tarea.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminala",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deleteTask(task.id);
        loadProject(activitiesPage, tasksPage, commentsPage);
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "La tarea ha sido eliminada con exito.",
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

  const handleSelectOne = (checked: boolean, task: Task) => {
    if (checked) {
      setSelectedTask(task);
    } else {
      setSelectedTask(null);
    }
  };

  useEffect(() => {
    if (handleSelectionChange && selectedTask) {
      handleSelectionChange(selectedTask);
    }
  }, [selectedTask, handleSelectionChange]);

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-800"
        >
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {!project.tasks || project.tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium text-center">
            No hay tareas en este proyecto
          </p>
        </div>
      ) : (
        project.tasks.map((task) => {
          const taskStatus =
            taskStatusConfig[task.status as keyof typeof taskStatusConfig];
          const priority =
            priorityConfig[task.priority as keyof typeof priorityConfig];
          const isCompleted = task?.status === "COMPLETADA";
          const isCancel = task?.status === "CANCELADA";
          const isSelected = selectedTask?.id === task.id;

          return (
            <div
              key={task.id}
              onClick={() => handleViewTask(task)}
              className={`
                relative rounded-2xl border-2 p-4 cursor-pointer
                transition-all duration-200 shadow-sm active:scale-[0.99]
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-blue-200 shadow-md"
                    : "border-blue-100 bg-white hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30"
                }
              `}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox */}
                <div
                  className="mt-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) =>
                      handleSelectOne(checked as boolean, task)
                    }
                    className="border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white h-5 w-5 rounded-md cursor-pointer"
                  />
                </div>

                {/* Titulo */}
                <span
                  className={`flex-1 font-semibold text-sm leading-snug ${
                    task.status === TaskStatus.COMPLETADA
                      ? "line-through text-gray-400"
                      : "text-gray-900"
                  }`}
                >
                  {task.title}
                </span>

                {(task.assignees?.some((a) => a.user.id === user?.id) ||
                    project.ownerId === user?.id) && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0"
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
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
                        {!(isCompleted || isCancel) && (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTask(task);
                            }}
                            className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                          >
                            Editar tarea
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task);
                          }}
                          className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
                        >
                          Eliminar tarea
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>

              {/* Tablet */}
              <div className="hidden md:flex items-end gap-6 mt-3">
                {/* Estado */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Estado
                  </span>
                  <Badge
                    variant="outline"
                    className={`${taskStatus.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                  >
                    {taskStatus.label}
                  </Badge>
                </div>

                {/* Prioridad */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Prioridad
                  </span>
                  <Badge
                    variant="outline"
                    className={`${priority.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                  >
                    {priority.label}
                  </Badge>
                </div>

                {/* Asignados */}
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Asignados
                  </span>
                  <div className="flex items-center gap-1.5">
                    {task.assignees && task.assignees.length > 0 ? (
                      <TooltipProvider>
                        <div className="flex items-center gap-1">
                          <div className="flex -space-x-2">
                            {task.assignees
                              .slice(0, 3)
                              .map((assignee, index) => {
                                const initials = assignee.user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase();
                                return (
                                  <Tooltip key={assignee.id}>
                                    <TooltipTrigger asChild>
                                      <Avatar
                                        className="h-7 w-7 border-2 border-white ring-2 ring-blue-300 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                        style={{ zIndex: 3 - index }}
                                      >
                                        <AvatarFallback className="text-[10px] bg-linear-to-br from-blue-600 to-blue-700 text-white font-bold">
                                          {initials}
                                        </AvatarFallback>
                                      </Avatar>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="bg-white p-2 rounded-xl font-medium">
                                        {assignee.user.name}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                );
                              })}
                          </div>
                          {task.assignees.length > 3 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold ml-1 shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
                                  +{task.assignees.length - 3}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex flex-col gap-1">
                                  {task.assignees.slice(3).map((assignee) => (
                                    <p
                                      key={assignee.id}
                                      className="font-medium text-sm"
                                    >
                                      {assignee.user.name}
                                    </p>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TooltipProvider>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-xs text-gray-400 font-semibold">
                          Sin asignar
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fecha límite */}
                <div className="flex flex-col gap-1 items-end ml-auto shrink-0">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Fecha límite
                  </span>
                  <div className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-xs text-gray-600 font-semibold">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "Sin fecha"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Movil*/}
              <div className="flex md:hidden flex-col gap-3 mt-3">
                <div className="flex items-end gap-6">
                  {/* Estado */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Estado
                    </span>
                    <Badge
                      variant="outline"
                      className={`${taskStatus.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                    >
                      {taskStatus.label}
                    </Badge>
                  </div>

                  {/* Prioridad */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Prioridad
                    </span>
                    <Badge
                      variant="outline"
                      className={`${priority.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                    >
                      {priority.label}
                    </Badge>
                  </div>

                  {/* Asignados */}
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Asignados
                    </span>
                    <div className="flex items-center gap-1.5">
                      {task.assignees && task.assignees.length > 0 ? (
                        <TooltipProvider>
                          <div className="flex items-center gap-1">
                            <div className="flex -space-x-2">
                              {task.assignees
                                .slice(0, 3)
                                .map((assignee, index) => {
                                  const initials = assignee.user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase();
                                  return (
                                    <Tooltip key={assignee.id}>
                                      <TooltipTrigger asChild>
                                        <Avatar
                                          className="h-7 w-7 border-2 border-white ring-2 ring-blue-300 shadow-sm hover:scale-110 transition-transform cursor-pointer"
                                          style={{ zIndex: 3 - index }}
                                        >
                                          <AvatarFallback className="text-[10px] bg-linear-to-br from-blue-600 to-blue-700 text-white font-bold">
                                            {initials}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p className="bg-white p-2 rounded-xl font-medium">
                                          {assignee.user.name}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  );
                                })}
                            </div>
                            {task.assignees.length > 3 && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="bg-blue-100 text-blue-700 rounded-full px-2 py-0.5 text-xs font-bold ml-1 shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
                                    +{task.assignees.length - 3}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <div className="flex flex-col gap-1">
                                    {task.assignees.slice(3).map((assignee) => (
                                      <p
                                        key={assignee.id}
                                        className="font-medium text-sm"
                                      >
                                        {assignee.user.name}
                                      </p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TooltipProvider>
                      ) : (
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-xs text-gray-400 font-semibold">
                            Sin asignar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  {/* Fecha límite */}
                  <div className="flex flex-col gap-1 items-end shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Fecha límite
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-blue-400" />
                      <span className="text-xs text-gray-600 font-semibold">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin fecha"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TabTaskCard;
