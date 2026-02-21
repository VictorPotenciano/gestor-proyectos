import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2 } from "lucide-react";
import { Project, Task } from "../../../../../../typing";
import ProjectDetailTabsTask from "./tabTask/ProjectDetailTabsTask";
import ProjectDetailTabsMembers from "./tabMembers/ProjectDetailTabsMembers";
import ProjectDetailTabsLogs from "./tabLogs/ProjectDetailTabsLogs";
import { useState } from "react";
import ProjectDetailTabsNotes from "./tabNotes/ProjectDetailTabsNotes";
import ProjectDetailTabsPayment from "./tabPayment/ProjectDetailTabsPayment";

interface ProjectDetailTabsProps {
  project: Project;
  pagination: {
    activities: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    tasks: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
    comments: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  onActivitiesPageChange: (page: number) => void;
  onTasksPageChange: (page: number) => void;
  onCommentsPageChange: (page: number) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
  isPending: boolean;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  allTasks: Task[];
  loadAllTasks: () => void;
}

const ProjectDetailTabs = ({
  project,
  pagination,
  onActivitiesPageChange,
  onTasksPageChange,
  onCommentsPageChange,
  activitiesPage,
  tasksPage,
  commentsPage,
  isPending,
  loadProject,
  allTasks,
  loadAllTasks,
}: ProjectDetailTabsProps) => {
  const [activeTab, setActiveTab] = useState("tareas");

  const tabs = [
    { value: "tareas", label: "Tareas" },
    { value: "pagos", label: "Pagos" },
    { value: "notas", label: "Notas" },
    { value: "miembros", label: "Miembros" },
    { value: "logs", label: "Logs" },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="pb-6 md:pb-0">
        <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full gap-2 p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="gap-2 bg-white shadow-md border border-blue-100 rounded-lg data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=inactive]:cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <ProjectDetailTabsTask
        project={project}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
        pagination={pagination.tasks}
        onPageChange={onTasksPageChange}
        isPending={isPending}
        allTasks={allTasks}
        loadAllTasks={loadAllTasks}
      />

      <ProjectDetailTabsPayment
        project={project}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
      />

      <ProjectDetailTabsNotes
        project={project}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
        pagination={pagination.comments}
        onPageChange={onCommentsPageChange}
        isPending={isPending}
      />

      <ProjectDetailTabsMembers
        project={project}
        loadProject={() => loadProject(activitiesPage, tasksPage, commentsPage)}
        activitiesPage={activitiesPage}
        tasksPage={tasksPage}
        commentsPage={commentsPage}
      />

      <ProjectDetailTabsLogs
        project={project}
        pagination={pagination.activities}
        onPageChange={onActivitiesPageChange}
        currentPage={activitiesPage}
        isPending={isPending}
      />
    </Tabs>
  );
};

export default ProjectDetailTabs;
