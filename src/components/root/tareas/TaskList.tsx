import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, ListTodo } from "lucide-react";
import PaginationTable from "@/components/root/PaginationTable";
import { Project, Task, TaskPriority, TaskStatus } from "../../../../typing";
import TaskDialog from "../TaskDialog";
import { useState } from "react";
import TaskFilters from "./TaskFilters";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  selectedStatus: "todos" | TaskStatus;
  handleStatusClick: (filter: TaskStatus) => void;
  selectedPriority: "todos" | TaskPriority;
  handlePriorityClick: (filter: TaskPriority) => void;
  selectedProject: string;
  handleProjectClick: (filter: string) => void;
  currentPage: number;
  totalPages: number;
  handlePageChange: (page: number) => void;
  handleDeleteTask: (task: Task) => void;
}

const TaskList = ({
  tasks,
  projects,
  searchTerm,
  setSearchTerm,
  selectedStatus,
  handleStatusClick,
  selectedPriority,
  handlePriorityClick,
  selectedProject,
  handleProjectClick,
  currentPage,
  totalPages,
  handlePageChange,
  handleDeleteTask,
}: TaskListProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);

  const handleViewTask = (task: Task) => {
    setDialogOpen(true);
    setCurrentTask(task);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };
  return (
    <>
      <Card className="bg-white border border-blue-600 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <CardTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2">
              <CheckCircle2 className="h-7 w-7" />
              Lista de Tareas
            </CardTitle>
            <TaskFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedStatus={selectedStatus}
              handleStatusClick={handleStatusClick}
              selectedPriority={selectedPriority}
              handlePriorityClick={handlePriorityClick}
              projects={projects}
              selectedProject={selectedProject}
              handleProjectClick={handleProjectClick}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex flex-col items-center text-blue-600">
                <ListTodo className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-medium mb-2">
                  No se encontraron tareas
                </p>
              </div>
            </div>
          ) : (
            tasks.map((task) => {
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  handleViewTask={handleViewTask}
                  handleDeleteTask={handleDeleteTask}
                />
              );
            })
          )}
          {totalPages > 1 && (
            <PaginationTable
              currentPage={currentPage}
              totalPages={totalPages}
              handlePageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>
      <TaskDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        task={currentTask}
        showProjectName={true}
      />
    </>
  );
};

export default TaskList;
