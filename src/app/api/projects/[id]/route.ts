import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de paginación de la URL
    const { searchParams } = new URL(request.url);
    // Paginación para activities
    const activitiesPage = parseInt(searchParams.get("activitiesPage") || "1");
    const activitiesLimit = parseInt(
      searchParams.get("activitiesLimit") || "10"
    );
    const activitiesSkip = (activitiesPage - 1) * activitiesLimit;

    // Paginación para tasks
    const tasksPage = parseInt(searchParams.get("tasksPage") || "1");
    const tasksLimit = parseInt(searchParams.get("tasksLimit") || "10");
    const tasksSkip = (tasksPage - 1) * tasksLimit;

    // Paginación para comments
    const commentsPage = parseInt(searchParams.get("commentsPage") || "1");
    const commentsLimit = parseInt(searchParams.get("commentsLimit") || "10");
    const commentsSkip = (commentsPage - 1) * commentsLimit;

    const existingProject = await prisma.project.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el dueño o miembro del proyecto
    const isMember = existingProject.members.some(
      (member) => member.userId === session.user.id
    );
    if (existingProject.ownerId !== session.user.id && !isMember) {
      return NextResponse.json(
        { message: "No tienes permiso para editar este proyecto" },
        { status: 403 }
      );
    }

    // Contar totales
    const [totalActivities, totalTasks, totalComments] = await Promise.all([
      prisma.activityLog.count({
        where: { projectId: id },
      }),
      prisma.task.count({
        where: { projectId: id },
      }),
      prisma.note.count({
        where: { projectId: id },
      }),
    ]);

    const project = await prisma.project.findUnique({
      where: { id, isDeleted: false },
      include: {
        tasks: {
          include: {
            assignees: {
              include: {
                user: true,
              },
            },
          },
          take: tasksLimit,
          skip: tasksSkip,
          orderBy: {
            createdAt: "desc",
          },
        },
        members: {
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            attachments: true,
          },
          take: commentsLimit,
          skip: commentsSkip,
          orderBy: {
            createdAt: "desc",
          },
        },
        payments: true,
        owner: true,
        customer: true,
        activities: {
          include: {
            user: true,
          },
          take: activitiesLimit,
          skip: activitiesSkip,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      ...project,
      pagination: {
        activities: {
          total: totalActivities,
          page: activitiesPage,
          limit: activitiesLimit,
          totalPages: Math.ceil(totalActivities / activitiesLimit),
        },
        tasks: {
          total: totalTasks,
          page: tasksPage,
          limit: tasksLimit,
          totalPages: Math.ceil(totalTasks / tasksLimit),
        },
        comments: {
          total: totalComments,
          page: commentsPage,
          limit: commentsLimit,
          totalPages: Math.ceil(totalComments / commentsLimit),
        },
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const {
      name,
      description,
      totalAmount,
      dueDate,
      customerId,
      memberIds,
      status,
      paymentStatus,
    } = await request.json();

    // Verificar que el proyecto existe y el usuario tiene permiso para editarlo
    const existingProject = await prisma.project.findUnique({
      where: { id, isDeleted: false },
      include: {
        members: true,
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        { message: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el dueño o miembro del proyecto
    const isMember = existingProject.members.some(
      (member) => member.userId === session.user.id
    );
    if (existingProject.ownerId !== session.user.id && !isMember) {
      return NextResponse.json(
        { message: "No tienes permiso para editar este proyecto" },
        { status: 403 }
      );
    }

    const activityLogs: Array<{
      type: "MEMBER_ADDED" | "MEMBER_REMOVED" | "PROJECT_UPDATED";
      userId: string;
      metadata?: {
        userId: string;
        userName: string | null;
        joinedAt: Date;
      };
    }> = [];

    // Siempre agregar el log de PROJECT_UPDATED primero
    activityLogs.push({
      type: "PROJECT_UPDATED",
      userId: session.user.id,
    });

    if (memberIds !== undefined) {
      const existingMemberIds = existingProject.members.map((m) => m.userId);
      const newMemberIds = memberIds;

      // Miembros añadidos
      const addedMembers = newMemberIds.filter(
        (id: string) => !existingMemberIds.includes(id)
      );

      // Miembros eliminados
      const removedMembers = existingMemberIds.filter(
        (id: string) => !newMemberIds.includes(id)
      );

      // Crear logs para miembros añadidos con metadata
      for (const addedMemberId of addedMembers) {
        // Obtener información del usuario añadido
        const addedUser = await prisma.user.findUnique({
          where: { id: addedMemberId },
          select: { id: true, name: true },
        });

        activityLogs.push({
          type: "MEMBER_ADDED" as const,
          userId: session.user.id,
          metadata: {
            userId: addedMemberId,
            userName: addedUser?.name || null,
            joinedAt: new Date(),
          },
        });
      }
      // Crear logs para miembros eliminados con metadata
      for (const removedMemberId of removedMembers) {
        const removedMember = existingProject.members.find(
          (m) => m.userId === removedMemberId
        );

        if (removedMember) {
          // Obtener información del usuario eliminado
          const removedUser = await prisma.user.findUnique({
            where: { id: removedMemberId },
            select: { id: true, name: true },
          });

          activityLogs.push({
            type: "MEMBER_REMOVED" as const,
            userId: session.user.id,
            metadata: {
              userId: removedMemberId,
              userName: removedUser?.name || null,
              joinedAt: removedMember.joinedAt,
            },
          });
        }
      }

      // Actualizar miembros del proyecto
      await prisma.project.update({
        where: { id },
        data: {
          members: {
            deleteMany:
              removedMembers.length > 0
                ? {
                    userId: { in: removedMembers },
                  }
                : undefined,
            create: addedMembers.map((userId: string) => ({
              userId,
            })),
          },
        },
      });
    }

    // Actualizar el proyecto
    const project = await prisma.project.update({
      where: { id },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : undefined,
        status: status !== undefined ? status : undefined,
        totalAmount:
          totalAmount !== undefined ? parseFloat(totalAmount) : undefined,
        paymentStatus: paymentStatus !== undefined ? paymentStatus : undefined,
        dueDate:
          dueDate !== undefined
            ? dueDate
              ? new Date(dueDate)
              : null
            : undefined,
        customerId: customerId !== undefined ? customerId : undefined,

        // Crear los logs de actividad
        activities: {
          create: activityLogs.map((log) => ({
            type: log.type,
            userId: log.userId,
            metadata: log.metadata || undefined,
          })),
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        members: {
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
        activities: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json(project);
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const existing = await prisma.project.findUnique({
      where: {
        id: id,
        isDeleted: false,
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el owner del proyecto
    if (existing.ownerId !== user.id) {
      return NextResponse.json(
        { message: "No tienes permisos para eliminar este proyecto" },
        { status: 403 }
      );
    }

    await prisma.activityLog.updateMany({
      where: {
        projectId: id,
        type: {
          not: "PROJECT_REMOVED",
        },
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Crear un activity log de PROJECT_REMOVED para cada miembro y el owner
    const memberIds = existing.members.map((m) => m.userId);
    const allUserIds = [...new Set([...memberIds, existing.ownerId])];

    // Crear logs para todos los usuarios involucrados
    await prisma.activityLog.createMany({
      data: allUserIds.map((userId) => ({
        type: "PROJECT_REMOVED",
        projectId: id,
        userId: userId,
        metadata: {
          projectName: existing.name,
          removedBy: user.id,
          removedByName: user.name,
        },
      })),
    });

    const deletedProject = await prisma.project.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: user.id,
      },
    });
    return NextResponse.json(deletedProject);
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
