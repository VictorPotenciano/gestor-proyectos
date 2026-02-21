import { Button } from "@/components/ui/button";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { useSession } from "next-auth/react";
import { useTaskActions } from "@/hooks/useTaskActions";
import { Task } from "../../../../../../../typing";

type ButtonInfo = {
  label: string;
  onClick: () => void;
  className: string;
  statusValue?: string;
  priorityValue?: string;
};

interface TabTasksButtonsProps {
  selectedTask: Task | null;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
  showCounter?: boolean;
}

const TabTasksButtons = ({
  selectedTask,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
  setError,
  showCounter = true,
}: TabTasksButtonsProps) => {
  const { refreshLogs } = useActivityLogs();

  const {
    handleCompleteTask,
    handleInProgressTask,
    handleCancelTask,
    handlePendingTask,
    handleInReviewTask,
    handlePriorityHigh,
    handlePriorityLow,
    handlePriorityMedium,
    handlePriorityUrgent,
  } = useTaskActions(
    selectedTask,
    () => loadProject(activitiesPage, tasksPage, commentsPage),
    refreshLogs,
    setError
  );

  const session = useSession();
  const currentUserId = session?.data?.user?.id;

  // Obtener la tarea seleccionada
  const task = selectedTask;

  // Verificar si el usuario actual es miembro asignado a la tarea
  const isAssignedMember = task?.assignees?.some(
    (member) => member.userId === currentUserId
  );

  const isCompleted = task?.status === "COMPLETADA";
  const isCancelled = task?.status === "CANCELADA";

  const buttonsStatus: ButtonInfo[] = [
    {
      label: "En Progreso",
      onClick: () => handleInProgressTask(),
      className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
      statusValue: "EN_PROGRESO",
    },
    {
      label: "Completar",
      onClick: () => handleCompleteTask(),
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      statusValue: "COMPLETADA",
    },
    {
      label: "Cancelar",
      onClick: () => handleCancelTask(),
      className: "bg-red-500 hover:bg-red-600 text-white border-red-500",
      statusValue: "CANCELADA",
    },
    {
      label: "Pendiente",
      onClick: () => handlePendingTask(),
      className:
        "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
      statusValue: "PENDIENTE",
    },
    {
      label: "En Revisión",
      onClick: () => handleInReviewTask(),
      className:
        "bg-purple-500 hover:bg-purple-600 text-white border-purple-500",
      statusValue: "EN_REVISION",
    },
  ];

  const buttonsPriority: ButtonInfo[] = [
    {
      label: "Baja",
      onClick: () => handlePriorityLow(),
      className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
      priorityValue: "BAJA",
    },
    {
      label: "Media",
      onClick: () => handlePriorityMedium(),
      className:
        "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500",
      priorityValue: "MEDIA",
    },
    {
      label: "Alta",
      onClick: () => handlePriorityHigh(),
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      priorityValue: "ALTA",
    },
    {
      label: "Urgente",
      onClick: () => handlePriorityUrgent(),
      className: "bg-red-500 hover:bg-red-600 text-white border-red-500",
      priorityValue: "URGENTE",
    },
  ];

  // Filtrar botones de estado según la tarea seleccionada
  const filteredStatusButtons = task
    ? buttonsStatus.filter((btn) => {
        // No mostrar el botón del estado actual
        if (btn.statusValue === task.status) return false;

        return true;
      })
    : buttonsStatus;

  // Filtrar botones de prioridad según la tarea seleccionada
  const filteredPriorityButtons = task
    ? buttonsPriority.filter((btn) => btn.priorityValue !== task.priority)
    : buttonsPriority;

  // Si no hay tarea seleccionada o el usuario no es miembro asignado, solo mostrar contador
  if (!task || !isAssignedMember) {
    return (
      <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {showCounter && (
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm shrink-0">
              {task ? 1 : 0}
            </div>
            <p className="text-sm whitespace-nowrap">
              <span className="font-semibold text-blue-600">
                {task ? 1 : 0} tarea
              </span>{" "}
              <span className="text-blue-600">seleccionada</span>
            </p>
          </div>
        )}

        {task && !isAssignedMember && (
          <p className="text-sm text-blue-600 italic text-center sm:text-right">
            Solo los miembros asignados pueden modificar esta tarea
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl p-4 sm:p-5 shadow-sm">
      {/* Contador + título */}
      {showCounter && (
        <div className="flex items-center gap-3 mb-4 sm:mb-5">
          <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm shrink-0">
            1
          </div>
          <p className="text-sm font-medium">
            <span className="text-blue-700">1 tarea</span>{" "}
            <span className="text-blue-600">seleccionada</span>
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
        {/* Estado */}
        {!isCompleted && !isCancelled ? (
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2.5">
              Cambiar Estado
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {filteredStatusButtons.map((btn, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className={`font-medium shadow-sm transition-colors ${btn.className} text-xs sm:text-sm py-4 sm:py-2`}
                  onClick={btn.onClick}
                  disabled={!selectedTask}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        ) : isCompleted ? (
          <div className="flex-1 flex items-center justify-center py-3">
            <div className="bg-green-50 border border-green-400 rounded-lg px-5 py-3.5 text-center w-full max-w-md">
              <p className="text-green-700 font-medium text-sm sm:text-base">
                ✓ Tarea completada
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-3">
            <div className="bg-red-50 border border-red-400 rounded-lg px-5 py-3.5 text-center w-full max-w-md">
              <p className="text-red-700 font-medium text-sm sm:text-base">
                Tarea cancelada
              </p>
            </div>
          </div>
        )}

        {/* Prioridad */}
        {!isCompleted && !isCancelled && (
          <div className="flex-1 min-w-0">
            <h3 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2.5">
              Cambiar Prioridad
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {filteredPriorityButtons.map((btn, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className={`font-medium shadow-sm transition-colors ${btn.className} text-xs sm:text-sm py-4 sm:py-2`}
                  onClick={btn.onClick}
                  disabled={!selectedTask}
                >
                  {btn.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TabTasksButtons;
