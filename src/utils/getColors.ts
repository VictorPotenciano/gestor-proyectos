import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock,
  CreditCard,
  Edit,
  FolderEdit,
  FolderPlus,
  FolderX,
  ListPlus,
  LucideIcon,
  MessageSquare,
  MessageSquareOff,
  SquareX,
  Tag,
  UserMinus,
  UserPlus,
  Ban,
  PauseCircle,
  PlayCircle,
  Eye,
} from "lucide-react";
import { ActivityType } from "../../typing";

export const statusConfig = {
  EN_PROCESO: { label: "En Proceso", color: "bg-blue-100 text-blue-800" },
  COMPLETADO: { label: "Completado", color: "bg-emerald-100 text-emerald-800" },
  PAUSADO: { label: "Pausado", color: "bg-gray-100 text-gray-700" },
  CANCELADO: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

export const paymentConfig = {
  PAGADO: {
    label: "Pagado",
    color:
      "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200",
  },
  A_PLAZOS: {
    label: "A Plazos",
    color: "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200",
  },
  NO_PAGADO: {
    label: "No Pagado",
    color: "bg-red-100 text-red-800 border-red-300 hover:bg-red-200",
  },
};

export const taskStatusConfig = {
  PENDIENTE: {
    label: "Pendiente",
    className: "text-yellow-500",
    icon: Circle,
  },
  EN_PROGRESO: {
    label: "En Progreso",
    className: "text-blue-500",
    icon: Clock,
  },
  EN_REVISION: {
    label: "En Revisión",
    className: "text-amber-500",
    icon: AlertCircle,
  },
  COMPLETADA: {
    label: "Completada",
    className: "text-green-500",
    icon: CheckCircle2,
  },
  CANCELADA: {
    label: "Cancelada",
    className: "text-red-500",
    icon: AlertCircle,
  },
} as const;

export const priorityConfig = {
  BAJA: {
    label: "Baja",
    className: "border-slate-300 text-slate-700 bg-slate-50",
  },
  MEDIA: {
    label: "Media",
    className: "border-blue-300 text-blue-700 bg-blue-50",
  },
  ALTA: {
    label: "Alta",
    className: "border-orange-300 text-orange-700 bg-orange-50",
  },
  URGENTE: {
    label: "Urgente",
    className: "border-red-300 text-red-700 bg-red-50",
  },
} as const;

// Función helper para obtener el icono según el tipo de actividad
export const getActivityIcon = (type: ActivityType): LucideIcon => {
  const iconMap: Record<ActivityType, LucideIcon> = {
    // Proyecto
    [ActivityType.PROJECT_CREATED]: FolderPlus,
    [ActivityType.PROJECT_UPDATED]: FolderEdit,
    [ActivityType.PROJECT_COMPLETE]: CheckCircle2,
    [ActivityType.PROJECT_REMOVED]: FolderX,
    [ActivityType.PROJECT_CANCEL]: Ban,
    [ActivityType.PROJECT_PAUSE]: PauseCircle,
    [ActivityType.PROJECT_IN_PROGRESS]: PlayCircle,

    // Estados de pago
    [ActivityType.PAYMENT_STATUS_NOT_PAID]: CreditCard,
    [ActivityType.PAYMENT_STATUS_PAID]: CreditCard,
    [ActivityType.PAYMENT_STATUS_IN_INSTALLMENTS]: CreditCard,

    // Miembros
    [ActivityType.MEMBER_ADDED]: UserPlus,
    [ActivityType.MEMBER_REMOVED]: UserMinus,

    // Tareas 
    [ActivityType.TASK_CREATED]: ListPlus,
    [ActivityType.TASK_UPDATED]: Edit,
    [ActivityType.TASK_COMPLETED]: CheckCircle2,
    [ActivityType.TASK_REMOVED]: SquareX,

    // Estados de tarea
    [ActivityType.TASK_STATUS_PENDING]: Clock,
    [ActivityType.TASK_STATUS_IN_PROGRESS]: PlayCircle,
    [ActivityType.TASK_STATUS_REVIEW]: Eye,
    [ActivityType.TASK_STATUS_COMPLETED]: CheckCircle2,
    [ActivityType.TASK_STATUS_CANCEL]: Ban,

    // Prioridades de tarea
    [ActivityType.TASK_PRIORITY_LOW]: Tag,
    [ActivityType.TASK_PRIORITY_MEDIUM]: Tag,
    [ActivityType.TASK_PRIORITY_HIGH]: Tag,
    [ActivityType.TASK_PRIORITY_URGENT]: AlertCircle,

    // Comentarios
    [ActivityType.COMMENT_ADDED]: MessageSquare,
    [ActivityType.COMMENT_UPDATED]: Edit,
    [ActivityType.COMMENT_REMOVED]: MessageSquareOff,

    // Pagos 
    [ActivityType.PAYMENT_ADDED]: CreditCard,
    [ActivityType.PAYMENT_UPDATED]: CreditCard,
    [ActivityType.PAYMENT_REMOVED]: CreditCard,
  };

  return iconMap[type] || MessageSquare;
};

// Función helper para obtener los estilos según el tipo de actividad
export const getActivityStyles = (type: ActivityType) => {
  const styleMap: Record<ActivityType, { iconColor: string; iconBg: string }> =
    {
      // Proyecto - Operaciones CRUD
      [ActivityType.PROJECT_CREATED]: {
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      [ActivityType.PROJECT_UPDATED]: {
        iconColor: "text-slate-700",
        iconBg: "bg-slate-200",
      },
      [ActivityType.PROJECT_COMPLETE]: {
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      [ActivityType.PROJECT_REMOVED]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },
      [ActivityType.PROJECT_CANCEL]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },
      [ActivityType.PROJECT_PAUSE]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      [ActivityType.PROJECT_IN_PROGRESS]: {
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },

      // Estados de pago
      [ActivityType.PAYMENT_STATUS_NOT_PAID]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },
      [ActivityType.PAYMENT_STATUS_PAID]: {
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      [ActivityType.PAYMENT_STATUS_IN_INSTALLMENTS]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },

      // Miembros
      [ActivityType.MEMBER_ADDED]: {
        iconColor: "text-purple-600",
        iconBg: "bg-purple-100",
      },
      [ActivityType.MEMBER_REMOVED]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },

      // Tareas - Operaciones CRUD
      [ActivityType.TASK_CREATED]: {
        iconColor: "text-indigo-600",
        iconBg: "bg-indigo-100",
      },
      [ActivityType.TASK_UPDATED]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      [ActivityType.TASK_COMPLETED]: {
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      [ActivityType.TASK_REMOVED]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },

      // Estados de tarea
      [ActivityType.TASK_STATUS_PENDING]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      [ActivityType.TASK_STATUS_IN_PROGRESS]: {
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      [ActivityType.TASK_STATUS_REVIEW]: {
        iconColor: "text-cyan-600",
        iconBg: "bg-cyan-100",
      },
      [ActivityType.TASK_STATUS_COMPLETED]: {
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      [ActivityType.TASK_STATUS_CANCEL]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },

      // Prioridades de tarea
      [ActivityType.TASK_PRIORITY_LOW]: {
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
      },
      [ActivityType.TASK_PRIORITY_MEDIUM]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      [ActivityType.TASK_PRIORITY_HIGH]: {
        iconColor: "text-orange-600",
        iconBg: "bg-orange-100",
      },
      [ActivityType.TASK_PRIORITY_URGENT]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },

      // Comentarios
      [ActivityType.COMMENT_ADDED]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      [ActivityType.COMMENT_UPDATED]: {
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
      },
      [ActivityType.COMMENT_REMOVED]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },

      // Pagos - Operaciones CRUD
      [ActivityType.PAYMENT_ADDED]: {
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      [ActivityType.PAYMENT_UPDATED]: {
        iconColor: "text-cyan-600",
        iconBg: "bg-cyan-100",
      },
      [ActivityType.PAYMENT_REMOVED]: {
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
      },
    };

  return (
    styleMap[type] || {
      iconColor: "text-gray-600",
      iconBg: "bg-gray-100",
    }
  );
};

export const getRelativeTime = (date: Date | string) => {
  const now = new Date();
  const activityDate = new Date(date);
  const diffInMs = now.getTime() - activityDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} min`;
  } else if (diffInHours < 24) {
    return `Hace ${diffInHours} hora${diffInHours > 1 ? "s" : ""}`;
  } else if (diffInDays === 1) {
    return "Ayer";
  } else if (diffInDays < 7) {
    return `Hace ${diffInDays} días`;
  } else {
    return activityDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  }
};
