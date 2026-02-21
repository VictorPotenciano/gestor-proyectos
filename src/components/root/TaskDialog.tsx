import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { priorityConfig, taskStatusConfig } from "@/utils/getColors";
import {
  Calendar,
  User,
  Clock,
  CheckCircle2,
  Star,
  FileText,
  Folder,
} from "lucide-react";
import { Task } from "../../../typing";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useRouter } from "next/navigation";

interface TaskDialogProp {
  open: boolean;
  onClose: () => void;
  task: Task | null;
  showProjectName?: boolean;
}

const TaskDialog = ({
  open,
  onClose,
  task,
  showProjectName = false,
}: TaskDialogProp) => {
  const router = useRouter();
  if (!task) return null;

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "No definida";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
  };

  const handleClickProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  const statusInfo = taskStatusConfig[task.status];
  const StatusIcon = statusInfo.icon;
  const priorityInfo = priorityConfig[task.priority];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-full rounded-t-2xl rounded-b-none sm:rounded-2xl sm:max-w-lg md:max-w-2xl bg-white border border-blue-600 shadow-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="space-y-2 pt-1 sm:pt-2">
          {showProjectName && task.project && (
            <div
              onClick={() => handleClickProject(task.projectId)}
              className="flex items-center gap-2 text-sm text-blue-500 mb-1 cursor-pointer hover:bg-blue-50 w-fit px-2 py-1 rounded transition-colors"
            >
              <Folder className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium truncate">{task.project.name}</span>
            </div>
          )}
          <DialogTitle className="text-xl sm:text-2xl font-bold bg-blue-600 bg-clip-text text-transparent leading-tight">
            {task.title}
          </DialogTitle>
          <DialogDescription className="text-gray-500 text-sm sm:text-base">
            Detalles de la tarea seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4 sm:py-6">
          {/* Estado y Prioridad */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-white rounded-xl p-3 sm:p-4 border border-blue-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div
                  className={`p-1.5 rounded-lg ${
                    statusInfo.className.includes("green")
                      ? "bg-green-100"
                      : statusInfo.className.includes("yellow")
                        ? "bg-yellow-100"
                        : "bg-gray-100"
                  }`}
                >
                  <StatusIcon className={`w-4 h-4 ${statusInfo.className}`} />
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Estado
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold ${statusInfo.className} shadow-sm`}
              >
                <StatusIcon className="w-4 h-4 shrink-0" />
                {statusInfo.label}
              </span>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 border border-blue-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="p-1.5 rounded-lg bg-orange-100">
                  <Star className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                  Prioridad
                </span>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-sm font-semibold border-2 ${priorityInfo.className} shadow-sm`}
              >
                {priorityInfo.label}
              </span>
            </div>
          </div>

          {/* Descripción */}
          {task.description && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blue-600 shadow-sm">
              <h4 className="text-sm font-bold text-blue-600 mb-2 sm:mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                Descripción
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-4 overflow-hidden break-all w-full min-w-0">
                {task.description}
              </p>
            </div>
          )}

          {/* Fechas */}
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-blue-600 shadow-sm">
            <h4 className="text-sm font-bold text-blue-600 mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
              Información temporal
            </h4>
            <div
              className={`grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 ${
                task.completedAt ? "sm:grid-cols-3" : "sm:grid-cols-2"
              }`}
            >
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg shrink-0">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                    Vencimiento
                  </span>
                </div>
                <p className="text-sm font-medium text-blue-700 pl-8 sm:pl-10">
                  {formatDate(task.dueDate)}
                </p>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg shrink-0">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                    Creación
                  </span>
                </div>
                <p className="text-sm font-medium text-blue-700 pl-8 sm:pl-10">
                  {formatDate(task.createdAt)}
                </p>
              </div>

              {task.completedAt && (
                <div className="space-y-1.5 sm:space-y-2 xs:col-span-2 sm:col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                    </div>
                    <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                      Completada
                    </span>
                  </div>
                  <p className="text-sm font-medium text-blue-700 pl-8 sm:pl-10">
                    {formatDate(task.completedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Asignados */}
          {task.assignees && task.assignees.length > 0 && (
            <div className="bg-white rounded-xl p-4 sm:p-5 border border-blue-600 shadow-sm">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg shrink-0">
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
                </div>
                <h4 className="text-sm font-bold text-blue-600">
                  Miembros asignados
                </h4>
                <span className="ml-auto bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                  {task.assignees.length}
                </span>
              </div>
              <div className="flex flex-col md:flex-row gap-2 pb-1 sm:pb-0">
                {task.assignees.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="group flex items-center gap-2 sm:gap-3 bg-linear-to-br from-blue-50 to-purple-50 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white shadow-sm">
                      <AvatarFallback className="bg-blue-600 text-white text-xs sm:text-sm font-medium">
                        {assignment.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-blue-700 transition-colors whitespace-nowrap">
                      {assignment.user.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
