import { Key, LogOut, Pencil, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { ProfileFormValues } from "./UpdateProfileDialog";

interface UserCardProps {
  setShowUserMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setShowChangePasswordDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRegisterUserDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setShowUpdateProfileDialog: React.Dispatch<React.SetStateAction<boolean>>;
  setProfile: React.Dispatch<React.SetStateAction<ProfileFormValues | null>>;
}

const UserCard = ({
  setShowUserMenu,
  setShowChangePasswordDialog,
  setShowRegisterUserDialog,
  setShowUpdateProfileDialog,
  setProfile,
}: UserCardProps) => {
  const { data: session } = useSession();
  const user = session?.user;

  const handleLogout = () => {
    signOut();
    setShowUserMenu(false);
  };

  const handleChangePassword = () => {
    setShowUserMenu(false);
    setShowChangePasswordDialog(true);
  };

  const handleRegisterUser = () => {
    setShowUserMenu(false);
    setShowRegisterUserDialog(true);
  };

  const handleEditProfile = () => {
    if (!user) return;
    setShowUserMenu(false);
    setShowUpdateProfileDialog(true);
    setProfile({
      name: user?.name,
      email: user?.email,
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={() => setShowUserMenu(false)}
      />
      <div
        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-40 overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
          </div>
          <button
            className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-100 transition-colors cursor-pointer"
            onClick={handleEditProfile}
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>

        <button
          className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
          onClick={handleChangePassword}
        >
          <Key className="h-4 w-4" />
          Cambiar contraseña
        </button>

        <button
          className="w-full px-4 py-2.5 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
          onClick={handleRegisterUser}
        >
          <User className="h-4 w-4" />
          Registrar Usuario
        </button>

        <button
          className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
};

export default UserCard;
