import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPayment } from "@/lib/paymentapi";
import Swal from "sweetalert2";
import { useActivityLogs } from "@/context/ActivityLogContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { Project } from "../../../../../../../typing";

const paymentSchemaBase = z.object({
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  description: z
    .string()
    .min(1, "El concepto es obligatorio")
    .max(100, "El concepto no puede superar los 100 caracteres"),
});

export type PaymentFormValues = z.infer<typeof paymentSchemaBase>;

// Función para crear schema con validación de máximo
const createPaymentSchema = (maxAmount: number) =>
  paymentSchemaBase.extend({
    amount: z
      .number()
      .min(0.01, "El monto debe ser mayor a 0")
      .max(
        maxAmount,
        `El monto no puede superar el saldo pendiente de ${maxAmount.toFixed(2)}€`
      ),
  });

// Props para cuando se usa con projectId fijo
interface TabPaymentDialogWithProjectProps {
  mode: "single-project";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  projectId: string;
  totalAmount: number;
  totalPaid: number;
}

// Props para cuando se usa con selector de proyectos
interface TabPaymentDialogWithSelectorProps {
  mode: "project-selector";
  open: boolean;
  onClose: () => void;
  onSuccess: () => void; 
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  projects: Project[]; 
}

type TabPaymentDialogProps =
  | TabPaymentDialogWithProjectProps
  | TabPaymentDialogWithSelectorProps;

const TabPaymentDialog = (props: TabPaymentDialogProps) => {
  const { open, onClose, onSuccess, error, setError, mode } = props;
  const { refreshLogs } = useActivityLogs();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");

  // Derivar valores directamente de las props según el modo
  const getProjectData = () => {
    if (mode === "single-project") {
      return {
        projectId: props.projectId,
        totalAmount: props.totalAmount,
        totalPaid: props.totalPaid,
      };
    } else {
      // modo project-selector
      const selectedProject = props.projects.find(
        (p) => p.id === selectedProjectId
      );
      return {
        projectId: selectedProjectId,
        totalAmount: selectedProject
          ? Number(selectedProject.totalAmount) || 0
          : 0,
        totalPaid: selectedProject
          ? Number(selectedProject.paidAmount) || 0
          : 0,
      };
    }
  };

  const { projectId, totalAmount, totalPaid } = getProjectData();
  const remainingAmount = totalAmount - totalPaid;

  // Manejar cambio de proyecto en el selector
  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(createPaymentSchema(Math.max(remainingAmount, 0))),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  // Reiniciar validación cuando cambia el remainingAmount
  useEffect(() => {
    form.clearErrors();
  }, [remainingAmount, form]);

  const handleSubmit = async (data: PaymentFormValues) => {
    if (!projectId) {
      setError("Debe seleccionar un proyecto");
      return;
    }

    try {
      await createPayment({ ...data, projectId });
      Swal.fire({
        title: "¡Éxito!",
        text: "El pago ha sido añadido correctamente.",
        icon: "success",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
        },
        confirmButtonText: "Aceptar",
      });
      onSuccess();
      await refreshLogs();
      form.reset();
      setSelectedProjectId("");
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error inesperado al procesar el pago";
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    form.reset();
    setSelectedProjectId("");
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-125 bg-white border border-blue-600">
        <DialogHeader>
          <DialogTitle className="text-blue-600 font-bold">
            Registrar Nuevo Pago
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            Registra un pago recibido para este proyecto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            {/* Selector de proyecto (solo en modo selector) */}
            {mode === "project-selector" && (
              <div className="space-y-2">
                <label className="text-blue-700 font-medium text-sm">
                  Proyecto
                </label>
                <Select
                  value={selectedProjectId}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger className="w-full text-blue-600 cursor-pointer">
                    <SelectValue placeholder="Selecciona un proyecto" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    align="start"
                    sideOffset={5}
                    className="bg-white border-blue-200"
                  >
                    {props.projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="text-sm text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
                      >
                        {project.name} - {project.customer?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Información del saldo - Solo mostrar si hay proyecto seleccionado */}
            {projectId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monto total:</span>
                  <span className="font-semibold text-gray-800">
                    {totalAmount}€
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total pagado:</span>
                  <span className="font-semibold text-gray-800">
                    {totalPaid}€
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-1 border-t border-blue-300">
                  <span className="text-blue-700 font-medium">
                    Saldo pendiente:
                  </span>
                  <span className="font-bold text-blue-700">
                    {remainingAmount}€
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-blue-700 font-medium">
                    Monto
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Monto del pago"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      disabled={!projectId}
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
                    Descripción
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descripción del pago"
                      className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                      {...field}
                      disabled={!projectId}
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
                disabled={
                  form.formState.isSubmitting ||
                  !projectId ||
                  remainingAmount <= 0
                }
              >
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TabPaymentDialog;
