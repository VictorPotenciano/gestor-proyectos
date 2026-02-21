import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const currentUserId = session.user.id;

    // Obtener todas las membresías actuales
    const currentMemberships = await prisma.projectMember.findMany({
      where: { userId: currentUserId },
      select: { projectId: true, joinedAt: true },
    });

    const projectIds = currentMemberships.map((m) => m.projectId);

    // Obtener logs donde el usuario es el afectado (MEMBER_REMOVED o MEMBER_ADDED)
    const memberSpecificLogs = await prisma.activityLog.findMany({
      where: {
        isDeleted: false,
        OR: [
          {
            type: "MEMBER_REMOVED",
            metadata: {
              path: ["userId"],
              equals: currentUserId,
            },
          },
          {
            type: "MEMBER_ADDED",
            metadata: {
              path: ["userId"],
              equals: currentUserId,
            },
          },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        project: {
          select: { id: true, name: true, ownerId: true, isDeleted: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Construir períodos de membresía por proyecto
    type MembershipPeriod = { start: Date; end: Date | null };
    const membershipPeriods = new Map<string, MembershipPeriod[]>();

    memberSpecificLogs.forEach((log) => {
      if (!membershipPeriods.has(log.projectId)) {
        membershipPeriods.set(log.projectId, []);
      }
      const periods = membershipPeriods.get(log.projectId)!;

      if (log.type === "MEMBER_ADDED") {
        // Iniciar un nuevo período
        periods.push({ start: log.createdAt, end: null });
      } else if (log.type === "MEMBER_REMOVED") {
        // Cerrar el último período abierto
        const lastPeriod = periods[periods.length - 1];
        if (lastPeriod && lastPeriod.end === null) {
          lastPeriod.end = log.createdAt;
        }
      }
    });

    // Los proyectos donde es miembro actual deben tener un período abierto
    currentMemberships.forEach((membership) => {
      if (!membershipPeriods.has(membership.projectId)) {
        membershipPeriods.set(membership.projectId, [
          { start: membership.joinedAt, end: null },
        ]);
      } else {
        const periods = membershipPeriods.get(membership.projectId)!;
        const hasOpenPeriod = periods.some((p) => p.end === null);
        if (!hasOpenPeriod) {
          periods.push({ start: membership.joinedAt, end: null });
        }
      }
    });

    const memberRemovedProjectIds = memberSpecificLogs
      .filter((l) => l.type === "MEMBER_REMOVED")
      .map((l) => l.projectId);

    // Obtener logs de proyectos donde el usuario es owner O fue/es miembro
    // O logs donde el usuario es directamente el afectado
    const logs = await prisma.activityLog.findMany({
      where: {
        isDeleted: false,
        OR: [
          { project: { ownerId: currentUserId } },
          { projectId: { in: projectIds } },
          { userId: currentUserId },
        ],
      },
      include: {
        user: { select: { id: true, name: true } },
        project: {
          select: { id: true, name: true, ownerId: true, isDeleted: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    // Combinar todos los logs
    const allLogs = [...logs, ...memberSpecificLogs];

    // Función para verificar si un log está dentro de algún período de membresía
    const isWithinMembershipPeriod = (
      projectId: string,
      logDate: Date
    ): boolean => {
      const periods = membershipPeriods.get(projectId);
      if (!periods) return false;

      return periods.some((period) => {
        const afterStart = logDate >= period.start;
        const beforeEnd = period.end === null || logDate <= period.end;
        return afterStart && beforeEnd;
      });
    };

    // Filtrar logs
    const allowedLogs = allLogs.filter((log) => {
      // Si el log es de PROJECT_REMOVED y fue creado para este usuario, mostrarlo
      if (log.type === "PROJECT_REMOVED" && log.userId === currentUserId) {
        return true;
      }

      // Si el proyecto está eliminado, no mostrar otros logs que no sean PROJECT_REMOVED
      if (log.project.isDeleted) {
        return false;
      }

      // Si es owner, puede ver todos los logs del proyecto (excepto PROJECT_REMOVED de otros)
      if (log.project.ownerId === currentUserId) {
        // Si es PROJECT_REMOVED, solo mostrar el suyo
        if (log.type === "PROJECT_REMOVED") {
          return log.userId === currentUserId;
        }
        return true;
      }

      // Si es un log de MEMBER_REMOVED y el usuario es el afectado, puede verlo
      if (log.type === "MEMBER_REMOVED" && log.metadata) {
        if (
          typeof log.metadata === "object" &&
          log.metadata !== null &&
          "userId" in log.metadata &&
          log.metadata.userId === currentUserId
        ) {
          return true;
        }
      }

      // Si es un log de MEMBER_ADDED y el usuario es el afectado
      if (log.type === "MEMBER_ADDED" && log.metadata) {
        if (
          typeof log.metadata === "object" &&
          log.metadata !== null &&
          "userId" in log.metadata &&
          log.metadata.userId === currentUserId
        ) {
          // Solo permitir ver MEMBER_ADDED si:
          // Es miembro actual del proyecto, O
          // Nunca fue removido de este proyecto
          const isCurrentMember = projectIds.includes(log.projectId);
          const wasRemovedFromProject = memberRemovedProjectIds.includes(
            log.projectId
          );

          // Si es miembro actual, puede ver todos los MEMBER_ADDED
          if (isCurrentMember) {
            return true;
          }

          // Si NO es miembro actual pero fue removido, NO mostrar MEMBER_ADDED aquí
          if (wasRemovedFromProject) {
            return false;
          }

          return true;
        }
      }

      // Para miembros: verificar si el log está dentro de algún período de membresía
      const periods = membershipPeriods.get(log.projectId);
      if (!periods || periods.length === 0) return false;

      // Los logs MEMBER_ADDED solo se pueden ver si el usuario es miembro actual
      // Y ocurrieron después de su último MEMBER_ADDED (período actual)
      if (log.type === "MEMBER_ADDED") {
        const isCurrentMember = projectIds.includes(log.projectId);
        if (!isCurrentMember) {
          return false;
        }

        // Obtener el último período (el actual)
        const currentPeriod = periods[periods.length - 1];
        if (!currentPeriod || currentPeriod.end !== null) {
          return false;
        }

        // Solo mostrar MEMBER_ADDED que ocurrieron después del inicio del período actual
        return log.createdAt >= currentPeriod.start;
      }

      // Para otros logs, verificar si están dentro de algún período
      return isWithinMembershipPeriod(log.projectId, log.createdAt);
    });

    // Agrupar por proyecto y filtrar según las reglas especiales
    const logsByProject = new Map<string, typeof allowedLogs>();

    allowedLogs.forEach((log) => {
      const projectId = log.projectId;
      if (!logsByProject.has(projectId)) {
        logsByProject.set(projectId, []);
      }
      logsByProject.get(projectId)!.push(log);
    });

    // Filtrar por proyecto según las reglas especiales
    const filteredLogs = Array.from(logsByProject.values()).flatMap(
      (projectLogs) => {
        const projectId = projectLogs[0].projectId;

        // Verificar si el usuario es miembro actual del proyecto
        const isCurrentMember = projectIds.includes(projectId);

        // Verificar si hay un PROJECT_REMOVED para el usuario actual
        const hasProjectRemoved = projectLogs.some(
          (log) =>
            log.type === "PROJECT_REMOVED" && log.userId === currentUserId
        );

        if (hasProjectRemoved) {
          // Solo devolver el log de PROJECT_REMOVED
          return projectLogs.filter(
            (log) =>
              log.type === "PROJECT_REMOVED" && log.userId === currentUserId
          );
        }

        // Verificar si el usuario fue eliminado de este proyecto Y NO es miembro actual
        const wasMemberRemoved =
          memberRemovedProjectIds.includes(projectId) && !isCurrentMember;

        if (wasMemberRemoved) {
          // Devolver solo MEMBER_REMOVED y MEMBER_ADDED del usuario actual
          return projectLogs.filter((log) => {
            // Si es MEMBER_REMOVED del usuario actual
            if (
              log.type === "MEMBER_REMOVED" &&
              log.metadata &&
              typeof log.metadata === "object" &&
              log.metadata !== null &&
              "userId" in log.metadata &&
              log.metadata.userId === currentUserId
            ) {
              return true;
            }

            // Si es MEMBER_ADDED del usuario actual
            if (
              log.type === "MEMBER_ADDED" &&
              log.metadata &&
              typeof log.metadata === "object" &&
              log.metadata !== null &&
              "userId" in log.metadata &&
              log.metadata.userId === currentUserId
            ) {
              return true;
            }

            return false;
          });
        }

        // Si es miembro actual (o nunca fue removido), devolver todos los logs del proyecto
        return projectLogs;
      }
    );

    // Eliminar duplicados por ID
    const uniqueLogs = Array.from(
      new Map(filteredLogs.map((log) => [log.id, log])).values()
    );

    // Ordenar por fecha y limitar
    const sortedLogs = uniqueLogs.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json(sortedLogs.slice(0, 50));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }
  }
}
