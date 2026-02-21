"use client";

import { useCallback, useEffect, useState } from "react";
import { User } from "../../../../typing";
import axios from "axios";
import { getUsers } from "@/lib/userapi";
import Loader from "@/components/root/Loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UserHeader from "@/components/root/usuarios/UserHeader";
import UserList from "@/components/root/usuarios/UserList";

const Page = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const itemsPerPage = 15;

  const loadUsers = useCallback(async () => {
    try {
      let allUsersData: User[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        const response = await getUsers(currentPage);
        allUsersData = [...allUsersData, ...response.data];
        hasMorePages = currentPage < response.pagination.totalPages;
        currentPage++;
      }

      setAllUsers(allUsersData);
      setFilteredUsers(allUsersData);

      const totalItems = allUsersData.length;
      setTotalPages(Math.ceil(totalItems / itemsPerPage));
      updatePagedUsers(allUsersData, 1);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data.message || "Error cargando usuarios");
      } else {
        setError("Error inesperado");
      }
    }
  }, []);

  const updatePagedUsers = (data: User[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagedUsers = data.slice(startIndex, endIndex);
    setUsers(pagedUsers);
    setCurrentPage(page);
    setTotalPages(Math.ceil(data.length / itemsPerPage));
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await loadUsers();
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [loadUsers]);

  useEffect(() => {
    let result = allUsers;
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().startsWith(searchTerm.toLowerCase())
      );
    }
    setFilteredUsers(result);
    updatePagedUsers(result, currentPage);
  }, [allUsers, currentPage, searchTerm]);

  useEffect(() => {
    updatePagedUsers(filteredUsers, currentPage);
  }, [currentPage, filteredUsers]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <UserHeader />
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <UserList
          users={users}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          loadUsers={loadUsers}
          setError={setError}
        />
      </main>
    </div>
  );
};

export default Page;
