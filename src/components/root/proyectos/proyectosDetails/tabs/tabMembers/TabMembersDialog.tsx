import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import z from "zod";
import { useForm } from "react-hook-form";
import { AlertCircle, Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { createMembers } from "@/lib/memberapi";
import { useActivityLogs } from "@/context/ActivityLogContext";
import Swal from "sweetalert2";
import { User } from "../../../../../../../typing";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const memberSchema = z.object({
  userIds: z.array(z.string()).min(1, {
    message: "Debe seleccionar al menos un miembro",
  }),
});

export type MemberFormValues = z.infer<typeof memberSchema>;

interface TabMembersDialogProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  currentMemberIds?: string[];
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  projectId: string;
}

const TabMembersDialog = ({
  open,
  onClose,
  users,
  loadProject,
  currentMemberIds,
  error,
  setError,
  activitiesPage,
  tasksPage,
  commentsPage,
  projectId,
}: TabMembersDialogProps) => {
  const { refreshLogs } = useActivityLogs();
  const { data: session } = useSession();
  const userSession = session?.user;
  const [openMembers, setOpenMembers] = useState(false);

  const form = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      userIds: [],
    },
  });

  const handleSubmit = async (data: MemberFormValues) => {
    try {
      await createMembers({ ...data, projectId });

      Swal.fire({
        title: "¡Éxito!",
        text: "Los miembros han sido añadidos correctamente.",
        icon: "success",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
        confirmButtonText: "Aceptar",
      });

      loadProject(activitiesPage, tasksPage, commentsPage);
      await refreshLogs();
      form.reset();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar el miembro";
      setError(errorMessage);
    }
  };

  const toggleMember = (memberId: string) => {
    const currentIds = form.getValues("userIds");
    if (currentIds.includes(memberId)) {
      const newValue = currentIds.filter((id) => id !== memberId);
      form.setValue("userIds", newValue, { shouldValidate: true });
    } else {
      const newValue = [...currentIds, memberId];
      form.setValue("userIds", newValue, { shouldValidate: true });
    }
  };

  const removeMember = (memberId: string) => {
    const currentIds = form.getValues("userIds");
    const newValue = currentIds.filter((id) => id !== memberId);
    form.setValue("userIds", newValue, { shouldValidate: true });
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  // Filtrar usuarios excluyendo el usuario y los miembros que ya estan
  const availableUsers = users.filter(
    (user) =>
      user.id !== userSession?.id && !currentMemberIds?.includes(user.id)
  );
  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-125 bg-white border border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold">
            Invitar nuevo miembro
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            Invita a usuarios para que colaboren en este proyecto
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="userIds"
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
                            !field.value || field.value.length === 0
                              ? "text-blue-600"
                              : "text-gray-700"
                          )}
                        >
                          {!field.value || field.value.length === 0
                            ? "Selecciona miembros"
                            : `${field.value.length} miembro${
                                field.value.length > 1 ? "s" : ""
                              } seleccionado${field.value.length > 1 ? "s" : ""}`}
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
                            {availableUsers.map((user) => (
                              <CommandItem
                                value={user.name || user.email || user.id}
                                key={user.id}
                                onSelect={() => {
                                  const alreadySelected = field.value.includes(
                                    user.id
                                  );
                                  toggleMember(user.id);
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
                                    field.value?.includes(user.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {user.name || user.email}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {field.value.map((memberId) => {
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
                            {member.name || member.email}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                removeMember(memberId);
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
                {form.formState.isSubmitting
                  ? "Agregando..."
                  : "Agregar Miembro{s}"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TabMembersDialog;
