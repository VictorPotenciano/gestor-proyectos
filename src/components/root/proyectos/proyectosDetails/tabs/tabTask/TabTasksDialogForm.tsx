import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Project, Task, TaskPriority } from "../../../../../../../typing";
import { Button } from "@/components/ui/button";
import { useActivityLogs } from "@/context/ActivityLogContext";
import z from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { createTask, updateTask } from "@/lib/taskapi";
import Swal from "sweetalert2";

const taskSchema = z.object({
  title: z
    .string()
    .min(1, "El título es obligatorio")
    .max(50, "El título no puede superar los 50 caracteres"),
  description: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .optional()
    .nullable(),
  dueDate: z.union([z.date(), z.null()]).optional().nullable(),
  assigneeIds: z
    .array(z.string())
    .min(1, "Debe asignar al menos un miembro a la tarea"),
  priority: z.enum(["BAJA", "MEDIA", "ALTA", "URGENTE"]),
});

export type TaskFormValues = z.infer<typeof taskSchema>;

interface TabTasksDialogFormProps {
  open: boolean;
  onClose: () => void;
  project: Project;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  currentTask: Task | null;
  isEditingTask: boolean;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  loadAllTasks: () => void;
}

const TabTasksDialogForm = ({
  open,
  onClose,
  project,
  error,
  setError,
  currentTask,
  isEditingTask,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
  loadAllTasks,
}: TabTasksDialogFormProps) => {
  const { refreshLogs } = useActivityLogs();
  const [openAssignees, setOpenAssignees] = useState(false);
  const [openPriority, setOpenPriority] = useState(false);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: null,
      dueDate: null,
      assigneeIds: [],
      priority: "MEDIA",
    },
  });

  const watchedAssigneeIds = useWatch({
    control: form.control,
    name: "assigneeIds",
    defaultValue: [],
  });

  useEffect(() => {
    if (open) {
      if (isEditingTask && currentTask) {
        form.reset({
          title: currentTask.title,
          description: currentTask.description,
          dueDate: currentTask?.dueDate ? new Date(currentTask.dueDate) : null,
          assigneeIds: currentTask?.assignees?.map((a) => a.userId) || [],
          priority: currentTask.priority,
        });
      } else {
        form.reset({
          title: "",
          description: null,
          dueDate: null,
          assigneeIds: [],
          priority: "MEDIA",
        });
      }

      setError(null);
    }
  }, [currentTask, open, form, setError, isEditingTask]);

  const handleSubmit = async (data: TaskFormValues) => {
    try {
      if (isEditingTask) {
        await updateTask(currentTask!.id, data);
        Swal.fire({
          title: "Actualizado!",
          text: "La tarea ha sido actualizada con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      } else {
        await createTask({ ...data, projectId: project.id });
        Swal.fire({
          title: "Creado!",
          text: "La tarea ha sido creada con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
      loadProject(activitiesPage, tasksPage, commentsPage);
      loadAllTasks();
      await refreshLogs();
      form.reset();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar la tarea";
      setError(errorMessage);
    }
  };

  const handleCloseDialog = () => {
    form.reset();
    onClose();
  };

  const toggleAssignee = (assigneeId: string, currentIds: string[]) => {
    if (currentIds.includes(assigneeId)) {
      return currentIds.filter((id) => id !== assigneeId);
    } else {
      return [...currentIds, assigneeId];
    }
  };

  const removeAssignee = (assigneeId: string, currentIds: string[]) => {
    return currentIds.filter((id) => id !== assigneeId);
  };

  const priorityOptions = [
    { value: TaskPriority.BAJA, label: "Baja" },
    { value: TaskPriority.MEDIA, label: "Media" },
    { value: TaskPriority.ALTA, label: "Alta" },
    { value: TaskPriority.URGENTE, label: "Urgente" },
  ];

  return (
    <Dialog open={open} onOpenChange={handleCloseDialog}>
      <DialogContent className="w-full max-w-full rounded-t-2xl rounded-b-none sm:rounded-2xl sm:max-w-lg md:max-w-2xl bg-white border border-blue-600 shadow-2xl max-h-[90dvh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold">
            Crear Nueva Tarea
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Añade una nueva tarea al proyecto
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Título
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre de la tarea"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Descripción (opcional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe la tarea..."
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />
                </FormItem>
              )}
            />

            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-blue-700 font-medium">
                      Prioridad
                    </FormLabel>
                    <Popover open={openPriority} onOpenChange={setOpenPriority}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openPriority}
                            className={cn(
                              "w-full justify-between border-blue-200 focus:border-blue-500 focus:ring-blue-400 cursor-pointer",
                              !field.value && "text-blue-600"
                            )}
                          >
                            {field.value
                              ? priorityOptions.find(
                                  (priority) => priority.value === field.value
                                )?.label
                              : "Seleccionar"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="p-0 border border-blue-200 shadow-lg shadow-blue-100/50 bg-white w-(--radix-popover-trigger-width)"
                        align="start"
                      >
                        <Command className="rounded-lg border-none">
                          <CommandList className="max-h-60 overflow-auto">
                            <CommandGroup className="p-1.5">
                              {priorityOptions.map((priority) => (
                                <CommandItem
                                  key={priority.value}
                                  value={priority.label}
                                  onSelect={() => {
                                    form.setValue("priority", priority.value, {
                                      shouldValidate: true,
                                    });
                                    setOpenPriority(false);
                                  }}
                                  className={cn(
                                    "px-3 py-2.5 text-sm rounded-md cursor-pointer",
                                    "text-blue-700",
                                    "aria-selected:bg-blue-50 aria-selected:text-blue-800",
                                    "data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-800",
                                    "hover:bg-blue-50/70 transition-colors"
                                  )}
                                >
                                  <span className="flex-1 truncate">
                                    {priority.label}
                                  </span>
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      priority.value === field.value
                                        ? "opacity-100 text-blue-600"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700 font-medium">
                      Fecha límite (opcional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                        value={
                          field.value
                            ? new Date(field.value).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : null);
                        }}
                      />
                    </FormControl>
                    <FormMessage className="text-red-600 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="assigneeIds"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-blue-700 font-medium">
                    Asignar a
                  </FormLabel>
                  <Popover open={openAssignees} onOpenChange={setOpenAssignees}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between border-blue-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer",
                            watchedAssigneeIds.length === 0 && "text-blue-600"
                          )}
                        >
                          {watchedAssigneeIds.length === 0
                            ? "Seleccionar miembros"
                            : `${watchedAssigneeIds.length} miembro${
                                watchedAssigneeIds.length > 1 ? "s" : ""
                              } seleccionado${watchedAssigneeIds.length > 1 ? "s" : ""}`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 border border-blue-200 shadow-lg shadow-blue-100/50 bg-white w-(--radix-popover-trigger-width)">
                      <Command className="rounded-lg border-none">
                        <CommandInput
                          placeholder="Buscar miembro..."
                          className={cn(
                            "h-10 border-b border-blue-100",
                            "focus:ring-0 focus:border-blue-400",
                            "placeholder:text-blue-300",
                            "text-blue-700"
                          )}
                        />
                        <CommandList>
                          <CommandEmpty className="py-6 text-center text-blue-400/70 text-sm">
                            No se encontró ningún miembro.
                          </CommandEmpty>
                          <CommandGroup className="p-1.5">
                            {/* Owner del proyecto */}
                            <CommandItem
                              value={project.owner?.name ?? "Owner"}
                              key={project.ownerId}
                              onSelect={() => {
                                const alreadySelected = field.value.includes(
                                  project.ownerId
                                );
                                const newValue = toggleAssignee(
                                  project.ownerId,
                                  field.value
                                );
                                form.setValue("assigneeIds", newValue, {
                                  shouldValidate: true,
                                });
                                if (!alreadySelected) {
                                  setOpenAssignees(false);
                                }
                              }}
                              className={cn(
                                "px-3 py-2.5 text-sm rounded-md cursor-pointer",
                                "text-blue-700",
                                "aria-selected:bg-blue-50 aria-selected:text-blue-800",
                                "data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-800",
                                "hover:bg-blue-50/70 transition-colors"
                              )}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value.includes(project.ownerId)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {project.owner?.name ?? "Owner"} (Propietario)
                            </CommandItem>

                            {/* Miembros del proyecto */}
                            {project.members?.map((member) => (
                              <CommandItem
                                value={
                                  member.user?.name ?? "Usuario no encontrado"
                                }
                                key={member.userId}
                                onSelect={() => {
                                  const alreadySelected = field.value.includes(
                                    member.userId
                                  );
                                  const newValue = toggleAssignee(
                                    member.userId,
                                    field.value
                                  );
                                  form.setValue("assigneeIds", newValue, {
                                    shouldValidate: true,
                                  });
                                  if (!alreadySelected) {
                                    setOpenAssignees(false);
                                  }
                                }}
                                className={cn(
                                  "px-3 py-2.5 text-sm rounded-md cursor-pointer",
                                  "text-blue-700",
                                  "aria-selected:bg-blue-50 aria-selected:text-blue-800",
                                  "data-[selected=true]:bg-blue-100 data-[selected=true]:text-blue-800",
                                  "hover:bg-blue-50/70 transition-colors"
                                )}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(member.userId)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {member.user?.name ?? "Usuario no encontrado"}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {watchedAssigneeIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {watchedAssigneeIds.map((assigneeId) => {
                        // Buscar primero si es el owner
                        const isOwner = assigneeId === project.ownerId;
                        const userName = isOwner
                          ? (project.owner?.name ?? "Owner")
                          : (project.members?.find(
                              (m) => m.userId === assigneeId
                            )?.user?.name ?? "Usuario no encontrado");

                        return (
                          <Badge
                            key={assigneeId}
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1"
                          >
                            {userName}
                            {isOwner && " (Propietario)"}
                            <button
                              type="button"
                              onClick={() => {
                                const newValue = removeAssignee(
                                  assigneeId,
                                  field.value
                                );
                                form.setValue("assigneeIds", newValue, {
                                  shouldValidate: true,
                                });
                              }}
                              className="ml-2 hover:text-blue-900 cursor-pointer"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <FormMessage className="text-red-600 text-sm" />
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="border border-blue-600 text-blue-600 cursor-pointer hover:bg-blue-50 hover:text-blue-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer"
              >
                {isEditingTask ? "Actualizar Tarea" : "Crear Tarea"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TabTasksDialogForm;
