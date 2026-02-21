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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { priorityConfig, taskStatusConfig } from "@/utils/getColors";
import { Project, Task, TaskStatus } from "../../../../../../../typing";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, MoreHorizontal } from "lucide-react";
import Swal from "sweetalert2";
import { deleteTask } from "@/lib/taskapi";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

type Column = {
  header: string;
  accessorKey: string;
};

interface TabTaskTableProps {
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

const TabTaskTable = ({
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
}: TabTaskTableProps) => {
  const { refreshLogs } = useActivityLogs();
  const { data: session } = useSession();
  const user = session?.user;

  const columns: Column[] = [
    { header: "", accessorKey: "select" },
    { header: "Tarea", accessorKey: "task" },
    { header: "Estado", accessorKey: "status" },
    { header: "Prioridad", accessorKey: "priority" },
    { header: "Asignados", accessorKey: "assignees" },
    { header: "Fecha Límite", accessorKey: "dueDate" },
    { header: "", accessorKey: "actions" },
  ];

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

  // Efecto para propagar cambios de selección
  useEffect(() => {
    if (handleSelectionChange && selectedTask) {
      handleSelectionChange(selectedTask);
    }
  }, [selectedTask, handleSelectionChange]);

  return (
    <div className="overflow-x-auto">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-800"
        >
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-blue-50 to-blue-100/50 border-b-2 border-blue-200 hover:bg-linear-to-r hover:from-blue-50 hover:to-blue-100/50">
            {columns.map((col) => (
              <TableHead
                key={col.accessorKey}
                className="text-blue-900 font-semibold"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!project.tasks || project.tasks.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-16 px-4"
              >
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-10 w-10 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">
                  No hay tareas en este proyecto
                </p>
              </TableCell>
            </TableRow>
          ) : (
            project.tasks?.map((task, index) => {
              const taskStatus =
                taskStatusConfig[task.status as keyof typeof taskStatusConfig];
              const priority =
                priorityConfig[task.priority as keyof typeof priorityConfig];
              const isCompleted = task?.status === "COMPLETADA";
              const isCancel = task?.status === "CANCELADA";
              return (
                <TableRow
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewTask(task);
                  }}
                  className={`hover:bg-blue-50 transition-all duration-150 border-b border-blue-100 cursor-pointer ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                  }`}
                >
                  <TableCell
                    className="pl-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={
                        selectedTask ? selectedTask.id === task.id : false
                      }
                      onCheckedChange={(checked) =>
                        handleSelectOne(checked as boolean, task)
                      }
                      className="border-2 border-blue-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:text-white h-5 w-5 rounded-md cursor-pointer"
                    />
                  </TableCell>
                  <TableCell className="py-4">
                    <span
                      className={`font-semibold text-sm ${
                        task.status === TaskStatus.COMPLETADA
                          ? "line-through text-gray-400"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${taskStatus.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                    >
                      {taskStatus.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${priority.className} font-semibold text-xs px-3 py-1 rounded-full border-2`}
                    >
                      {priority.label}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
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
                                        className="h-9 w-9 border-3 border-white ring-2 ring-blue-300 shadow-md hover:scale-110 transition-transform cursor-pointer"
                                        style={{ zIndex: 3 - index }}
                                      >
                                        <AvatarFallback className="text-xs bg-linear-to-br from-blue-600 to-blue-700 text-white font-bold">
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
                                <div className="bg-blue-100 text-blue-700 rounded-full px-2 py-1 text-xs font-bold ml-1 shadow-sm cursor-pointer hover:bg-blue-200 transition-colors">
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
                      <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-3 py-1 rounded-full">
                        Sin asignar
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700 text-sm font-semibold">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Sin fecha"}
                      </span>
                    </div>
                  </TableCell>
                  {task.assignees?.some((a) => a.user.id === user?.id) && (
                    <TableCell className="pr-6">
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
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabTaskTable;
