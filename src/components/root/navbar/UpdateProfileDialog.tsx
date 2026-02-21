import { UserPlus, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Swal from "sweetalert2";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateUser } from "@/lib/userapi";
import { useSession } from "next-auth/react";

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z
    .string()
    .transform((val) => val.trim() || null)
    .nullable()
    .refine(
      (val) => val === null || z.string().email().safeParse(val).success,
      "El correo electrónico no es válido"
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

interface UpdateProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileFormValues | null;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const UpdateProfileDialog = ({
  isOpen,
  onClose,
  profile,
  error,
  setError,
}: UpdateProfileDialogProps) => {
  const { update } = useSession();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (profile) {
        form.reset({
          name: profile?.name,
          email: profile?.email,
        });
      } else {
        form.reset({
          name: "",
          email: "",
        });
      }
      setError(null);
    }
  }, [form, isOpen, profile, setError]);

  const handleSubmit = async (data: ProfileFormValues) => {
    try {
      await updateUser(data);
      await update();
      Swal.fire({
        title: "¡Éxito!",
        text: "El usuario ha sido actualizado correctamente.",
        icon: "success",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
        confirmButtonText: "Aceptar",
      });
      form.reset();
      onClose();
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar la nota";
      setError(errorMessage);
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-125 bg-white border border-blue-600">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <DialogTitle className="text-blue-600 font-bold">
              Editar Usuario
            </DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Nombre */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Nombre Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nombre completo"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-600 text-sm" />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="juan@ejemplo.com"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                    />
                  </FormControl>
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

            {/* Botones */}
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-blue-200 text-gray-700 hover:bg-blue-50 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Actualizando..." : "Actualizar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateProfileDialog;
