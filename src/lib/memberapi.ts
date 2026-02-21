import { MemberFormValues } from "@/components/root/proyectos/proyectosDetails/tabs/tabMembers/TabMembersDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function createMembers(
  member: MemberFormValues & { projectId: string }
) {
  try {
    const response = await api.post("/members", member);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al agregar al miembro"
      : "Error al agregar al miembro";

    throw new Error(errorMessage);
  }
}

export async function deleteMember(id: string) {
  try {
    const response = await api.delete(`/members/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar al miembro"
      : "Error en eliminar al miembro";

    throw new Error(errorMessage);
  }
}
