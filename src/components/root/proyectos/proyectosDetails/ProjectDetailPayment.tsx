import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Euro, TrendingUp } from "lucide-react";
import { Project } from "../../../../../typing";

interface ProjectDetailPaymentProps {
  project: Project;
}

const ProjectDetailPayment = ({ project }: ProjectDetailPaymentProps) => {
  const paymentProgress =
    project.totalAmount > 0
      ? (project.paidAmount / project.totalAmount) * 100
      : 0;
  return (
    <Card className="border-blue-600 shadow-lg rounded-xl overflow-hidden bg-linear-to-br from-white to-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-blue-700 shadow-md shadow-blue-200">
            <Euro className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-600">Pagos Recibidos</p>
            <p className="text-xl font-bold text-gray-900">
              {project.paidAmount.toLocaleString("es-ES")}€
            </p>
            <p className="text-xs text-gray-500">
              de {project.totalAmount.toLocaleString("es-ES")}€
            </p>
          </div>
        </div>
        <Progress
          value={paymentProgress}
          className={`h-2.5 bg-blue-100 [&>div]:transition-all ${
            paymentProgress >= 90
              ? "[&>div]:bg-blue-600"
              : paymentProgress < 30
                ? "[&>div]:bg-blue-300"
                : "[&>div]:bg-blue-500"
          }`}
        />{" "}
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600 font-medium">
            {paymentProgress.toFixed(0)}% cobrado
          </p>
          <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetailPayment;
