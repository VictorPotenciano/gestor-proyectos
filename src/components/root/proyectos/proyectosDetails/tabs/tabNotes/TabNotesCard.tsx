import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Note } from "../../../../../../../typing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { deleteNote } from "@/lib/noteapi";
import { useActivityLogs } from "@/context/ActivityLogContext";

interface TabNotesCardProps {
  note: Note;
  handleEditNote: (note: Note) => void;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const TabNotesCard = ({
  note,
  handleEditNote,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
  setError,
}: TabNotesCardProps) => {
  const { refreshLogs } = useActivityLogs();
  const { data: session } = useSession();
  const user = session?.user;

  const handleDeleteNote = async (note: Note) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar una nota.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminala",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deleteNote(note.id);
        loadProject(activitiesPage, tasksPage, commentsPage);
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "La nota ha sido eliminada con exito.",
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
    <div className="group flex items-center gap-4 p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-200 mb-6 mx-4">
      {/* Avatar */}
      <div className="shrink-0">
        <Avatar className="h-10 w-10 border-2 border-blue-200 shadow-sm">
          <AvatarFallback className="bg-blue-600 text-white font-semibold text-sm">
            {note.author?.name
              ? note.author.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "??"}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
        <p className="font-semibold text-gray-900 text-sm whitespace-nowrap">
          {note.author?.name}
        </p>
        <span className="text-xs text-blue-600 bg-white/80 px-2.5 py-0.5 rounded-full border border-blue-400 whitespace-nowrap">
          {new Date(note.createdAt).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
        <p className="text-sm text-gray-700 leading-relaxed flex-1 min-w-50">
          {note.content}
        </p>
      </div>
      {note.author?.id === user?.id && (
        <div className="shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="border-blue-200 bg-white"
            >
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditNote(note);
                }}
                className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                Editar nota
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNote(note);
                }}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50 cursor-pointer"
              >
                Eliminar nota
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default TabNotesCard;
