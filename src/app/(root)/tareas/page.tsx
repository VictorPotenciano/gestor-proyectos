"use client";

import { useCallback, useEffect, useState } from "react";
import { ListTodo, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Project,
  StatItem,
  Task,
  TaskPriority,
  TaskStatus,
} from "../../../../typing";
import StatsCards from "@/components/root/StatsCards";
import axios from "axios";
import Loader from "@/components/root/Loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import TaskHeader from "@/components/root/tareas/TaskHeader";
import TaskList from "@/components/root/tareas/TaskList";
import { getProjects } from "@/lib/projectapi";
import { deleteTask, getUserTasks } from "@/lib/taskapi";
import Swal from "sweetalert2";
import { useActivityLogs } from "@/context/ActivityLogContext";

const Page = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"todos" | TaskStatus>(
    "todos"
  );
  const [selectedPriority, setSelectedPriority] = useState<
    "todos" | TaskPriority
  >("todos");
  const [selectedProject, setSelectedProject] = useState<string>("todos");

  const itemsPerPage = 15;

  const { refreshLogs } = useActivityLogs();

  const loadTasks = useCallback(async () => {
    try {
      let allTasksData: Task[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await getUserTasks(currentPage);
        allTasksData = [...allTasksData, ...response.data];
        hasMorePages = currentPage < response.pagination.totalPages;
        currentPage++;
      }
      setAllTasks(allTasksData);
      setFilteredTasks(allTasksData);

      const totalItems = allTasksData.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      updatePagedTasks(allTasksData, 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Error cargando tareas");
      } else {
        setError("Error inesperado");
      }
    }
  }, []);

  const loadProjects = async () => {
    try {
      let allProjectsData: Project[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      while (hasMorePages) {
        const response = await getProjects(currentPage);
        allProjectsData = [...allProjectsData, ...response.data];
        hasMorePages = currentPage < response.pagination.totalPages;
        currentPage++;
      }
      setProjects(allProjectsData);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Error cargando proyectos");
      } else {
        setError("Error inesperado");
      }
    }
  };

  useEffect(() => {
    const loadAlldata = async () => {
      setLoading(true);
      try {
        await loadTasks();
        await loadProjects();
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAlldata();
  }, [loadTasks]);

  const updatePagedTasks = (data: Task[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedTasks = data.slice(startIndex, endIndex);
    setTasks(pagedTasks);
    setCurrentPage(page);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  };

  useEffect(() => {
    let result = allTasks;
    if (searchTerm) {
      result = result.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== "todos") {
      result = result.filter((task) => task.status === selectedStatus);
    }
    if (selectedPriority !== "todos") {
      result = result.filter((task) => task.priority === selectedPriority);
    }
    if (selectedProject !== "todos") {
      result = result.filter((task) => task.projectId === selectedProject);
    }
    setFilteredTasks(result);
    updatePagedTasks(result, currentPage);
  }, [
    allTasks,
    searchTerm,
    selectedStatus,
    selectedPriority,
    selectedProject,
    currentPage,
  ]);

  useEffect(() => {
    updatePagedTasks(filteredTasks, currentPage);
  }, [currentPage, filteredTasks]);

  const totalTasks = allTasks.length;

  const completedTasks = allTasks
    .filter((task) => task.status === "COMPLETADA")
    .map((t) => t.id);

  const pendingTasks = allTasks
    .filter((task) => task.status === "PENDIENTE")
    .map((t) => t.id);

  const inProgressTasks = allTasks
    .filter((task) => task.status === "EN_PROGRESO")
    .map((t) => t.id);

  const stats: StatItem[] = [
    {
      title: "Total Tareas",
      value: totalTasks.toString(),
      icon: ListTodo,
    },
    {
      title: "Pendientes",
      value: pendingTasks.length.toString(),
      icon: Clock,
    },
    {
      title: "En Progreso",
      value: inProgressTasks.length.toString(),
      icon: AlertCircle,
    },
    {
      title: "Completadas",
      value: completedTasks.length.toString(),
      icon: CheckCircle2,
    },
  ];

  const handleStatusClick = (filter: "todos" | TaskStatus) => {
    setSelectedStatus(filter);
  };

  const handlePriorityClick = (filter: "todos" | TaskPriority) => {
    setSelectedPriority(filter);
  };

  const handleProjectClick = (filter: string) => {
    setSelectedProject(filter);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteTask = async (task: Task) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar una tarea.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminala",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deleteTask(task.id);
        loadTasks();
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "La tarea ha sido eliminada con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado al eliminar";
      setError(errorMessage);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <TaskHeader />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <TaskList
          tasks={tasks}
          projects={projects}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          handleStatusClick={handleStatusClick}
          selectedPriority={selectedPriority}
          handlePriorityClick={handlePriorityClick}
          selectedProject={selectedProject}
          handleProjectClick={handleProjectClick}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          handleDeleteTask={handleDeleteTask}
        />
      </main>
    </div>
  );
};
export default Page;
