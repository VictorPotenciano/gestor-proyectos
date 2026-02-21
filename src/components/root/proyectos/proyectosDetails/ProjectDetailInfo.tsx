import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Users,
} from "lucide-react";
import { Project } from "../../../../../typing";
import { paymentConfig, statusConfig } from "@/utils/getColors";

interface ProjectInfoProps {
  project: Project;
  onEditClick?: () => void;
}

const ProjectDetailInfo = ({ project, onEditClick }: ProjectInfoProps) => {
  const status = statusConfig[project.status as keyof typeof statusConfig];
  const paymentStatus =
    paymentConfig[project.paymentStatus as keyof typeof paymentConfig];
  return (
    <Card className="lg:col-span-3 border-blue-600 shadow-lg rounded-2xl overflow-hidden bg-white p-0">
      <CardHeader className="bg-linear-to-r from-blue-50 to-white border-b border-blue-100 pt-6 pb-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Información del Proyecto
          </CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm shadow-blue-200 cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Editar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {project.description || "Sin descripción"}
        </p>
        <Separator className="bg-blue-100" />

        {/* Status y Payment Status */}
        <div className="grid gap-3 sm:grid-cols-2 mb-3">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-2">
              Estado del Proyecto
            </p>
            <Badge className={`${status.color} px-3 py-1`}>
              {status.label}
            </Badge>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-2">
              Estado de Pago
            </p>
            <Badge className={`${paymentStatus.color} px-3 py-1`}>
              {paymentStatus.label}
            </Badge>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Cliente
            </p>
            <p className="font-semibold text-gray-900 text-sm mb-0.5">
              {project.customer?.name || "Sin cliente asignado"}
            </p>
            <p className="text-xs text-gray-600">
              {project.customer?.email || "Sin email"}
            </p>
            <p className="text-xs text-gray-600">
              {project.customer?.phone || "Sin teléfono"}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
            <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Fechas
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                <Clock className="h-3 w-3 text-blue-600" />
                <span className="font-medium">Inicio:</span>
                <span>
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString("es-ES")
                    : new Date(project.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-700">
                <Calendar className="h-3 w-3 text-blue-600" />
                <span className="font-medium">Entrega:</span>
                <span>
                  {project.dueDate
                    ? new Date(project.dueDate).toLocaleDateString("es-ES")
                    : "Sin fecha"}
                </span>
              </div>
              {project.completedAt && (
                <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 p-1.5 rounded-lg -mx-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span className="font-medium">Completado:</span>
                  <span>
                    {new Date(project.completedAt).toLocaleDateString("es-ES")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailInfo;
