import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import { Project } from "../../../../../typing";

interface ProjectHeaderProps {
  project: Project;
}

const ProjectDetailHeader = ({ project }: ProjectHeaderProps) => {
  return (
    <div className="bg-white border border-blue-600 rounded-2xl shadow-xl p-8 text-blue-600">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{project.name}</h1>
          <div className="flex items-center gap-2 text-blue-400">
            <Users className="h-4 w-4" />
            <p className="text-lg">
              {project.customer?.name || "Sin cliente asignado"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer w-full"
          >
            <Link href="/proyectos" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailHeader;
