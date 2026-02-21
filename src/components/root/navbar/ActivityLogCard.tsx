import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BellOff, X } from "lucide-react";
import {
  getActivityIcon,
  getActivityStyles,
  getRelativeTime,
} from "@/utils/getColors";
import { ACTIVITY_DESCRIPTIONS, ActivityLog } from "../../../../typing";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface ActivityLogCardProps {
  logs: ActivityLog[];
  loadingLogs: boolean;
  setShowActvityMenu: React.Dispatch<React.SetStateAction<boolean>>;
  hiddenLogIds?: Set<string>;
  setHiddenLogIds?: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const ActivityLogCard = ({
  logs,
  loadingLogs,
  setShowActvityMenu,
  hiddenLogIds,
  setHiddenLogIds,
}: ActivityLogCardProps) => {
  const router = useRouter();
  const { data: session } = useSession();

  const visibleLogs = logs.filter((log) => !hiddenLogIds?.has(log.id));

  const handleHideLog = (logId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenLogIds?.((prev) => {
      const newSet = new Set(prev);
      newSet.add(logId);
      return newSet;
    });
  };

  const handleHideAllLogs = () => {
    if (!setHiddenLogIds || visibleLogs.length === 0) return;

    setHiddenLogIds?.((prev) => {
      const newSet = new Set(prev);
      visibleLogs.forEach((log) => {
        newSet.add(log.id);
      });
      return newSet;
    });
  };

  const handleGoToProject = (log: ActivityLog) => {
    if (!log.project?.id) return;

    // Si es un log de PROJECT_REMOVED, no permitir navegar
    if (log.type === "PROJECT_REMOVED") {
      return;
    }

    // Si es un log de MEMBER_REMOVED y el usuario actual es el removido, no permitir navegar
    if (log.type === "MEMBER_REMOVED" && log.metadata) {
      if (
        typeof log.metadata === "object" &&
        log.metadata !== null &&
        "userId" in log.metadata &&
        log.metadata.userId === session?.user?.id
      ) {
        return;
      }
    }

    router.push(`/proyectos/${log.project.id}`);
    setShowActvityMenu(false);
  };

  const isLogClickable = (log: ActivityLog) => {
    // Si es un log de PROJECT_REMOVED, no es clickable
    if (log.type === "PROJECT_REMOVED") {
      return false;
    }

    // Si es un log de MEMBER_REMOVED y el usuario actual es el removido, no es clickable
    if (log.type === "MEMBER_REMOVED" && log.metadata) {
      if (
        typeof log.metadata === "object" &&
        log.metadata !== null &&
        "userId" in log.metadata &&
        log.metadata.userId === session?.user?.id
      ) {
        return false;
      }
    }
    return true;
  };

  const getActivityDescription = (log: ActivityLog) => {
    const baseDescription = ACTIVITY_DESCRIPTIONS[log.type];

    // Si es MEMBER_ADDED o MEMBER_REMOVED, intentar obtener el nombre del usuario afectado
    if (
      (log.type === "MEMBER_ADDED" || log.type === "MEMBER_REMOVED") &&
      log.metadata
    ) {
      if (
        typeof log.metadata === "object" &&
        log.metadata !== null &&
        "userName" in log.metadata &&
        typeof log.metadata.userName === "string"
      ) {
        // Reemplazar o añadir el nombre del usuario afectado
        return `${baseDescription} a ${log.metadata.userName}`;
      }
    }

    return baseDescription;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={() => setShowActvityMenu(false)}
      />
      <Card className="fixed left-1/2 -translate-x-1/2 top-16 sm:absolute sm:left-auto sm:translate-x-0 sm:right-0 sm:top-auto sm:mt-2 w-[calc(100vw-1rem)] sm:w-95 max-w-sm bg-white rounded-lg shadow-xl border border-blue-600 z-40 pointer-events-auto">
        <CardHeader className="pb-3 flex flex-wrap justify-between items-center gap-2 px-4 pt-4">
          <CardTitle className="text-lg font-semibold text-blue-600">
            Actividad Reciente
          </CardTitle>
          {visibleLogs.length > 0 && (
            <button
              onClick={handleHideAllLogs}
              className="w-fit flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
            >
              <BellOff className="h-4 w-4" />
              Ocultar todas
            </button>
          )}
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : visibleLogs.length === 0 ? (
            <p className="text-sm text-blue-500 text-center py-8">
              No hay actividad reciente
            </p>
          ) : (
            <div className="space-y-4 max-h-[60vh] sm:max-h-110">
              {visibleLogs.slice(0, 5).map((log, index) => {
                const Icon = getActivityIcon(log.type);
                const styles = getActivityStyles(log.type);
                const relativeTime = getRelativeTime(log.createdAt);
                const clickable = isLogClickable(log);
                const description = getActivityDescription(log);

                return (
                  <div
                    key={log.id}
                    onClick={() => clickable && handleGoToProject(log)}
                    className={`group relative flex gap-3 -mx-2 px-2 py-1.5 rounded-md transition-colors ${
                      clickable
                        ? "cursor-pointer hover:bg-blue-50"
                        : "cursor-not-allowed opacity-60"
                    }`}
                  >
                    {/* Botón cerrar (X) */}
                    <button
                      onClick={(e) => handleHideLog(log.id, e)}
                      className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-200 cursor-pointer"
                      aria-label="Ocultar esta notificación"
                    >
                      <X className="h-3.5 w-3.5 text-red-600" />
                    </button>

                    <div className="relative mt-1">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${styles.iconBg}`}
                      >
                        <Icon className={`h-4 w-4 ${styles.iconColor}`} />
                      </div>
                      {index < Math.min(visibleLogs.length, 5) - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-blue-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-sm text-blue-600">
                        <span className="font-medium">
                          {log.user?.name || "Usuario"}
                        </span>{" "}
                        {description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-blue-600 font-medium">
                          {log.project?.name || "Sin proyecto"}
                        </span>
                        <span className="text-xs text-blue-600">
                          • {relativeTime}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ActivityLogCard;
