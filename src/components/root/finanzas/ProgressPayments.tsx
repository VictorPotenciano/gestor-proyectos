import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ProgressPaymentsProps {
  totalPaid: number;
  totalGeneral: number;
  percentageCharged: number;
}

const ProgressPayments = ({
  totalPaid,
  totalGeneral,
  percentageCharged,
}: ProgressPaymentsProps) => {
  return (
    <Card className="bg-white border border-blue-600 shadow-sm transition-all hover:shadow-md mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <p className="text-sm text-blue-600">Progreso de cobros</p>
            <p className="text-lg font-semibold text-blue-600">
              {totalPaid}€ de {totalGeneral}€
            </p>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-600/10 text-blue-600 w-fit"
          >
            {percentageCharged.toFixed(1)}% cobrado
          </Badge>
        </div>
        <Progress
          value={percentageCharged}
          className="h-3 md:h-4 bg-blue-100 [&>div]:bg-blue-600 rounded-full overflow-hidden"
        />{" "}
      </CardContent>
    </Card>
  );
};

export default ProgressPayments;
