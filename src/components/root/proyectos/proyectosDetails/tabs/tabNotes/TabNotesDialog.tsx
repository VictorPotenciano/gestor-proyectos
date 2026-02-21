import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { createNote, updateNote } from "@/lib/noteapi";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import z from "zod";
import { Note } from "../../../../../../../typing";
import { useEffect } from "react";

const noteSchema = z.object({
  content: z
    .string()
    .min(1, "El contenido es obligatorio")
    .max(500, "El contenido no puede superar los 500 caracteres"),
});

export type NoteFormValues = z.infer<typeof noteSchema>;

interface TabNotesDialogProps {
  open: boolean;
  onClose: () => void;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  currentNote: Note | null;
  isEditingNote: boolean;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  projectId: string;
}

const TabNotesDialog = ({
  open,
  onClose,
  loadProject,
  error,
  setError,
  currentNote,
  isEditingNote,
  activitiesPage,
  tasksPage,
  commentsPage,
  projectId,
}: TabNotesDialogProps) => {
  const { refreshLogs } = useActivityLogs();

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (isEditingNote && currentNote) {
        form.reset({
          content: currentNote?.content,
        });
      } else {
        form.reset({
          content: "",
        });
      }

      setError(null);
    }
  }, [currentNote, open, form, setError, isEditingNote]);

  const handleSubmit = async (data: NoteFormValues) => {
    try {
      if (isEditingNote) {
        await updateNote(currentNote!.id, data);
        Swal.fire({
          title: "Actualizado!",
          text: "La nota ha sido actualizada con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      } else {
        await createNote({ ...data, projectId });
        Swal.fire({
          title: "¡Éxito!",
          text: "La nota ha sido añadida correctamente.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }

      loadProject(activitiesPage, tasksPage, commentsPage);
      await refreshLogs();
      form.reset();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar la nota";
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-125 bg-white border border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold">
            {isEditingNote ? "Editar Nota" : "Nueva Nota"}
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            {isEditingNote
              ? "Completa los datos para editar una nota"
              : "Completa los datos para crear una nueva nota"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Contenido
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      placeholder="Ej: Diseñar bbdd"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600" />
                </FormItem>
              )}
            />

            {error && (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-200 text-red-800"
              >
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="border-blue-200 text-gray-700 hover:bg-blue-50 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {isEditingNote ? "Actualizar Nota" : "Crear Nota"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TabNotesDialog;
