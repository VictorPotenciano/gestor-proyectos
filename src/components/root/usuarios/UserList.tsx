import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import PaginationTable from "../PaginationTable";
import UserFilters from "./UserFilters";
import { ProjectStatus, User } from "../../../../typing";
import UserTable from "./UserTable";
import Swal from "sweetalert2";
import { deleteUser } from "@/lib/userapi";
import { useSession } from "next-auth/react";
import UserCardList from "./UserCard";

interface UserListProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  loadUsers: () => Promise<void>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const UserList = ({
  users,
  currentPage,
  totalPages,
  handlePageChange,
  searchTerm,
  setSearchTerm,
  loadUsers,
  setError,
}: UserListProps) => {
  const { data: session } = useSession();

  const handleDeleteUser = async (user: User) => {
    try {
      if (session?.user.id === user.id) {
        await Swal.fire({
          title: "No se puede eliminar",
          text: "No puedes eliminarte a ti mismo.",
          icon: "error",
          confirmButtonText: "Entendido",
          buttonsStyling: false,
          customClass: { confirmButton: "swal-custom-button" },
        });
        return;
      }
      const blockedStatuses = [ProjectStatus.EN_PROCESO, ProjectStatus.PAUSADO];

      const blockedMemberships = (user.projectMemberships ?? [])
        .map((m) => m.project)
        .filter((p) => blockedStatuses.includes(p.status));

      const blockedOwned = (user.ownedProjects ?? []).filter((p) =>
        blockedStatuses.includes(p.status)
      );

      const blockedProjects = [...blockedMemberships, ...blockedOwned];

      if (blockedProjects.length > 0) {
        const projectNames = blockedProjects
          .map((p) => `• ${p.name}`)
          .join("<br/>");
        await Swal.fire({
          title: "No se puede eliminar",
          html: `<strong>${user.name}</strong> es miembro o propietario de proyectos activos o pausados:<br/><br/>${projectNames}<br/><br/>Debes removerlo o reasignarlos antes de eliminarlo.`,
          icon: "error",
          confirmButtonText: "Entendido",
          buttonsStyling: false,
          customClass: { confirmButton: "swal-custom-button" },
        });
        return;
      }
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar a el ususario ${user.name}.`,
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
        await deleteUser(user.id);
        loadUsers();
        Swal.fire({
          title: "Eliminado!",
          text: "El usuario ha sido eliminado con exito.",
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
    <Card className="bg-white border border-blue-600 shadow-sm">
      <CardHeader className="pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
            <Users className="h-7 w-7" />
            Lista de Usuarios
          </CardTitle>
          <UserFilters searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* En ordenador y tablet tabla */}
        <div className="hidden md:block">
          <UserTable users={users} handleDeleteUser={handleDeleteUser} />
        </div>
        {/* En movil card */}
        <div className="md:hidden space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-12 text-blue-600">
              <Users className="h-16 w-16 mx-auto mb-4 opacity-60" />
              <p className="text-lg font-medium">
                No se han encontrado proyectos
              </p>
            </div>
          ) : (
            users.map((user) => (
              <UserCardList
                key={user.id}
                user={user}
                handleDeleteUser={handleDeleteUser}
              />
            ))
          )}
        </div>
        {totalPages > 1 && (
          <PaginationTable
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;
