"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Project, Task } from "../../../../../typing";
import { getProject } from "@/lib/projectapi";
import Loader from "@/components/root/Loader";
import { useParams } from "next/navigation";
import ProjectDetailInfo from "@/components/root/proyectos/proyectosDetails/ProjectDetailInfo";
import ProjectDetailHeader from "@/components/root/proyectos/proyectosDetails/ProjectDetailHeader";
import ProjectDetailPayment from "@/components/root/proyectos/proyectosDetails/ProjectDetailPayment";
import ProjectDetailTask from "@/components/root/proyectos/proyectosDetails/ProjectDetailTask";
import { AlertCircle } from "lucide-react";
import ProjectDetailTabs from "@/components/root/proyectos/proyectosDetails/tabs/ProjectDetailTabs";
import { useProjectDialog } from "@/context/ProjectDialogContext";
import ProjectButtons from "@/components/root/proyectos/ProjectButtons";
import { getAllTasksFromProject } from "@/lib/taskapi";

const Page = () => {
  const { id } = useParams();
  const projectId = Array.isArray(id) ? id[0] : id;
  const [project, setProject] = useState<Project | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { openDialog } = useProjectDialog();

  // Estados para paginación
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [tasksPage, setTasksPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);

  const [pagination, setPagination] = useState({
    activities: { total: 0, page: 1, limit: 10, totalPages: 0 },
    tasks: { total: 0, page: 1, limit: 10, totalPages: 0 },
    comments: { total: 0, page: 1, limit: 10, totalPages: 0 },
  });

  const loadProject = async (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader: boolean = true
  ) => {
    if (!projectId) {
      setLoading(false);
      return;
    }
    if (showLoader) {
      setLoading(true);
    }
    try {
      const data = await getProject(projectId, actPage, tskPage, cmtPage);

      const { pagination: paginationData, ...projectData } = data;

      setProject(projectData);
      if (paginationData) {
        setPagination(paginationData);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  const loadAllTasks = async () => {
    if (!projectId) return;

    try {
      const tasks = await getAllTasksFromProject(projectId);
      setAllTasks(tasks);
    } catch (error) {
      console.error("Error cargando todas las tareas:", error);
    }
  };

  // Carga inicial
  useEffect(() => {
    const loadAllData = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        await Promise.all([
          loadProject(activitiesPage, tasksPage, commentsPage, false),
          loadAllTasks(),
        ]);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleEditClick = () => {
    if (project) {
      openDialog(project, () =>
        loadProject(activitiesPage, tasksPage, commentsPage)
      );
    }
  };

  // Funciones para paginación de Activities con transición
  const handleActivitiesPageChange = (page: number) => {
    startTransition(() => {
      setActivitiesPage(page);
      loadProject(page, tasksPage, commentsPage, false);
    });
  };

  // Funciones para paginación de Tasks con transición
  const handleTasksPageChange = (page: number) => {
    startTransition(() => {
      setTasksPage(page);
      loadProject(activitiesPage, page, commentsPage, false);
    });
  };

  // Funciones para paginación de Comments con transición
  const handleCommentsPageChange = (page: number) => {
    startTransition(() => {
      setCommentsPage(page);
      loadProject(activitiesPage, tasksPage, page, false);
    });
  };

  if (loading) return <Loader />;

  if (!project || !projectId) {
    return (
      <div className="min-h-screen">
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-blue-100">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-blue-600" />
              </div>
              <h1 className="text-2xl font-bold mb-3 text-gray-900">
                Proyecto no encontrado
              </h1>
              <p className="text-gray-600 mb-6">
                El proyecto que buscas no existe o ha sido eliminado.
              </p>
              <Button
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 px-6 cursor-pointer"
              >
                <Link href="/proyectos">Volver a proyectos</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <ProjectDetailHeader project={project} />

        {/* Botones de acciones */}
        <ProjectButtons
          selectedProjects={project}
          loadProjects={() =>
            loadProject(activitiesPage, tasksPage, commentsPage)
          }
          projects={[project]}
          showCounter={false}
        />

        {/* Stats Cards */}
        <div className="grid gap-6 lg:grid-cols-5">
          <ProjectDetailInfo project={project} onEditClick={handleEditClick} />

          <div className="lg:col-span-2 flex flex-col gap-6">
            <ProjectDetailPayment project={project} />

            <ProjectDetailTask allTasks={allTasks} />
          </div>
        </div>

        {/* Tabs */}
        <ProjectDetailTabs
          project={project}
          pagination={pagination}
          onActivitiesPageChange={handleActivitiesPageChange}
          onTasksPageChange={handleTasksPageChange}
          onCommentsPageChange={handleCommentsPageChange}
          activitiesPage={activitiesPage}
          tasksPage={tasksPage}
          commentsPage={commentsPage}
          isPending={isPending}
          loadProject={loadProject}
          allTasks={allTasks}
          loadAllTasks={loadAllTasks}
        />
      </main>
    </div>
  );
};

export default Page;
