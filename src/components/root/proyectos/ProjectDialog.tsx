import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import z from "zod";
import { Customer, Project, User } from "../../../../typing";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createProject, updateProject } from "@/lib/projectapi";
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
import { useSession } from "next-auth/react";
import { useActivityLogs } from "@/context/ActivityLogContext";

const projectSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  description: z
    .string()
    .min(2, "La descripción debe tener al menos 2 caracteres")
    .optional()
    .nullable(),
  customerId: z.string().min(1, "Selecciona o crea un cliente"),
  memberIds: z.array(z.string()),
  totalAmount: z
    .number()
    .min(0.01, "El total debe ser mayor que 0.01")
    .finite({ message: "El total no puede ser infinito" })
    .positive({ message: "El monto debe ser positivo" }),
  dueDate: z.union([z.date(), z.null()]).optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  currentProject: Project | null;
  isEditingProject: boolean;
  loadProjects: () => Promise<void>;
  handleCloseDialog: () => void;
  customers: Customer[];
  users: User[];
}

const ProjectDialog = ({
  dialogOpen,
  setDialogOpen,
  error,
  setError,
  currentProject,
  isEditingProject,
  loadProjects,
  handleCloseDialog,
  customers,
  users,
}: ProjectDialogProps) => {
  const [openCustomer, setOpenCustomer] = useState(false);
  const [openMembers, setOpenMembers] = useState(false);
  const { refreshLogs } = useActivityLogs();

  const { data: session } = useSession();
  const userSession = session?.user;

  const isOwner = currentProject?.ownerId === userSession?.id;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: null,
      customerId: "",
      memberIds: [],
      totalAmount: 0,
      dueDate: null,
    },
  });

  const watchedMemberIds = useWatch({
    control: form.control,
    name: "memberIds",
    defaultValue: [],
  });

  useEffect(() => {
    if (dialogOpen) {
      if (isEditingProject && currentProject) {
        form.reset({
          name: currentProject?.name,
          description: currentProject?.description,
          customerId: currentProject?.customer?.id,
          memberIds:
            currentProject?.members?.map((member) => member.userId) || [],
          totalAmount: Number(currentProject?.totalAmount),
          dueDate: currentProject?.dueDate
            ? new Date(currentProject.dueDate)
            : null,
        });
      } else {
        form.reset({
          name: "",
          description: null,
          customerId: "",
          memberIds: [],
          totalAmount: 0,
          dueDate: null,
        });
      }

      setError(null);
    }
  }, [currentProject, dialogOpen, form, setError, isEditingProject]);

  const handleSubmit = async (data: ProjectFormValues) => {
    try {
      if (isEditingProject) {
        await updateProject(currentProject!.id, data);
        Swal.fire({
          title: "Actualizado!",
          text: "El proyecto ha sido actualizado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      } else {
        await createProject(data);
        Swal.fire({
          title: "Creado!",
          text: "El proyecto ha sido creado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
      loadProjects();
      await refreshLogs();
      setDialogOpen(false);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar el poryecto";
      setError(errorMessage);
    }
  };

  const toggleMember = (memberId: string, currentIds: string[]) => {
    if (currentIds.includes(memberId)) {
      return currentIds.filter((id) => id !== memberId);
    } else {
      return [...currentIds, memberId];
    }
  };

  const removeMember = (memberId: string, currentIds: string[]) => {
    return currentIds.filter((id) => id !== memberId);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent
        className={cn(
          "flex flex-col gap-0 p-2 bg-white",
          "w-[calc(100vw-1rem)] max-h-[92dvh] rounded-2xl overflow-y-scroll",
          "sm:w-full sm:max-w-lg sm:max-h-[88vh]",
          "lg:max-w-2xl lg:max-h-none lg:overflow-visible",
          "border border-blue-100 shadow-2xl shadow-blue-100/40"
        )}
      >
        <DialogHeader className="py-2">
          <DialogTitle className="text-blue-600 font-bold">
            {isEditingProject ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            {isEditingProject
              ? "Completa los datos para editar un proyecto"
              : "Completa los datos para crear un nuevo proyecto"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Nombre del proyecto
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Rediseño Web"
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
              name="customerId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="text-blue-700 font-medium">
                    Cliente
                  </FormLabel>
                  <Popover open={openCustomer} onOpenChange={setOpenCustomer}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={openCustomer}
                          className={cn(
                            "w-full justify-between border-blue-200 focus:border-blue-500 focus:ring-blue-400 cursor-pointer",
                            !field.value && "text-blue-600"
                          )}
                        >
                          {field.value
                            ? customers.find(
                                (customer) => customer.id === field.value
                              )?.name
                            : "Selecciona un cliente"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 border border-blue-200 shadow-lg shadow-blue-100/50 bg-white w-(--radix-popover-trigger-width)"
                      align="start"
                    >
                      <Command className="rounded-lg border-none">
                        <CommandInput
                          placeholder="Buscar cliente..."
                          className={cn(
                            "h-10 border-b border-blue-100",
                            "focus:ring-0 focus:border-blue-400",
                            "placeholder:text-blue-300",
                            "text-blue-700"
                          )}
                        />
                        <CommandList className="max-h-60 overflow-auto">
                          <CommandEmpty className="py-6 text-center text-blue-400/70 text-sm">
                            No se encontró ningún cliente.
                          </CommandEmpty>
                          <CommandGroup className="p-1.5">
                            {customers.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                value={customer.name}
                                onSelect={() => {
                                  form.setValue("customerId", customer.id, {
                                    shouldValidate: true,
                                  });
                                  setOpenCustomer(false);
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
                                  {customer.name}
                                </span>
                                <Check
                                  className={cn(
                                    "h-4 w-4 shrink-0",
                                    customer.id === field.value
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

            {(!isEditingProject || isOwner) &&
              currentProject?.status !== "COMPLETADO" &&
              currentProject?.status !== "CANCELADO" && (
                <FormField
                  control={form.control}
                  name="memberIds"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-blue-700 font-medium">
                        Miembros del proyecto
                      </FormLabel>
                      <Popover open={openMembers} onOpenChange={setOpenMembers}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn(
                                "w-full justify-between border-blue-200 hover:border-blue-500 hover:bg-blue-50 cursor-pointer",
                                watchedMemberIds.length === 0 && "text-blue-600"
                              )}
                            >
                              {watchedMemberIds.length === 0
                                ? "Selecciona miembros"
                                : `${watchedMemberIds.length} miembro${
                                    watchedMemberIds.length > 1 ? "s" : ""
                                  } seleccionado${watchedMemberIds.length > 1 ? "s" : ""}`}
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
                                No se encontró ningún usuario.
                              </CommandEmpty>
                              <CommandGroup className="p-1.5">
                                {users
                                  .filter((user) => user.id !== userSession?.id)
                                  .map((user) => (
                                    <CommandItem
                                      value={user.name}
                                      key={user.id}
                                      onSelect={() => {
                                        const alreadySelected =
                                          field.value.includes(user.id);
                                        const newValue = toggleMember(
                                          user.id,
                                          field.value
                                        );
                                        form.setValue("memberIds", newValue, {
                                          shouldValidate: true,
                                        });
                                        if (!alreadySelected) {
                                          setOpenMembers(false);
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
                                          field.value.includes(user.id)
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {user.name}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>

                      {watchedMemberIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {watchedMemberIds.map((memberId) => {
                            const member = users.find((u) => u.id === memberId);

                            if (!member) {
                              return null;
                            }

                            return (
                              <Badge
                                key={memberId}
                                variant="secondary"
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1"
                              >
                                {member.name}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newValue = removeMember(
                                      memberId,
                                      field.value
                                    );
                                    form.setValue("memberIds", newValue, {
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
              )}

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
                      placeholder="Describe el proyecto..."
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
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-700 font-medium">
                      Monto total (€)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        step="0.01"
                        min="0"
                        className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                        value={field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : Number(value));
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
                    </FormControl>
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
                {isEditingProject ? "Actualizar Proyecto" : "Crear Proyecto"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDialog;
