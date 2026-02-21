"use client";

import { useCallback, useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { PaymentStatus, Project, StatItem } from "../../../../typing";
import StatsCards from "@/components/root/StatsCards";
import { getProjects } from "@/lib/projectapi";
import axios from "axios";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import Loader from "@/components/root/Loader";
import PaymentHeader from "@/components/root/finanzas/PaymentHeader";
import ProgressPayments from "@/components/root/finanzas/ProgressPayments";
import PaymentList from "@/components/root/finanzas/PaymentList";
import TabPaymentDialog from "@/components/root/proyectos/proyectosDetails/tabs/tabPayment/TabPaymentDialog";

const Page = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<
    "todos" | PaymentStatus
  >("todos");
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const router = useRouter();

  const itemsPerPage = 15;

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
    let result = allProjects.filter((p) => p.status !== "CANCELADO");
    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          project.customer?.name
            .toLowerCase()
            .startsWith(searchTerm.toLowerCase())
      );
    }

    if (selectedPaymentStatus !== "todos") {
      result = result.filter((p) => p.paymentStatus === selectedPaymentStatus);
    }
    setFilteredProjects(result);
    updatePagedProjects(result, currentPage);
  }, [allProjects, searchTerm, currentPage, selectedPaymentStatus]);

  useEffect(() => {
    updatePagedProjects(filteredProjects, currentPage);
  }, [currentPage, filteredProjects]);

  const nonCancelledProjects = allProjects.filter(
    (p) => p.status !== "CANCELADO"
  );

  const totalPaid = nonCancelledProjects.reduce(
    (sum, p) => sum + Number(p.paidAmount || 0),
    0
  );

  const totalGeneral = nonCancelledProjects.reduce(
    (sum, p) => sum + Number(p.totalAmount || 0),
    0
  );

  const totalPending = totalGeneral - totalPaid;

  const percentageCharged =
    totalGeneral > 0 ? (totalPaid / totalGeneral) * 100 : 0;

  const stats: StatItem[] = [
    {
      title: "Total Cobrado",
      value: totalPaid + "€",
      icon: CheckCircle2,
    },
    {
      title: "Pendiente",
      value: totalPending + "€",
      icon: Clock,
    },
    {
      title: "Total General",
      value: totalGeneral + "€",
      icon: TrendingUp,
    },
  ];

  const handleClickProject = (projectId: string) => {
    router.push(`/proyectos/${projectId}`);
  };

  const handlePaymentStatusClick = (filter: "todos" | PaymentStatus) => {
    setSelectedPaymentStatus(filter);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePaymentSuccess = () => {
    loadProjects();
  };

  const projectsToPay = allProjects.filter(
    (p) =>
      p.status !== "CANCELADO" &&
      p.status !== "COMPLETADO" &&
      p.paymentStatus !== "PAGADO"
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <PaymentHeader setIsPaymentDialogOpen={setIsPaymentDialogOpen} />

        {/* Stats Cards */}
        <StatsCards stats={stats} />

        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progreso Pagos */}
        <ProgressPayments
          totalPaid={totalPaid}
          totalGeneral={totalGeneral}
          percentageCharged={percentageCharged}
        />

        <PaymentList
          projects={projects}
          currentPage={currentPage}
          totalPages={totalPages}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPaymentStatus={selectedPaymentStatus}
          handlePaymentStatusClick={handlePaymentStatusClick}
          handlePageChange={handlePageChange}
          handleClickProject={handleClickProject}
        />

        <TabPaymentDialog
          mode="project-selector"
          open={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          onSuccess={handlePaymentSuccess}
          error={error}
          setError={setError}
          projects={projectsToPay}
        />
      </main>
    </div>
  );
};
export default Page;
