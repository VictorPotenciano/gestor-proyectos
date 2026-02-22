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
import {
  AlertCircle,
  X,
  FileText,
  ImageIcon,
  ExternalLink,
  Upload,
} from "lucide-react";
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import z from "zod";
import { Note, NoteAttachment } from "../../../../../../../typing";
import { useCallback, useEffect, useRef, useState } from "react";

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Adjuntos existentes que se quieren conservar (edición)
  const [keptAttachments, setKeptAttachments] = useState<NoteAttachment[]>([]);
  // Nuevos ficheros seleccionados por el usuario
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    if (open) {
      // Use a microtask or timeout to avoid synchronous setState during render/effect phase
      // which triggers the "cascading renders" warning in some environments.
      const timer = setTimeout(() => {
        if (isEditingNote && currentNote) {
          form.reset({ content: currentNote.content });
          setKeptAttachments(currentNote.attachments ?? []);
        } else {
          form.reset({ content: "" });
          setKeptAttachments([]);
        }
        setNewFiles([]);
        setError(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentNote, open, form, setError, isEditingNote]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setNewFiles((prev) => [...prev, ...selected]);
    // Limpiar input para permitir seleccionar el mismo fichero de nuevo
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeKeptAttachment = (id: string) => {
    setKeptAttachments((prev) => prev.filter((att) => att.id !== id));
  };

  const removeNewFile = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (contentType: string) =>
    contentType.startsWith("image/") ? (
      <ImageIcon className="h-3.5 w-3.5 shrink-0 text-blue-500" />
    ) : (
      <FileText className="h-3.5 w-3.5 shrink-0 text-blue-500" />
    );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const dropped = Array.from(e.dataTransfer.files);
      if (!dropped.length) return;

      const allowed = dropped.filter((file) => {
        const validTypes = [
          "image/",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/plain",
          "application/zip",
          "application/x-rar-compressed",
        ];
        return validTypes.some(
          (type) => file.type.startsWith(type) || file.type === type
        );
      });

      if (allowed.length !== dropped.length) {
        setError("Algún fichero tiene un formato no permitido y fue ignorado.");
      }

      setNewFiles((prev) => [...prev, ...allowed]);
    },
    [setError]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleSubmit = async (data: NoteFormValues) => {
    try {
      if (isEditingNote) {
        await updateNote(currentNote!.id, {
          content: data.content,
          keepAttachmentIds: keptAttachments.map((a) => a.id),
          files: newFiles,
        });
        Swal.fire({
          title: "Actualizado!",
          text: "La nota ha sido actualizada con éxito.",
          icon: "success",
          buttonsStyling: false,
          customClass: { confirmButton: "swal-custom-button" },
          confirmButtonText: "Aceptar",
        });
      } else {
        await createNote({
          content: data.content,
          projectId,
          files: newFiles,
        });
        Swal.fire({
          title: "¡Éxito!",
          text: "La nota ha sido añadida correctamente.",
          icon: "success",
          buttonsStyling: false,
          customClass: { confirmButton: "swal-custom-button" },
          confirmButtonText: "Aceptar",
        });
      }

      loadProject(activitiesPage, tasksPage, commentsPage);
      await refreshLogs();
      form.reset();
      setKeptAttachments([]);
      setNewFiles([]);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar la nota"
      );
    }
  };

  const handleCancel = () => {
    form.reset();
    setKeptAttachments([]);
    setNewFiles([]);
    onClose();
  };

  const hasAttachments = keptAttachments.length > 0 || newFiles.length > 0;

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
            className="space-y-5 py-4"
          >
            {/* Campo de contenido — validado por zod */}
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

            {/* Sección de adjuntos */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-700">Adjuntos</p>

              {/* Lista de adjuntos existentes y nuevos */}
              {hasAttachments && (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {keptAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-sm"
                    >
                      {getFileIcon(att.contentType)}

                      <a
                        href={att.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-blue-700 hover:underline truncate"
                      >
                        {att.name}
                      </a>
                      <ExternalLink className="h-3 w-3 text-blue-400 shrink-0" />
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatSize(att.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeKeptAttachment(att.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {newFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2.5 py-1.5 bg-green-50 border border-green-100 rounded-lg text-sm"
                    >
                      {getFileIcon(file.type)}
                      <span className="flex-1 text-green-700 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatSize(file.size)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeNewFile(i)}
                        className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Zona drag & drop */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
      relative flex flex-col items-center justify-center gap-2
      border-2 border-dashed rounded-xl px-4 py-6 cursor-pointer
      transition-all duration-200 select-none
      ${
        isDragging
          ? "border-blue-500 bg-blue-50 scale-[1.01]"
          : "border-blue-200 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
      }
    `}
              >
                <div
                  className={`p-2 rounded-full transition-colors duration-200 ${isDragging ? "bg-blue-100" : "bg-white border border-blue-100"}`}
                >
                  <Upload
                    className={`h-5 w-5 transition-colors duration-200 ${isDragging ? "text-blue-600" : "text-blue-400"}`}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-medium transition-colors duration-200 ${isDragging ? "text-blue-700" : "text-gray-600"}`}
                  >
                    {isDragging
                      ? "Suelta los ficheros aquí"
                      : "Arrastra ficheros o haz clic para seleccionar"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Imágenes, PDF, Word, Excel, ZIP — máx. 10MB por fichero
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                />
              </div>
            </div>

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
