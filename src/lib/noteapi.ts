import { NoteFormValues } from "@/components/root/proyectos/proyectosDetails/tabs/tabNotes/TabNotesDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function createNote(note: NoteFormValues & { projectId: string }) {
  try {
    const response = await api.post("/notes", note);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al agregar la nota"
      : "Error al agregar la nota";

    throw new Error(errorMessage);
  }
}

export async function updateNote(id: string, note: NoteFormValues) {
  try {
    const response = await api.put(`/notes/${id}`, note);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al editar la nota"
      : "Error al editar la nota";

    throw new Error(errorMessage);
  }
}

export async function deleteNote(id: string) {
  try {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar la nota"
      : "Error en eliminar la nota";

    throw new Error(errorMessage);
  }
}
