import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Clock, LucideIcon } from "lucide-react";
import {
  ACTIVITY_DESCRIPTIONS,
  ActivityLog,
} from "../../../../../../../typing";
import { getRelativeTime } from "@/utils/getColors";

interface TabLogCardProps {
  activity: ActivityLog;
  isLast: boolean;
  metadataHtml: string | null;
  styles: {
    iconBg: string;
    iconColor: string;
  };
  Icon: LucideIcon;
}

const TabLogCard = ({
  activity,
  isLast,
  metadataHtml,
  styles,
  Icon,
}: TabLogCardProps) => {
  const cleanMetadata = metadataHtml
    ? metadataHtml.replace(
        /\s*•.*?(se unió|fue eliminado|joined|removed).*$/i,
        ""
      )
    : null;

  return (
    <div className="flex items-start gap-3 sm:gap-4 px-3 py-4 sm:p-5 hover:bg-blue-50/50 transition-all">
      {/* Línea de tiempo + ícono */}
      <div className="flex flex-col items-center shrink-0">
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${styles.iconBg}`}
        >
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${styles.iconColor}`} />
        </div>
        {!isLast && <div className="w-0.5 h-full bg-blue-200 mt-2" />}
      </div>

      <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
        {/* En mobile: stack vertical. En sm+: fila */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            {/* Avatar + descripción */}
            <div className="flex items-start gap-2 sm:gap-3">
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-blue-200 shrink-0 mt-0.5">
                <AvatarFallback className="bg-blue-600 text-white text-xs font-bold">
                  {activity.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm leading-relaxed wrap-break-word">
                  <span className="font-semibold text-gray-900">
                    {activity.user?.name || "Usuario"}
                  </span>{" "}
                  <span className="text-gray-700">
                    {ACTIVITY_DESCRIPTIONS[activity.type] || activity.type}
                  </span>
                  {cleanMetadata && (
                    <>
                      {" "}
                      <span
                        className="text-gray-600 font-medium wrap-break-word"
                        dangerouslySetInnerHTML={{ __html: cleanMetadata }}
                      />
                    </>
                  )}
                </p>
                {activity.user?.email && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {activity.user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Fecha/hora: debajo en mobile, a la derecha en sm+ */}
          <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1 text-xs text-gray-500 shrink-0 pl-9 sm:pl-0">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
              <time className="whitespace-nowrap">
                {getRelativeTime(activity.createdAt)}
              </time>
            </div>
            <time className="text-gray-400 whitespace-nowrap hidden sm:block">
              {new Date(activity.createdAt).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
            <time className="text-gray-400 sm:hidden">
              {new Date(activity.createdAt).toLocaleString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabLogCard;
