import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CustomerFormValues } from "./CustomerDialog";

interface CustomerDialogFormProps {
  form: UseFormReturn<CustomerFormValues>;
  error: string | null;
  isEditingCustomer: boolean;
  handleCloseDialog: () => void;
  handleSubmit: (data: CustomerFormValues) => Promise<void>;
}
const CustomerDialogForm = ({
  form,
  error,
  isEditingCustomer,
  handleCloseDialog,
  handleSubmit,
}: CustomerDialogFormProps) => {
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 py-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700 font-medium">
                Nombre del cliente
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: TechCorp Solutions"
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700 font-medium">
                Email (opcional)
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="contacto@empresa.com"
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                  value={field.value || ""}
                  onChange={(e) => field.onChange(e.target.value || null)}
                />
              </FormControl>
              <FormMessage className="text-red-600 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-blue-700 font-medium">
                Teléfono (opcional)
              </FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+34 612 345 678"
                  className="border-blue-200 focus:border-blue-500 focus:ring-blue-400"
                  value={field.value || ""}
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
            {isEditingCustomer ? "Actualizar Cliente" : "Crear Cliente"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CustomerDialogForm;
