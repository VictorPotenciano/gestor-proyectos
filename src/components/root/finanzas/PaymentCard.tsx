import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Project } from "../../../../typing";
import { cn } from "@/lib/utils";
import { paymentConfig, statusConfig } from "@/utils/getColors";

interface PaymentCardProps {
  project: Project;
  handleClickProject: (projectId: string) => void;
}

const PaymentCard = ({ project, handleClickProject }: PaymentCardProps) => {
  const payment =
    paymentConfig[project.paymentStatus as keyof typeof paymentConfig];
  const status = statusConfig[project.status as keyof typeof statusConfig];
  const paymentProgress = (project.paidAmount / project.totalAmount) * 100;

  return (
    <div
      onClick={() => handleClickProject(project.id)}
      className="p-3 sm:p-4 rounded-lg border border-blue-100 bg-blue-50/30 hover:bg-blue-50 transition-colors cursor-pointer"
    >
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-3">
        <div className="flex-1 min-w-0">
          {/* Nombre + badge estado */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-blue-900 truncate">
              {project.name}
            </p>
            <Badge
              variant="outline"
              className={`font-normal px-2.5 py-0.5 whitespace-nowrap ${status.color}`}
            >
              {project.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-blue-600 truncate">
            {project.customer?.name}
          </p>
        </div>

        {/* Badge pago: alineado a la derecha en móvil también */}
        <div className="flex justify-end sm:justify-start">
          <Badge
            variant="outline"
            className={`font-normal px-2.5 py-0.5 whitespace-nowrap ${payment.color}`}
          >
            {payment.label}
          </Badge>
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm gap-2">
          <span className="text-blue-900 font-medium whitespace-nowrap">
            {paymentProgress.toFixed(0)}% pagado
          </span>
          <span className="text-blue-600 font-medium text-right">
            {project.paidAmount.toLocaleString("es-ES")}€ /{" "}
            {project.totalAmount.toLocaleString("es-ES")}€
          </span>
        </div>
        <Progress
          value={paymentProgress}
          className={cn(
            "h-2.5 bg-blue-100 [&>div]:transition-all",
            paymentProgress >= 90 && "[&>div]:bg-blue-600",
            paymentProgress < 30 && "[&>div]:bg-blue-300",
            paymentProgress >= 30 &&
              paymentProgress < 90 &&
              "[&>div]:bg-blue-500"
          )}
        />
      </div>
    </div>
  );
};

export default PaymentCard;
