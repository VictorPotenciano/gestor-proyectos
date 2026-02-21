import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter, AlertCircle } from "lucide-react";
import { Project, TaskPriority, TaskStatus } from "../../../../typing";

const allStatuses: TaskStatus[] = [
  TaskStatus.PENDIENTE,
  TaskStatus.EN_PROGRESO,
  TaskStatus.EN_REVISION,
  TaskStatus.COMPLETADA,
  TaskStatus.CANCELADA,
];

const allPriorities: TaskPriority[] = [
  TaskPriority.URGENTE,
  TaskPriority.ALTA,
  TaskPriority.MEDIA,
  TaskPriority.BAJA,
];

interface TaskFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: "todos" | TaskStatus;
  selectedPriority: "todos" | TaskPriority;
  handleStatusClick: (filter: TaskStatus) => void;
  handlePriorityClick: (filter: TaskPriority) => void;
  projects: Project[];
  selectedProject: string;
  handleProjectClick: (filter: string) => void;
}

const TaskFilters = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  selectedPriority,
  handleStatusClick,
  handlePriorityClick,
  projects,
  selectedProject,
  handleProjectClick,
}: TaskFiltersProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-3">
      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Buscar</h4>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
          <Input
            placeholder="Buscar tareas..."
            className="pl-9 w-full text-blue-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Proyectos</h4>
        <Select value={selectedProject} onValueChange={handleProjectClick}>
          <SelectTrigger className="w-full text-blue-600 cursor-pointer">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Proyecto" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={5}
            className="bg-white border-blue-200"
          >
            <SelectItem
              value="todos"
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Todos
            </SelectItem>
            {projects.map((project) => (
              <SelectItem
                key={project.id}
                value={project.id}
                className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Estado</h4>
        <Select value={selectedStatus} onValueChange={handleStatusClick}>
          <SelectTrigger className="w-full text-blue-600 cursor-pointer">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={5}
            className="bg-white border-blue-200"
          >
            <SelectItem
              value="todos"
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Todos
            </SelectItem>
            {allStatuses.map((status) => (
              <SelectItem
                key={status}
                value={status}
                className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                {status.replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-2 w-full lg:w-auto">
        <h4 className="text-blue-600 text-sm font-medium">Prioridad</h4>
        <Select value={selectedPriority} onValueChange={handlePriorityClick}>
          <SelectTrigger className="w-full text-blue-600 cursor-pointer">
            <AlertCircle className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent
            position="popper"
            align="start"
            sideOffset={5}
            className="bg-white border-blue-200"
          >
            <SelectItem
              value="todos"
              className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
            >
              Todas
            </SelectItem>
            {allPriorities.map((priority) => (
              <SelectItem
                key={priority}
                value={priority}
                className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer"
              >
                {" "}
                {priority}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TaskFilters;
