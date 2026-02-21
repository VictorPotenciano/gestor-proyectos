import { TaskFormValues } from "@/components/root/proyectos/proyectosDetails/tabs/tabTask/TabTasksDialogForm";
import axios from "axios";
import { Task } from "../../typing";
import { getProject } from "./projectapi";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function getUserTasks(page: number = 1) {
  try {
    const response = await api.get(`/tasks?page=${page}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando tareas:", error);
    }
    return [];
  }
}

export const getAllTasksFromProject = async (projectId: string) => {
  let allTasks: Task[] = [];
  let currentPage = 1;
  let hasMorePages = true;

  while (hasMorePages) {
    const response = await getProject(projectId, 1, currentPage, 1);
    allTasks = [...allTasks, ...(response.tasks || [])];
    hasMorePages = currentPage < response.pagination.tasks.totalPages;
    currentPage++;
  }

  return allTasks;
};

export async function createTask(task: TaskFormValues & { projectId: string }) {
  try {
    const response = await api.post("/tasks", task);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al agregar la tarea"
      : "Error al agregar la tarea";

    throw new Error(errorMessage);
  }
}

export async function updateTask(id: string, task: TaskFormValues) {
  try {
    const response = await api.put(`/tasks/${id}`, task);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error al editar la tarea"
      : "Error al editar la tarea";

    throw new Error(errorMessage);
  }
}

export async function completeTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/status/completed`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en completar la tarea"
      : "Error en completar la tarea";

    throw new Error(errorMessage);
  }
}

export async function cancelTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/status/cancel`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en cancelar la tarea"
      : "Error en cancelar la tarea";

    throw new Error(errorMessage);
  }
}

export async function inProgressTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/status/in-progress`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en poner la tarea en progreso"
      : "Error en poner la tarea en progreso";

    throw new Error(errorMessage);
  }
}

export async function pendingTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/status/pending`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en poner la tarea en pendiente"
      : "Error en poner la tarea en pendiente";

    throw new Error(errorMessage);
  }
}

export async function reviewTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/status/review`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en poner la tarea en revisión"
      : "Error en poner la tarea en revisión";

    throw new Error(errorMessage);
  }
}

export async function priorityHighTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/priority/high`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        "Error en poner la tarea en prioridad alta"
      : "Error en poner la tarea en prioridad alta";

    throw new Error(errorMessage);
  }
}

export async function priorityMediumTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/priority/medium`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        "Error en poner la tarea en prioridad media"
      : "Error en poner la tarea en prioridad media";

    throw new Error(errorMessage);
  }
}

export async function priorityLowTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/priority/low`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        "Error en poner la tarea en prioridad baja"
      : "Error en poner la tarea en prioridad baja";

    throw new Error(errorMessage);
  }
}

export async function priorityUrgentTask(id: string) {
  try {
    const response = await api.patch(`/tasks/${id}/priority/urgent`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message ||
        "Error en poner la tarea en prioridad urgente"
      : "Error en poner la tarea en prioridad urgente";

    throw new Error(errorMessage);
  }
}

export async function deleteTask(id: string) {
  try {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = axios.isAxiosError(error)
      ? error.response?.data?.message || "Error en eliminar la tarea"
      : "Error en eliminar la tarea";

    throw new Error(errorMessage);
  }
}
