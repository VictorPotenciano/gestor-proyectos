import { RegisterFormValues } from "@/components/root/navbar/RegisterUserDialog";
import { ProfileFormValues } from "@/components/root/navbar/UpdateProfileDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function getUsers(page: number = 1) {
  try {
    const response = await api.get(`/user?page=${page}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando usuarios:", error);
    }
    return [];
  }
}

export async function changePassword(password: string) {
  try {
    const response = await api.put("/user/changePassword", {
      password,
    });
    return response.data;
  } catch (error) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al actualizar la contraseña"
      : "Error al actualizar la contraseña";
    throw new Error(errorMessage);
  }
}

export async function updateUser(data: ProfileFormValues) {
  try {
    const response = await api.put("/user/profile", data);
    return response.data;
  } catch (error) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al actualizar el usuario"
      : "Error al actualizar el usuario";
    throw new Error(errorMessage);
  }
}

export async function registerUser(user: RegisterFormValues) {
  try {
    const response = await api.post("/auth/register", user);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al registrar el usuario"
      : "Error al registrar el usuario";

    throw new Error(errorMessage);
  }
}

export async function deleteUser(id: string) {
  try {
    const response = await api.delete(`/user/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar el usuario"
      : "Error en eliminar el usuario";

    throw new Error(errorMessage);
  }
}
