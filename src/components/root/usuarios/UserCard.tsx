import { User } from "../../../../typing";
import { Trash2, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface UserCardListProps {
  user: User;
  handleDeleteUser: (user: User) => void;
}

const UserCardList = ({ user, handleDeleteUser }: UserCardListProps) => {
  return (
    <Card className="border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-200">
      <CardContent className="flex items-center gap-4 p-4">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-blue-900 font-semibold text-sm truncate">
            {user.name}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <Mail className="h-3 w-3 text-blue-600 shrink-0" />
            <p className="text-blue-600 text-xs truncate">{user.email}</p>
          </div>
        </div>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDeleteUser(user)}
          className="shrink-0 text-red-600"
          aria-label="Eliminar usuario"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserCardList;
