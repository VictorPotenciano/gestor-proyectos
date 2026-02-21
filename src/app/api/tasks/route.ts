import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de paginación de la URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    // Calcular el skip (offset)
    const skip = (page - 1) * limit;

    // Filtro para tareas donde el usuario es miembro
    const whereClause = {
      OR: [
        { project: { ownerId: session.user.id } },
        { assignees: { some: { userId: session.user.id } } },
      ],
    };

    const total = await prisma.task.count({
      where: whereClause,
    });

    const tasks = await prisma.task.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc", // Ordenar por más antiguas
      },
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      data: tasks,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }
    const userId = session.user.id;

    const {
      title,
      description,
      projectId,
      dueDate,
      assigneeIds = [],
      priority,
    } = await request.json();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      select: { id: true, members: true, owner: true },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Proyecto no encontrado o sin permisos" },
        { status: 403 }
      );
    }

    // Validar assignees si se proporcionaron
    let validAssigneeIds: string[] = [];
    if (assigneeIds.length > 0) {
      // Crear lista de usuarios válidos: owner + miembros
      const projectMemberIds = project.members.map((m) => m.userId);
      const validUserIds = [project.owner.id, ...projectMemberIds];

      // Verificar que todos los assignees sean miembros del proyecto o el owner
      const invalidAssignees = assigneeIds.filter(
        (id: string) => !validUserIds.includes(id)
      );

      if (invalidAssignees.length > 0) {
        return NextResponse.json(
          {
            message: "Algunos usuarios no son miembros del proyecto",
            invalidUsers: invalidAssignees,
          },
          { status: 400 }
        );
      }

      validAssigneeIds = assigneeIds;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "PENDIENTE",
        priority,
        assignees:
          validAssigneeIds.length > 0
            ? {
                createMany: {
                  data: validAssigneeIds.map((assigneeId) => ({
                    userId: assigneeId,
                  })),
                  skipDuplicates: true,
                },
              }
            : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "TASK_CREATED",
        projectId: projectId,
        userId: userId,
        metadata: {
          userId: userId,
          userName: session.user.name,
        },
      },
    });
    return NextResponse.json(task);
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
