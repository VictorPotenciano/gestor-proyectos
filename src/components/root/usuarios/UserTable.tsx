import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "../../../../typing";
import { Trash2, Users } from "lucide-react";

type Column = {
  header: string;
  accessorKey: string;
};

interface UserTableProps {
  users: User[];
  handleDeleteUser: (user: User) => void;
}

const UserTable = ({ users, handleDeleteUser }: UserTableProps) => {
  const columns: Column[] = [
    { header: "Nombre", accessorKey: "name" },
    { header: "Email", accessorKey: "email" },
    { header: "", accessorKey: "actions" },
  ];
  return (
    <Table>
      <TableHeader>
        <TableRow className="border-b border-blue-100 bg-blue-50">
          {columns.map((col) => (
            <TableHead
              key={col.accessorKey}
              className={`text-blue-900 font-semibold ${
                col.accessorKey === "dueDate" ? "text-right" : ""
              }`}
            >
              {col.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={10} className="text-center py-20">
              <div className="flex flex-col items-center text-blue-600">
                <Users className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">
                  No se han encontrado usuarios
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            return (
              <TableRow
                key={user.id}
                className="border-b border-blue-50 hover:bg-blue-50/50 transition-colors"
              >
                <TableCell className="text-blue-600">{user.name}</TableCell>
                <TableCell className="text-blue-600">{user.email}</TableCell>
                <TableCell className="text-right">
                  <Trash2
                    onClick={() => handleDeleteUser(user)}
                    className="h-4 w-4 text-red-600 cursor-pointer"
                  />
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default UserTable;
