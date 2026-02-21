"use client";

import { useCallback, useEffect, useState } from "react";
import { FolderKanban, Calendar, Euro, AlertCircle } from "lucide-react";
import {
  PaymentStatus,
  Project,
  ProjectStatus,
  StatItem,
  TaskStatus,
} from "../../../../typing";
import StatsCards from "@/components/root/StatsCards";
import { useRouter } from "next/navigation";
import ProjectHeader from "@/components/root/proyectos/ProjectHeader";
import axios from "axios";
import { getProjects } from "@/lib/projectapi";
import Loader from "@/components/root/Loader";
import ProjectList from "@/components/root/proyectos/ProjectList";
import { useProjectDialog } from "@/context/ProjectDialogContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Page = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<"todos" | ProjectStatus>(
    "todos"
  );
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
    "todos" | PaymentStatus
  >("todos");
  const [selectedProjects, setSelectedProjects] = useState<Project | null>(
    null
  );

  const itemsPerPage = 15;

  const router = useRouter();
  const { openDialog } = useProjectDialog();

  const loadProjects = useCallback(async () => {
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

      setAllProjects(allProjectsData);
      setFilteredProjects(allProjectsData);
      setSelectedProjects(null);

      const totalItems = allProjectsData.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      updatePagedProjects(allProjectsData, 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Error cargando proyectos");
      } else {
        setError("Error inesperado");
      }
    }
  }, []);

  const updatePagedProjects = (data: Project[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedProjects = data.slice(startIndex, endIndex);
    setProjects(pagedProjects);
    setCurrentPage(page);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  };

  useEffect(() => {
    const loadAlldata = async () => {
      setLoading(true);
      try {
        await loadProjects();
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAlldata();
  }, [loadProjects]);

  useEffect(() => {
    let result = allProjects;
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          project.customer?.name
            .toLowerCase()
            .startsWith(searchTerm.toLowerCase())
      );
    }
    if (selectedStatus !== "todos") {
      result = result.filter((p) => p.status === selectedStatus);
    }

    if (selectedPaymentStatus !== "todos") {
      result = result.filter((p) => p.paymentStatus === selectedPaymentStatus);
    }
    setFilteredProjects(result);
    updatePagedProjects(result, currentPage);
  }, [
    allProjects,
    searchTerm,
    currentPage,
    selectedStatus,
    selectedPaymentStatus,
  ]);

  useEffect(() => {
    updatePagedProjects(filteredProjects, currentPage);
  }, [currentPage, filteredProjects]);

  const calculateProgress = (project: Project): number => {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }

    const completedTasks = project.tasks.filter(
      (task) => task.status === TaskStatus.COMPLETADA
    ).length;

    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const filterCompleteProjects = projects.filter(
    (project) => project.status === ProjectStatus.COMPLETADO
  ).length;

  const filterInProgressProjects = projects.filter(
    (project) => project.status === ProjectStatus.EN_PROCESO
  ).length;

  const totalValue = allProjects.reduce((sum, project) => {
    const amount = Number(project.totalAmount) || 0;
    return sum + amount;
  }, 0);

  const stats: StatItem[] = [
    {
      title: "Total Proyectos",
      value: projects.length.toString(),
      icon: FolderKanban,
    },
    {
      title: "En Proceso",
      value: filterInProgressProjects.toString(),
      icon: Calendar,
    },
    {
      title: "Completados",
      value: filterCompleteProjects.toString(),
      icon: FolderKanban,
    },
    {
      title: "Valor Total",
      value: `${totalValue.toLocaleString("es-ES")}€`,
      icon: Euro,
    },
  ];

  const handleClickProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  const handleEditProject = (project: Project) => {
    openDialog(project, loadProjects);
  };

  const handleCreateProject = () => {
    openDialog(undefined, loadProjects);
  };

  const handleStatusClick = (filter: "todos" | ProjectStatus) => {
    setSelectedStatus(filter);
  };

  const handlePaymentStatusClick = (filter: "todos" | PaymentStatus) => {
    setSelectedPaymentStatus(filter);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <ProjectHeader setDialogOpen={handleCreateProject} />

        <StatsCards stats={stats} />

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <ProjectList
          projects={projects}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          calculateProgress={calculateProgress}
          handleClickProject={handleClickProject}
          handleEditProject={handleEditProject}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          handleStatusClick={handleStatusClick}
          selectedPaymentStatus={selectedPaymentStatus}
          handlePaymentStatusClick={handlePaymentStatusClick}
          loadProjects={loadProjects}
          setError={setError}
          selectedProjects={selectedProjects}
          setSelectedProjects={setSelectedProjects}
        />
      </main>
    </div>
  );
};
export default Page;
