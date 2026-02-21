import { ProjectFormValues } from "@/components/root/proyectos/ProjectDialog";
import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function getProjects(page: number = 1) {
  try {
    const response = await api.get(`/projects?page=${page}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando proyectos:", error);
    }
    return [];
  }
}

export async function getProject(
  id: string,
  activitiesPage: number = 1,
  tasksPage: number = 1,
  commentsPage: number = 1
) {
  try {
    const params = new URLSearchParams({
      activitiesPage: activitiesPage.toString(),
      tasksPage: tasksPage.toString(),
      commentsPage: commentsPage.toString(),
    });
    const response = await api.get(`/projects/${id}?${params.toString()}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando el proyecto:", error);
    }
    return null;
  }
}

export async function createProject(project: ProjectFormValues) {
  try {
    const response = await api.post("/projects", project);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en la creacion del proyecto"
      : "Error en la creacion del proyecto";

    throw new Error(errorMessage);
  }
}

export async function updateProject(id: string, project: ProjectFormValues) {
  try {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en editar el proyecto"
      : "Error en editar el proyecto";

    throw new Error(errorMessage);
  }
}

export async function completeProject(id: string) {
  try {
    const response = await api.patch(`/projects/${id}/status/complete`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en completar el proyecto"
      : "Error en completar el proyecto";

    throw new Error(errorMessage);
  }
}

export async function pausedProject(id: string) {
  try {
    const response = await api.patch(`/projects/${id}/status/paused`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en pausar el proyecto"
      : "Error en pausar el proyecto";

    throw new Error(errorMessage);
  }
}

export async function inProgressProject(id: string) {
  try {
    const response = await api.patch(`/projects/${id}/status/in-progress`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en poner en proceso el proyecto"
      : "Error en poner en proceso el proyecto";

    throw new Error(errorMessage);
  }
}

export async function cancelProject(id: string) {
  try {
    const response = await api.patch(`/projects/${id}/status/cancel`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en cancelar el proyecto"
      : "Error en cancelar el proyecto";

    throw new Error(errorMessage);
  }
}

export async function deleteProject(id: string) {
  try {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar al proyecto"
      : "Error en eliminar al proyecto";

    throw new Error(errorMessage);
  }
}
