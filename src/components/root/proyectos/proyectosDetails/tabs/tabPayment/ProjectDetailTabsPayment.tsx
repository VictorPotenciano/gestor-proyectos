import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Project } from "../../../../../../../typing";
import { CreditCard, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import TabPaymentDialog from "./TabPaymentDialog";
import { useState } from "react";
import TabPaymentTable from "./TabPaymentTable";

interface ProjectDetailTabsPaymentProps {
  project: Project;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  tasksPage: number;
  commentsPage: number;
  activitiesPage: number;
}

const ProjectDetailTabsPayment = ({
  project,
  loadProject,
  tasksPage,
  commentsPage,
  activitiesPage,
}: ProjectDetailTabsPaymentProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handlePaymentSuccess = () => {
    loadProject(activitiesPage, tasksPage, commentsPage);
  };

  const totalAmount = project.totalAmount;
  const totalPaid =
    project.payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

  const isCancel = project.status === "CANCELADO";
  const isCompleted = project.status === "COMPLETADO";
  return (
    <TabsContent value="pagos">
      <Card className="border-blue-600 shadow-lg rounded-2xl overflow-hidden p-0">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 bg-linear-to-r from-blue-50 to-white border-b border-blue-100 px-5 py-5 md:py-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <CardTitle className="text-xl md:text-2xl text-blue-700 font-semibold flex items-center gap-2.5 flex-wrap">
              <CreditCard className="h-5 w-5 md:h-6 md:w-6 shrink-0" />
              Historial de Pagos
            </CardTitle>
            <p className="text-sm text-gray-600 md:text-base">
              Registro de pagos, presupuestos y transacciones del proyecto
            </p>
          </div>
          {totalPaid < totalAmount && !isCompleted && !isCancel && (
            <Button
              onClick={() => setDialogOpen(true)}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm whitespace-nowrap shrink-0 w-full sm:w-auto cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Registrar Pago
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <TabPaymentTable
            project={project}
            error={error}
            setError={setError}
            loadProject={loadProject}
            activitiesPage={activitiesPage}
            tasksPage={tasksPage}
            commentsPage={commentsPage}
          />
        </CardContent>
      </Card>
      <TabPaymentDialog
        mode="single-project"
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handlePaymentSuccess}
        error={error}
        setError={setError}
        projectId={project.id}
        totalAmount={totalAmount}
        totalPaid={totalPaid}
      />
    </TabsContent>
  );
};

export default ProjectDetailTabsPayment;
