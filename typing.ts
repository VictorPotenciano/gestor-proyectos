import { LucideIcon } from "lucide-react";
import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name: string;
    email: string;
    role: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  ownedProjects?: {
    id: string;
    name: string;
    status: ProjectStatus;
  }[];
  projectMemberships?: {
    project: {
      id: string;
      name: string;
      status: ProjectStatus;
    };
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export const enum ProjectStatus {
  EN_PROCESO = "EN_PROCESO",
  COMPLETADO = "COMPLETADO",
  CANCELADO = "CANCELADO",
  PAUSADO = "PAUSADO",
}

export const enum PaymentStatus {
  NO_PAGADO = "NO_PAGADO",
  A_PLAZOS = "A_PLAZOS",
  PAGADO = "PAGADO",
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  status: ProjectStatus;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: PaymentStatus;
  startDate?: Date | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  ownerId: string;
  customerId?: string | null;
  customer?: Customer | null;
  members?: ProjectMember[];
  tasks?: Task[];
  payments?: Payment[];
  comments?: Note[];
  activities?: ActivityLog[];
  owner: User;
  pagination?: {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user: User;
  invitedAt: Date;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  projectId: string;
  project: Project;
  assignees?: TaskAssignment[];
  dueDate?: Date | null;
  completedAt?: Date | null;
  createdAt: Date;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
}

export const enum TaskStatus {
  PENDIENTE = "PENDIENTE",
  EN_PROGRESO = "EN_PROGRESO",
  EN_REVISION = "EN_REVISION",
  COMPLETADA = "COMPLETADA",
  CANCELADA = "CANCELADA",
}

export const enum TaskPriority {
  BAJA = "BAJA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE",
}

export interface Note {
  id: string;
  content: string;
  projectId: string;
  project: Project;
  authorId: string;
  author: User;
  createdAt: Date;
}

export interface Payment {
  id: string;
  amount: number;
  description: string;
  projectId: string;
  project: Project;
  paymentDate: Date;
  reference?: string;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  projects: Project[];
  projectCount: number;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  type: ActivityType;
  projectId: string;
  project: Project;
  userId: string;
  user: User;
  metadata?:
    | {
        userId?: string;
        userName?: string | null;
        joinedAt?: Date | string;
      }
    | Record<string, unknown>
    | null;

  createdAt: Date;
}

export enum ActivityType {
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_COMPLETE = "PROJECT_COMPLETE",
  PROJECT_REMOVED = "PROJECT_REMOVED",
  PROJECT_CANCEL = "PROJECT_CANCEL",
  PROJECT_PAUSE = "PROJECT_PAUSE",
  PROJECT_IN_PROGRESS = "PROJECT_IN_PROGRESS",
  PAYMENT_STATUS_NOT_PAID = "PAYMENT_STATUS_NOT_PAID",
  PAYMENT_STATUS_PAID = "PAYMENT_STATUS_PAID",
  PAYMENT_STATUS_IN_INSTALLMENTS = "PAYMENT_STATUS_IN_INSTALLMENTS",
  MEMBER_ADDED = "MEMBER_ADDED",
  MEMBER_REMOVED = "MEMBER_REMOVED",
  TASK_CREATED = "TASK_CREATED",
  TASK_UPDATED = "TASK_UPDATED",
  TASK_COMPLETED = "TASK_COMPLETED",
  TASK_REMOVED = "TASK_REMOVED",
  TASK_STATUS_PENDING = "TASK_STATUS_PENDING",
  TASK_STATUS_IN_PROGRESS = "TASK_STATUS_IN_PROGRESS",
  TASK_STATUS_REVIEW = "TASK_STATUS_REVIEW",
  TASK_STATUS_COMPLETED = "TASK_STATUS_COMPLETED",
  TASK_STATUS_CANCEL = "TASK_STATUS_CANCEL",
  TASK_PRIORITY_LOW = "TASK_PRIORITY_LOW",
  TASK_PRIORITY_MEDIUM = "TASK_PRIORITY_MEDIUM",
  TASK_PRIORITY_HIGH = "TASK_PRIORITY_HIGH",
  TASK_PRIORITY_URGENT = "TASK_PRIORITY_URGENT",
  COMMENT_ADDED = "COMMENT_ADDED",
  COMMENT_UPDATED = "COMMENT_UPDATED",
  COMMENT_REMOVED = "COMMENT_REMOVED",
  PAYMENT_ADDED = "PAYMENT_ADDED",
  PAYMENT_UPDATED = "PAYMENT_UPDATED",
  PAYMENT_REMOVED = "PAYMENT_REMOVED",
}

export const ACTIVITY_DESCRIPTIONS: Record<ActivityType, string> = {
  [ActivityType.PROJECT_CREATED]: "creó el proyecto",
  [ActivityType.PROJECT_UPDATED]: "actualizó el proyecto",
  [ActivityType.PROJECT_COMPLETE]: "completó el proyecto",
  [ActivityType.PROJECT_REMOVED]: "eliminó el proyecto",
  [ActivityType.PROJECT_CANCEL]: "canceló el proyecto",
  [ActivityType.PROJECT_PAUSE]: "pausó el proyecto",
  [ActivityType.PROJECT_IN_PROGRESS]: "reanudó el proyecto",
  [ActivityType.PAYMENT_STATUS_NOT_PAID]: "estableció estado 'No pagado'",
  [ActivityType.PAYMENT_STATUS_PAID]: "estableció estado 'Pagado'",
  [ActivityType.PAYMENT_STATUS_IN_INSTALLMENTS]:
    "estableció estado 'En cuotas'",
  [ActivityType.MEMBER_ADDED]: "añadió un miembro al proyecto",
  [ActivityType.MEMBER_REMOVED]: "eliminó un miembro del proyecto",
  [ActivityType.TASK_CREATED]: "creó una tarea",
  [ActivityType.TASK_UPDATED]: "actualizó una tarea",
  [ActivityType.TASK_COMPLETED]: "completó una tarea",
  [ActivityType.TASK_REMOVED]: "eliminó una tarea",
  [ActivityType.TASK_STATUS_PENDING]: "estableció una tarea como 'Pendiente'",
  [ActivityType.TASK_STATUS_IN_PROGRESS]:
    "estableció una tarea como 'En progreso'",
  [ActivityType.TASK_STATUS_REVIEW]: "estableció una tarea como 'En revisión'",
  [ActivityType.TASK_STATUS_COMPLETED]:
    "estableció una tarea como 'Completada'",
  [ActivityType.TASK_STATUS_CANCEL]: "canceló una tarea",
  [ActivityType.TASK_PRIORITY_LOW]: "estableció una tarea con prioridad 'Baja'",
  [ActivityType.TASK_PRIORITY_MEDIUM]:
    "estableció una tarea con prioridad 'Media'",
  [ActivityType.TASK_PRIORITY_HIGH]:
    "estableció una tarea con prioridad 'Alta'",
  [ActivityType.TASK_PRIORITY_URGENT]:
    "estableció una tarea con prioridad 'Urgente'",
  [ActivityType.COMMENT_ADDED]: "añadió una nota.",
  [ActivityType.COMMENT_UPDATED]: "actualizó una nota.",
  [ActivityType.COMMENT_REMOVED]: "eliminó una nota.",
  [ActivityType.PAYMENT_ADDED]: "registró un pago",
  [ActivityType.PAYMENT_UPDATED]: "actualizó un pago",
  [ActivityType.PAYMENT_REMOVED]: "eliminó un pago",
};

export interface StatItem {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
}
