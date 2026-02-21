import { CustomerFormValues } from "@/components/root/clientes/CustomerDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function getCustomers(page: number = 1) {
  try {
    const response = await api.get(`/customer?page=${page}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando clientes:", error);
    }
    return [];
  }
}

export async function createCustomer(customer: CustomerFormValues) {
  try {
    const response = await api.post("/customer", customer);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en la creacion del cliente"
      : "Error en la creacion del cliente";

    throw new Error(errorMessage);
  }
}

export async function updateCustomer(id: string, customer: CustomerFormValues) {
  try {
    const response = await api.put(`/customer/${id}`, customer);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en editar el cliente"
      : "Error en editar el cliente";

    throw new Error(errorMessage);
  }
}

export async function deleteCustomer(id: string) {
  try {
    const response = await api.delete(`/customer/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar al cliente"
      : "Error en eliminar al cliente";

    throw new Error(errorMessage);
  }
}
