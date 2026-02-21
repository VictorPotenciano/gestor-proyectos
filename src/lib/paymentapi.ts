import { PaymentFormValues } from "@/components/root/proyectos/proyectosDetails/tabs/tabPayment/TabPaymentDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function createPayment(
  payment: PaymentFormValues & { projectId: string }
) {
  try {
    const response = await api.post("/payments", payment);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al agregar al pago"
      : "Error al agregar al pago";

    throw new Error(errorMessage);
  }
}

export async function deletePayment(id: string) {
  try {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar al pago"
      : "Error en eliminar al pago";

    throw new Error(errorMessage);
  }
}
