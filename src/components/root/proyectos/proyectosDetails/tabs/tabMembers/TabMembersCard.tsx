import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Project, ProjectMember } from "../../../../../../../typing";
import { Trash2 } from "lucide-react";

interface TabMembersCardProps {
  project: Project;
  isOwner: boolean;
  handleDeleteMember: (member: ProjectMember) => void;
}

const TabMembersCard = ({
  project,
  isOwner,
  handleDeleteMember,
}: TabMembersCardProps) => {
  return (
    <>
      {/* Owner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5">
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-blue-400 shadow-sm shrink-0">
            <AvatarFallback className="bg-blue-700 text-white font-bold">
              {project.owner?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                {project.owner?.name || "Propietario"}
              </p>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full shrink-0">
                Propietario
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">
              {project.owner?.email || "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Miembros */}
      <div className="divide-y divide-blue-100">
        {project.members?.map((member) => (
          <div
            key={member.id}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 hover:bg-blue-50/50 transition-all"
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-blue-200 shadow-sm shrink-0">
                <AvatarFallback className="bg-blue-600 text-white font-bold">
                  {member.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-base sm:text-lg truncate">
                  {member.user?.name || "Usuario"}
                </p>
                <p className="text-sm text-gray-600 truncate">
                  {member.user?.email || "—"}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 self-start sm:self-auto w-full sm:w-auto">
              <div className="bg-white px-4 py-2 rounded-lg border border-blue-600">
                <p className="text-xs text-gray-600 font-medium mb-1">
                  Miembro desde
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(member.joinedAt).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              {isOwner && (
                <Button
                  onClick={() => handleDeleteMember(member)}
                  variant="ghost"
                  size="icon"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer ml-auto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default TabMembersCard;
