import { Button } from "@/components/ui/button";
import { Project } from "../../../../typing";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { useSession } from "next-auth/react";
import { useProjectActions } from "@/hooks/useProjectAction";

type ButtonInfo = {
  label: string;
  onClick: () => void;
  className: string;
  statusValue?: string;
  paymentValue?: string;
};

interface ProjectButtonsProps {
  selectedProjects: Project | null;
  loadProjects: () => void;
  setError?: React.Dispatch<React.SetStateAction<string | null>>;
  projects: Project[];
  showCounter?: boolean;
}

const ProjectButtons = ({
  selectedProjects,
  loadProjects,
  setError,
  projects,
  showCounter = true,
}: ProjectButtonsProps) => {
  const { refreshLogs } = useActivityLogs();

  const {
    handleCompleteProject,
    handlePausedProject,
    handleInProgressProject,
    handleCancelProject,
  } = useProjectActions(selectedProjects, loadProjects, refreshLogs, setError);

  const session = useSession();
  const currentUserId = session?.data?.user?.id;

  // Obtener el proyecto seleccionado
  const selectedProject = selectedProjects
    ? projects.find((p) => p.id === selectedProjects.id)
    : null;

  const isOwner = selectedProject?.ownerId === currentUserId;
  const isCompleted = selectedProject?.status === "COMPLETADO";
  const isCancel = selectedProject?.status === "CANCELADO";

  const buttonsStatus: ButtonInfo[] = [
    {
      label: "En Proceso",
      onClick: () => handleInProgressProject(),
      className: "bg-blue-500 hover:bg-blue-600 text-white border-blue-500",
      statusValue: "EN_PROCESO",
    },
    {
      label: "Completar",
      onClick: () => handleCompleteProject(),
      className: "bg-green-500 hover:bg-green-600 text-white border-green-500",
      statusValue: "COMPLETADO",
    },
    {
      label: "Cancelar",
      onClick: () => handleCancelProject(),
      className: "bg-red-500 hover:bg-red-600 text-white border-red-500",
      statusValue: "CANCELADO",
    },
    {
      label: "Pausar",
      onClick: () => handlePausedProject(),
      className:
        "bg-orange-500 hover:bg-orange-600 text-white border-orange-500",
      statusValue: "PAUSADO",
    },
  ];

  // Filtrar botones de estado según el proyecto seleccionado
  const filteredStatusButtons = selectedProject
    ? buttonsStatus.filter((btn) => {
        // No mostrar el botón del estado actual
        if (btn.statusValue === selectedProject.status) return false;

        // Si el proyecto está PAUSADO, no mostrar el botón de COMPLETADO
        if (
          selectedProject.status === "PAUSADO" &&
          btn.statusValue === "COMPLETADO"
        ) {
          return false;
        }

        return true;
      })
    : buttonsStatus;

  // Si no hay proyecto seleccionado o el usuario no es owner, solo mostrar contador
  if (!selectedProject || !isOwner) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3">
        {showCounter && (
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm shrink-0">
              {selectedProject ? 1 : 0}
            </div>
            <p className="text-sm whitespace-nowrap">
              <span className="font-semibold text-blue-600">
                {selectedProject ? 1 : 0} proyecto
              </span>{" "}
              <span className="text-blue-600">seleccionado</span>
            </p>
          </div>
        )}

        {selectedProject && !isOwner && (
          <p className="text-sm text-blue-600 italic text-left sm:text-right">
            Solo el propietario puede modificar este proyecto
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="border border-blue-600 bg-white rounded-xl p-4 sm:p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-5">
        {/* Contador */}
        {showCounter && (
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
              1
            </div>
            <p className="text-sm whitespace-nowrap">
              <span className="font-semibold text-blue-600">1 proyecto</span>{" "}
              <span className="text-blue-600">seleccionado</span>
            </p>
          </div>
        )}

        {/* Sección de botones o mensajes de estado */}
        <div className="flex-1 min-w-0">
          {!isCompleted && !isCancel ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Cambiar Estado
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                {filteredStatusButtons.map((button, index) => (
                  <Button
                    key={index}
                    size="sm"
                    variant="outline"
                    className={`font-medium shadow-sm ${button.className} text-xs sm:text-sm py-4 sm:py-2`}
                    onClick={button.onClick}
                    disabled={!selectedProjects}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </div>
          ) : isCompleted ? (
            <div className="flex items-center justify-center min-h-15">
              <div className="bg-green-50 border border-green-500 rounded-lg px-4 py-3 w-full max-w-md text-center">
                <p className="text-green-700 font-medium text-sm">
                  ✓ Proyecto completado
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-15">
              <div className="bg-red-50 border border-red-500 rounded-lg px-4 py-3 w-full max-w-md text-center">
                <p className="text-red-700 font-medium text-sm">
                  Proyecto cancelado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectButtons;
