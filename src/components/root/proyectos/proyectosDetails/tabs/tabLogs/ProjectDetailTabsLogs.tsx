import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Activity, Loader2 } from "lucide-react";
import {
  Project,
  ActivityLog,
  ActivityType,
} from "../../../../../../../typing";
import { getActivityIcon, getActivityStyles } from "@/utils/getColors";
import TabLogCard from "./TabLogCard";
import Pagination from "../Pagination";

interface ProjectDetailTabsLogsProps {
  project: Project;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  currentPage: number;
  isPending: boolean;
}

const ProjectDetailTabsLogs = ({
  project,
  pagination,
  onPageChange,
  currentPage,
  isPending,
}: ProjectDetailTabsLogsProps) => {
  const formatMetadata = (
    metadata: ActivityLog["metadata"],
    activityType: ActivityType
  ): string | null => {
    if (!metadata || typeof metadata !== "object") return null;

    type MemberMetadata = {
      userId?: string;
      userName?: string | null;
      email?: string;
      joinedAt?: string | Date;
      removedAt?: string | Date;
    };

    const meta = metadata as MemberMetadata;

    if (
      activityType !== ActivityType.MEMBER_ADDED &&
      activityType !== ActivityType.MEMBER_REMOVED
    ) {
      return null;
    }

    const parts: string[] = [];

    // Nombre / email del miembro afectado
    let memberText = "Miembro desconocido";

    if (meta.userName) {
      memberText = `<strong>${meta.userName}</strong>`;
    } else if (meta.email) {
      memberText = `<em>${meta.email}</em>`;
    } else if (meta.userId) {
      memberText = `ID ${meta.userId.slice(0, 8)}…`;
    }

    parts.push(memberText);

    // Fecha según acción
    let date: Date | null = null;
    let actionPhrase = "";

    if (activityType === ActivityType.MEMBER_ADDED) {
      actionPhrase = "se unió al proyecto";
      if (meta.joinedAt) date = new Date(meta.joinedAt);
    } else if (activityType === ActivityType.MEMBER_REMOVED) {
      actionPhrase = "fue eliminado del proyecto";
      if (meta.removedAt) {
        date = new Date(meta.removedAt);
      } else if (meta.joinedAt) {
        date = new Date(meta.joinedAt);
      }
    }

    // Si tenemos fecha válida → la mostramos
    if (date && !isNaN(date.getTime())) {
      const formattedDate = date.toLocaleString("es-ES", {
        dateStyle: "long",
        timeStyle: "short",
      });
      parts.push(`${actionPhrase} el ${formattedDate}`);
    }
    // Si no hay fecha → solo el verbo
    else if (actionPhrase) {
      parts.push(actionPhrase);
    }

    if (parts.length <= 1) return null;

    return parts.join(" • ");
  };

  return (
    <TabsContent value="logs">
      <Card className="border-blue-600 shadow-lg rounded-2xl overflow-hidden p-0">
        <CardHeader className="bg-linear-to-r from-blue-50 to-white border-b border-blue-100 py-4">
          <CardTitle className="text-xl text-blue-600 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Registro de Actividades
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Historial completo de cambios y acciones en el proyecto
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {!project.activities || project.activities.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="h-10 w-10 text-blue-600" />
              </div>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                No hay actividades registradas
              </p>
              <p className="text-gray-600">
                Las actividades del proyecto aparecerán aquí
              </p>
            </div>
          ) : (
            <>
              {/* Overlay de carga */}
              {isPending && (
                <div className="relative">
                  <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                      <p className="text-sm font-medium text-blue-600">
                        Cargando actividades...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div
                className={`divide-y divide-blue-100 ${isPending ? "opacity-50" : ""}`}
              >
                {project.activities?.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  const styles = getActivityStyles(activity.type);
                  const isLast =
                    index === (project.activities?.length ?? 0) - 1;

                  const metadataHtml = formatMetadata(
                    activity.metadata,
                    activity.type
                  );

                  return (
                    <TabLogCard
                      key={activity.id}
                      activity={activity}
                      isLast={isLast}
                      metadataHtml={metadataHtml}
                      styles={styles}
                      Icon={Icon}
                    />
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                onPageChange={onPageChange}
                disabled={isPending}
                itemLabel="logs"
              />
            </>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default ProjectDetailTabsLogs;
