import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export async function getActivityLogs() {
  try {
    const response = await api.get("/activity-log");
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando logs:", error);
    }
    return [];
  }
}

export async function getActivityLogsProject(id: string) {
  try {
    const response = await api.get(`/activity-log/project/${id}`);
    return response.data;
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error("Error cargando logs:", error);
    }
    return [];
  }
}
