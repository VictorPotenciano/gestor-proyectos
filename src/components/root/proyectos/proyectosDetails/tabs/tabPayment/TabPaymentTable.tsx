import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, Euro, Trash2 } from "lucide-react";
import { Payment, Project } from "../../../../../../../typing";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import { deletePayment } from "@/lib/paymentapi";
import { useActivityLogs } from "@/context/ActivityLogContext";

type Column = {
  header: string;
  accessorKey: string;
};

interface TabPaymentTableProps {
  project: Project;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  loadProject: (
    actPage: number,
    tskPage: number,
    cmtPage: number,
    showLoader?: boolean
  ) => void;
  activitiesPage: number;
  tasksPage: number;
  commentsPage: number;
}

const TabPaymentTable = ({
  project,
  error,
  setError,
  loadProject,
  activitiesPage,
  tasksPage,
  commentsPage,
}: TabPaymentTableProps) => {
  const { refreshLogs } = useActivityLogs();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const isOwner = project.ownerId === userId;

  const columns: Column[] = [
    { header: "Concepto", accessorKey: "description" },
    { header: "Monto", accessorKey: "amount" },
    { header: "Fecha", accessorKey: "paymentDate" },
    ...(isOwner ? [{ header: "", accessorKey: "actions" }] : []),
  ];

  const handleDeletePayment = async (payment: Payment) => {
    try {
      const result = await Swal.fire({
        title: "¿Estas seguro?",
        text: `Vas a eliminar un pago.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, eliminalo",
        cancelButtonText: "No, cancela",
        reverseButtons: true,
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-custom-button",
          cancelButton: "swal-custom-button-cancel",
        },
      });
      if (result.isConfirmed) {
        await deletePayment(payment.id);
        loadProject(activitiesPage, tasksPage, commentsPage);
        await refreshLogs();
        Swal.fire({
          title: "Eliminado!",
          text: "El pago ha sido eliminado con exito.",
          icon: "success",
          buttonsStyling: false,
          customClass: {
            confirmButton: "swal-custom-button",
          },
          confirmButtonText: "Aceptar",
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error inesperado al eliminar";
      setError(errorMessage);
    }
  };

  return (
    <div className="overflow-x-auto">
      {error && (
        <Alert
          variant="destructive"
          className="bg-red-50 border-red-200 text-red-800"
        >
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}
      <Table>
        <TableHeader>
          <TableRow className="bg-linear-to-r from-blue-50 to-blue-100/50 border-b-2 border-blue-200 hover:bg-linear-to-r hover:from-blue-50 hover:to-blue-100/50">
            {columns.map((col) => (
              <TableHead
                key={col.accessorKey}
                className="text-blue-900 font-semibold text-center"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {!project.payments || project.payments.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-16 px-4"
              >
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Euro className="h-10 w-10 text-blue-600" />
                </div>
                <p className="text-gray-600 font-medium">
                  No hay pagos registrados en este proyecto
                </p>
              </TableCell>
            </TableRow>
          ) : (
            project.payments?.map((payment, index) => (
              <TableRow
                key={payment.id}
                className={`hover:bg-slate-50 transition-all duration-150 border-b border-gray-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                }`}
              >
                <TableCell className="font-medium text-gray-900 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <span className="line-clamp-2">{payment.description}</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="font-bold text-emerald-600 text-lg">
                      {payment.amount.toLocaleString("es-ES", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-emerald-600 font-semibold">€</span>
                  </div>
                </TableCell>
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium">
                      {new Date(payment.paymentDate).toLocaleDateString(
                        "es-ES",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </TableCell>
                {isOwner && (
                  <TableCell className="py-4 text-center">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePayment(payment);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors gap-2 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TabPaymentTable;
