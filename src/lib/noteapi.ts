import axios from "axios";
import { CreateNoteParams, UpdateNoteParams } from "../../typing";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function createNote({
  content,
  projectId,
  files = [],
}: CreateNoteParams) {
  try {
    const formData = new FormData();
    formData.append("content", content);
    formData.append("projectId", projectId);
    files.forEach((file) => formData.append("files", file));

    const response = await api.post("/notes", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al agregar la nota"
      : "Error al agregar la nota";
    throw new Error(errorMessage);
  }
}

export async function updateNote(
  id: string,
  { content, keepAttachmentIds = [], files = [] }: UpdateNoteParams
) {
  try {
    const formData = new FormData();
    formData.append("content", content);
    keepAttachmentIds.forEach((attId) =>
      formData.append("keepAttachmentIds", attId)
    );
    files.forEach((file) => formData.append("files", file));

    const response = await api.put(`/notes/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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
