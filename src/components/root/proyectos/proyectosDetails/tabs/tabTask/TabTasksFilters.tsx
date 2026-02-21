import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Task, TaskPriority, TaskStatus } from "../../../../../../../typing";

const allStatuses: TaskStatus[] = [
  TaskStatus.PENDIENTE,
  TaskStatus.EN_PROGRESO,
  TaskStatus.EN_REVISION,
  TaskStatus.COMPLETADA,
  TaskStatus.CANCELADA,
];

const allPriorities: TaskPriority[] = [
  TaskPriority.BAJA,
  TaskPriority.MEDIA,
  TaskPriority.ALTA,
  TaskPriority.URGENTE,
];

interface TabTasksFiltersProps {
  statusFilter: string;
  priorityFilter: string;
  handleStatusFilterChange: (value: string) => void;
  handlePriorityFilterChange: (value: string) => void;
  hasActiveFilters: boolean;
  filteredTasks: Task[];
  allTasks: Task[];
  paginatedTasks: Task[];
}

const TabTasksFilters = ({
  statusFilter,
  priorityFilter,
  handleStatusFilterChange,
  handlePriorityFilterChange,
  hasActiveFilters,
  filteredTasks,
  allTasks,
  paginatedTasks,
}: TabTasksFiltersProps) => {
  return (
    <div className="px-4 sm:px-6 py-4 bg-blue-50/30 border-b border-blue-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex flex-col lg:flex-row xs:items-center gap-4 sm:gap-6 w-full sm:w-auto">
          {/* Filtro estado */}
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-blue-700 text-sm font-medium whitespace-nowrap">
              Estado:
            </h4>
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
              <SelectTrigger className="w-full min-w-35 sm:w-48 text-blue-700 border-blue-200 focus:ring-blue-400">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                sideOffset={6}
                className="bg-white border-blue-200 max-h-80"
              >
                <SelectItem
                  value="todos"
                  className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
                >
                  Todos
                </SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {status.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro prioridad */}
          <div className="flex items-center gap-2 min-w-0">
            <h4 className="text-blue-700 text-sm font-medium whitespace-nowrap">
              Prioridad:
            </h4>
            <Select
              value={priorityFilter}
              onValueChange={handlePriorityFilterChange}
            >
              <SelectTrigger className="w-full min-w-35 sm:w-48 text-blue-700 border-blue-200 focus:ring-blue-400">
                <SelectValue placeholder="Todas las prioridades" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="start"
                sideOffset={6}
                className="bg-white border-blue-200 max-h-80"
              >
                <SelectItem
                  value="todos"
                  className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
                >
                  Todas
                </SelectItem>
                {allPriorities.map((priority) => (
                  <SelectItem
                    key={priority}
                    value={priority}
                    className="text-blue-900 hover:bg-blue-50 focus:bg-blue-50"
                  >
                    {priority}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Info */}
        <div className="text-sm text-gray-600 font-medium sm:ml-auto text-left sm:text-right">
          {hasActiveFilters ? (
            <>
              <span className="font-semibold text-blue-700">
                {filteredTasks.length}
              </span>{" "}
              tareas filtradas de{" "}
              <span className="font-semibold">{allTasks.length}</span> totales
            </>
          ) : (
            <>
              Mostrando{" "}
              <span className="font-semibold text-blue-700">
                {paginatedTasks.length}
              </span>{" "}
              de <span className="font-semibold">{allTasks.length}</span> tareas
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabTasksFilters;
