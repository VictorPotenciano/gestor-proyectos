import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project, Task } from "../../../../../../../typing";
import { useMemo, useState } from "react";
import TabTaskTable from "./TabTaskTable";
import TabTasksDialogForm from "./TabTasksDialogForm";
import Pagination from "../Pagination";
import TabTasksFilters from "./TabTasksFilters";
import TaksDialog from "@/components/root/TaskDialog";
import TabTasksButtons from "./TasksButtons";
import TabTaskCard from "./TabTaskCard";

interface ProjectDetailTabsTaskProps {
  project: Project;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  isPending: boolean;
  allTasks: Task[];
  loadAllTasks: () => void;
}

const ProjectDetailTabsTask = ({
  project,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
  pagination,
  onPageChange,
  isPending,
  allTasks,
  loadAllTasks,
}: ProjectDetailTabsTaskProps) => {
  const [error, setError] = useState<string | null>(null);
  const [dialogFormOpen, setDialogFormOpen] = useState(false);
  const [dialogTaskOpen, setDialogTaskOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [priorityFilter, setPriorityFilter] = useState<string>("todos");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = pagination.limit || 10;

  const handleEditTask = (task: Task) => {
    setDialogFormOpen(true);
    setCurrentTask(task);
    setIsEditingTask(true);
  };

  const handleCloseDialogForm = () => {
    setDialogFormOpen(false);
    setCurrentTask(null);
    setIsEditingTask(false);
  };

  const handleViewTask = (task: Task) => {
    setDialogTaskOpen(true);
    setCurrentTask(task);
  };

  const handleCloseDialogTask = () => {
    setDialogTaskOpen(false);
    setCurrentTask(null);
  };

  const handleSelectionChange = (newSelectedTask: Task | null) => {
    setSelectedTask(newSelectedTask);
  };

  const filteredTasks = useMemo(() => {
    let result = allTasks || [];

    if (statusFilter !== "todos") {
      result = result.filter((task) => task.status === statusFilter);
    }

    if (priorityFilter !== "todos") {
      result = result.filter((task) => task.priority === priorityFilter);
    }
    return result;
  }, [allTasks, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filteredTasks.length / ITEMS_PER_PAGE);

  // Obtener tareas de la página actual
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, ITEMS_PER_PAGE]);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    onPageChange(1);
  };

  const handlePriorityFilterChange = (value: string) => {
    setPriorityFilter(value);
    setCurrentPage(1);
    onPageChange(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      onPageChange(page);
    }
  };

  const hasActiveFilters =
    statusFilter !== "todos" || priorityFilter !== "todos";

  return (
    <TabsContent value="tareas">
      <Card className="border-blue-600 shadow-lg rounded-2xl overflow-hidden p-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-linear-to-r from-blue-50 to-white border-b border-blue-100 px-5 py-5 md:py-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <CardTitle className="text-xl md:text-2xl text-blue-700 font-semibold flex items-center gap-2.5 flex-wrap">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
              Tareas
            </CardTitle>
            <p className="text-sm text-gray-600 md:text-base">
              Lista de tareas y avances del proyecto
            </p>
          </div>

          {project.status !== "COMPLETADO" &&
            project.status !== "CANCELADO" && (
              <Button
                onClick={() => setDialogFormOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap shrink-0 w-full sm:w-auto cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2 shrink-0" />
                Nueva Tarea
              </Button>
            )}
        </CardHeader>
        {/* Filtros */}
        <TabTasksFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          handleStatusFilterChange={handleStatusFilterChange}
          handlePriorityFilterChange={handlePriorityFilterChange}
          hasActiveFilters={hasActiveFilters}
          filteredTasks={filteredTasks}
          allTasks={allTasks}
          paginatedTasks={paginatedTasks}
        />
        <CardContent className="p-0">
          {selectedTask && (
            <TabTasksButtons
              selectedTask={selectedTask}
              loadProject={loadProject}
              activitiesPage={activitiesPage}
              tasksPage={tasksPage}
              commentsPage={commentsPage}
              setError={setError}
            />
          )}
          {/* En ordenador tabla */}
          <div className="hidden lg:block">
            <TabTaskTable
              project={{ ...project, tasks: paginatedTasks }}
              handleEditTask={handleEditTask}
              handleViewTask={handleViewTask}
              loadProject={loadProject}
              activitiesPage={activitiesPage}
              tasksPage={tasksPage}
              commentsPage={commentsPage}
              error={error}
              setError={setError}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              handleSelectionChange={handleSelectionChange}
            />
          </div>
          {/* En movil y tablet card */}
          <div className="lg:hidden space-y-4">
            <TabTaskCard
              project={{ ...project, tasks: paginatedTasks }}
              handleEditTask={handleEditTask}
              handleViewTask={handleViewTask}
              loadProject={loadProject}
              activitiesPage={activitiesPage}
              tasksPage={tasksPage}
              commentsPage={commentsPage}
              error={error}
              setError={setError}
              selectedTask={selectedTask}
              setSelectedTask={setSelectedTask}
              handleSelectionChange={handleSelectionChange}
            />
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTasks.length}
            onPageChange={handlePageChange}
            disabled={isPending}
            itemLabel="tareas"
          />
        </CardContent>
      </Card>
      <TaksDialog
        open={dialogTaskOpen}
        onClose={handleCloseDialogTask}
        task={currentTask}
      />
      <TabTasksDialogForm
        open={dialogFormOpen}
        onClose={handleCloseDialogForm}
        project={project}
        error={error}
        setError={setError}
        currentTask={currentTask}
        isEditingTask={isEditingTask}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
        loadAllTasks={loadAllTasks}
      />
    </TabsContent>
  );
};

export default ProjectDetailTabsTask;
