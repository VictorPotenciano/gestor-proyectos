import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { Task, TaskStatus } from "../../../../../typing";

interface ProjectDetailTaskProps {
  allTasks: Task[];
}

const ProjectDetailTask = ({ allTasks }: ProjectDetailTaskProps) => {
  const tasksCompleted =
    allTasks.filter((t) => t.status === TaskStatus.COMPLETADA).length || 0;
  const tasksTotal = allTasks.length;
  const taskProgress = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  return (
    <Card className="border-blue-600 shadow-lg rounded-xl overflow-hidden bg-linear-to-br from-white to-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-green-500 to-green-600 shadow-md shadow-green-200">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">
              Tareas Completadas
            </p>
            <p className="text-xl font-bold text-gray-900">
              {tasksCompleted} / {tasksTotal}
            </p>
            <p className="text-xs text-gray-500">
              {tasksTotal - tasksCompleted} pendientes
            </p>
          </div>
        </div>
        <Progress
          value={taskProgress}
          className={`h-2 bg-green-100 [&>div]:transition-all ${
            taskProgress >= 90
              ? "[&>div]:bg-green-600"
              : taskProgress < 30
                ? "[&>div]:bg-green-300"
                : "[&>div]:bg-green-500"
          }`}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600 font-medium">
            {taskProgress.toFixed(0)}% completado
          </p>
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailTask;
