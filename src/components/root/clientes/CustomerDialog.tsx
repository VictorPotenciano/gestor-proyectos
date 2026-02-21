import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import Swal from "sweetalert2";
import { createCustomer, updateCustomer } from "@/lib/customerapi";
import { Customer } from "../../../../typing";
import CustomerDialogForm from "./CustomerDialogForm";

const customerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z
    .string()
    .transform((val) => val.trim() || null)
    .nullable()
    .refine(
      (val) => val === null || z.string().email().safeParse(val).success,
      "El correo electrónico no es válido"
    ),
  phone: z
    .string()
    .transform((val) => val.trim() || null)
    .nullable()
    .refine(
      (val) =>
        val === null ||
        /^(?:\+34|0034|34)?[\s.-]*([689]\d{2})[\s.-]*(\d{3})[\s.-]*(\d{3})$/.test(
          val
        ),
      "El número de teléfono no tiene un formato válido"
    )
    .refine(
      (val) => val === null || val.length === 9,
      "El número debe tener exactamente 9 dígitos"
    ),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerDialogProps {
  dialogOpen: boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  currentCustomer: Customer | null;
  isEditingCustomer: boolean;
  loadCustomers: () => Promise<void>;
  handleCloseDialog: () => void;
}

const CustomerDialog = ({
  dialogOpen,
  setDialogOpen,
  error,
  setError,
  currentCustomer,
  isEditingCustomer,
  loadCustomers,
  handleCloseDialog,
}: CustomerDialogProps) => {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      email: null,
      phone: null,
    },
  });

  useEffect(() => {
    if (dialogOpen) {
      form.reset({
        name: currentCustomer?.name || "",
        email: currentCustomer?.email || null,
        phone: currentCustomer?.phone || null,
      });
      setError(null);
    }
  }, [currentCustomer, dialogOpen, form, setError]);

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      if (isEditingCustomer) {
        await updateCustomer(currentCustomer!.id, data);
        Swal.fire({
          title: "Actualizado!",
          text: "El cliente ha sido actualizado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      } else {
        await createCustomer(data);
        Swal.fire({
          title: "Creado!",
          text: "El cliente ha sido creado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
      loadCustomers();
      setDialogOpen(false);
      setError(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar al cliente";
      setError(errorMessage);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
      <DialogContent className="sm:max-w-125 bg-white border border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold">
            {isEditingCustomer ? "Editar Cliente" : "Crear Nuevo Cliente"}
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            {isEditingCustomer
              ? "Completa los datos para editar un cliente"
              : "Completa los datos para registrar un nuevo cliente"}
          </DialogDescription>
        </DialogHeader>
        <CustomerDialogForm
          form={form}
          error={error}
          isEditingCustomer={isEditingCustomer}
          handleCloseDialog={handleCloseDialog}
          handleSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CustomerDialog;
