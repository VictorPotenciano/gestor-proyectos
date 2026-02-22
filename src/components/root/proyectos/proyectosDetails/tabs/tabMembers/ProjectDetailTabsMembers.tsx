import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project, ProjectMember, User } from "../../../../../../../typing";
import { useEffect, useState } from "react";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { deleteMember } from "@/lib/memberapi";
import Swal from "sweetalert2";
import { useSession } from "next-auth/react";
import TabMembersDialog from "./TabMembersDialog";
import { getUsers } from "@/lib/userapi";
import TabMembersCard from "./TabMembersCard";

interface ProjectDetailTabsMembersProps {
  project: Project;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
}

const ProjectDetailTabsMembers = ({
  project,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
}: ProjectDetailTabsMembersProps) => {
  const { refreshLogs } = useActivityLogs();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const session = useSession();
  const currentUserId = session?.data?.user?.id;
  const isOwner = project?.ownerId === currentUserId;

  useEffect(() => {
    const loadUsers = async () => {
      try {
        let allUsersData: User[] = [];
        let currentPage = 1;
        let hasMorePages = true;
        while (hasMorePages) {
          const response = await getUsers(currentPage);
          allUsersData = [...allUsersData, ...response.data];
          hasMorePages = currentPage < response.pagination.totalPages;
          currentPage++;
        }
        setUsers(allUsersData);
      } catch {
        setError("Error cargando datos necesarios");
      }
    };
    loadUsers();
  }, []);

  const handleDeleteMember = async (member: ProjectMember) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar a el miembro ${member.user.name}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminalo",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deleteMember(member.id);
        loadProject(activitiesPage, tasksPage, commentsPage);
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "El proyecto ha sido eliminado con exito.",
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

  return (
    <TabsContent value="miembros">
      <Card className="border-blue-600 shadow-lg rounded-2xl overflow-hidden p-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-linear-to-r from-blue-50 to-white border-b border-blue-100 px-5 py-5 md:py-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <CardTitle className="text-xl md:text-2xl text-blue-700 font-semibold flex items-center gap-2.5 flex-wrap">
              <Users className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
              Miembros del Proyecto
            </CardTitle>
            <p className="text-sm text-gray-600 md:text-base">
              Personas con acceso a este proyecto
            </p>
          </div>
          {isOwner &&
            project.status !== "COMPLETADO" &&
            project.status !== "CANCELADO" && (
              <Button
                onClick={() => setDialogOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap shrink-0 w-full sm:w-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2 shrink-0" />
                Invitar Miembro
              </Button>
            )}
        </CardHeader>
        <CardContent className="p-0">
          <TabMembersCard
            project={project}
            isOwner={isOwner}
            handleDeleteMember={handleDeleteMember}
          />
        </CardContent>
      </Card>
      <TabMembersDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        users={users}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        error={error}
        setError={setError}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
        projectId={project.id}
      />
    </TabsContent>
  );
};

export default ProjectDetailTabsMembers;
