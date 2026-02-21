import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatItem } from "../../../typing";

interface StatsCardsProps {
  stats: StatItem[];
  className?: string;
}

const StatsCards = ({ stats, className = "" }: StatsCardsProps) => {
  if (!stats || stats.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No hay estadísticas para mostrar
      </div>
    );
  }

  // Definimos las columnas según la cantidad de cards (máximo 4 en desktop)
  const getGridCols = () => {
    if (stats.length === 1) return "grid-cols-1";
    if (stats.length === 2) return "grid-cols-1 sm:grid-cols-2";
    if (stats.length === 3) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
    return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  };

  return (
    <div className={`grid gap-4 ${getGridCols()} ${className}`}>
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="bg-white border border-blue-600 shadow-sm transition-all hover:shadow-md"
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              {stat.title}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/10">
              <stat.icon className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stat.value}
            </div>
            <p className="text-xs text-blue-500 mt-1">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
export default StatsCards;
