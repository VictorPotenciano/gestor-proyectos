"use client";

import { useEffect, useState } from "react";
import { Plus, Users } from "lucide-react";
import StatsCards from "@/components/root/StatsCards";
import CustomerDialog from "@/components/root/clientes/CustomerDialog";
import { getCustomers } from "@/lib/customerapi";
import { Customer, StatItem } from "../../../../typing";
import Loader from "@/components/root/Loader";
import axios from "axios";
import CustomerHeader from "@/components/root/clientes/CustomerHeader";
import CustomerList from "@/components/root/clientes/CustomerList";

const Page = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 15;

  const loadCustomers = async () => {
    setLoading(true);
    try {
      let allCustomersData: Customer[] = [];
      let currentPage = 1;
      let hasMorePages = true;
      // Recorrer todas las páginas
      while (hasMorePages) {
        const response = await getCustomers(currentPage);
        allCustomersData = [...allCustomersData, ...response.data];

        // Verificar si hay más páginas
        hasMorePages = currentPage < response.pagination.totalPages;
        currentPage++;
      }

      setAllCustomers(allCustomersData);
      setFilteredCustomers(allCustomersData);
      // Calcular paginación inicial
      const totalItems = allCustomersData.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      updatePagedCustomers(allCustomersData, 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Error cargando clientes");
      } else {
        setError("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  // Actualizar los clientes paginados basados en los datos filtrados/ordenados
  const updatePagedCustomers = (data: Customer[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedCustomers = data.slice(startIndex, endIndex);
    setCustomers(pagedCustomers);
    setCurrentPage(page);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  };

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let result = allCustomers;
    if (searchTerm) {
      result = result.filter(
        (customer) =>
          customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Actualizar datos filtrados y paginación
    setFilteredCustomers(result);
    updatePagedCustomers(result, currentPage);
  }, [allCustomers, searchTerm, currentPage]);

  // Efecto separado para manejar cambios de página
  useEffect(() => {
    updatePagedCustomers(filteredCustomers, currentPage);
  }, [currentPage, filteredCustomers]);

  const getNewCustomersThisMonth = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return customers.filter((customer) => {
      const createdDate = new Date(customer.createdAt);
      return (
        createdDate.getMonth() === currentMonth &&
        createdDate.getFullYear() === currentYear
      );
    }).length;
  };

  const stats: StatItem[] = [
    {
      title: "Total Clientes",
      value: customers.length.toString(),
      icon: Users,
    },
    {
      title: "Nuevos Este Mes",
      value: getNewCustomersThisMonth().toString(),
      icon: Plus,
    },
  ];

  const handleEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer);
    setIsEditingCustomer(true);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setCurrentCustomer(null);
    setIsEditingCustomer(false);
    setDialogOpen(false);
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
        {/* Header */}
        <CustomerHeader setDialogOpen={setDialogOpen} />

        {/* Stats Cards */}
        <StatsCards stats={stats} />
        <CustomerList
          customers={customers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          handleEditCustomer={handleEditCustomer}
          loadCustomers={loadCustomers}
          setError={setError}
        />
        <CustomerDialog
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          error={error}
          setError={setError}
          currentCustomer={currentCustomer}
          isEditingCustomer={isEditingCustomer}
          loadCustomers={loadCustomers}
          handleCloseDialog={handleCloseDialog}
        />
      </main>
    </div>
  );
};

export default Page;
