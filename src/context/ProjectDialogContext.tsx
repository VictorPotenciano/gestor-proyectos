"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import ProjectDialog from "@/components/root/proyectos/ProjectDialog";
import { getCustomers } from "@/lib/customerapi";
import { getUsers } from "@/lib/userapi";
import { Customer, Project, User } from "../../typing";

interface ProjectDialogContextType {
  openDialog: (
    project?: Project,
    onUpdate?: () => void | Promise<void>
  ) => void;
  closeDialog: () => void;
  isOpen: boolean;
}

const ProjectDialogContext = createContext<
  ProjectDialogContextType | undefined
>(undefined);

export const useProjectDialog = () => {
  const context = useContext(ProjectDialogContext);
  if (!context) {
    throw new Error(
      "useProjectDialog must be used within ProjectDialogProvider"
    );
  }
  return context;
};

interface ProjectDialogProviderProps {
  children: ReactNode;
}

export const ProjectDialogProvider = ({
  children,
}: ProjectDialogProviderProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [onUpdateCallback, setOnUpdateCallback] = useState<
    (() => void | Promise<void>) | null
  >(null);

  const loadCustomersAndUsers = async () => {
    if (customers.length > 0 && users.length > 0) return;

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
      const customersRes = await getCustomers();
      setCustomers(customersRes.data);
      setUsers(allUsersData);
    } catch (err) {
      console.error("Error cargando clientes y usuarios:", err);
      setError("Error cargando datos necesarios");
    }
  };

  const openDialog = async (
    project?: Project,
    onUpdate?: () => void | Promise<void>
  ) => {
    await loadCustomersAndUsers();
    setCurrentProject(project || null);
    setOnUpdateCallback(() => onUpdate || null);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCurrentProject(null);
    setError(null);
    setOnUpdateCallback(null);
  };

  const handleCloseDialog = () => {
    closeDialog();
  };

  const handleLoadProjects = async () => {
    if (onUpdateCallback) {
      await Promise.resolve(onUpdateCallback());
    }
  };

  return (
    <ProjectDialogContext.Provider
      value={{
        openDialog,
        closeDialog,
        isOpen: dialogOpen,
      }}
    >
      {children}
      <ProjectDialog
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        error={error}
        setError={setError}
        currentProject={currentProject}
        isEditingProject={!!currentProject}
        loadProjects={handleLoadProjects}
        handleCloseDialog={handleCloseDialog}
        customers={customers}
        users={users}
      />
    </ProjectDialogContext.Provider>
  );
};
