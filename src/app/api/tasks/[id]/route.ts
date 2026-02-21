import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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
    const userId = session.user.id;

    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            id: true,
            ownerId: true,
            members: { select: { userId: true } },
          },
        },
        assignees: { select: { userId: true } },
      },
    });
    if (!existingTask) {
      return NextResponse.json(
        { message: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    const { title, description, dueDate, assigneeIds, priority } =
      await request.json();

    // Verificar permisos: debe ser owner o miembro del proyecto
    const projectMemberIds = existingTask.project.members.map((m) => m.userId);
    const hasAccess =
      existingTask.project.ownerId === userId ||
      projectMemberIds.includes(userId);

    if (!hasAccess) {
      return NextResponse.json(
        { message: "No tienes permisos para editar esta tarea" },
        { status: 403 }
      );
    }

    // Validar assignees si se proporcionaron
    let validAssigneeIds: string[] | undefined = undefined;
    if (assigneeIds !== undefined) {
      if (assigneeIds.length > 0) {
        const validUserIds = [
          existingTask.project.ownerId,
          ...projectMemberIds,
        ];

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
      } else {
        validAssigneeIds = [];
      }
    }

    // Actualizar la tarea
    const task = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
        ...(priority !== undefined && { priority }),
        ...(validAssigneeIds !== undefined && {
          assignees: {
            deleteMany: {},
            createMany: {
              data: validAssigneeIds.map((assigneeId) => ({
                userId: assigneeId,
              })),
              skipDuplicates: true,
            },
          },
        }),
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
        type: "TASK_UPDATED",
        projectId: existingTask.projectId!,
        userId: userId,
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

    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      include: {
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
    });

    if (!existingTask) {
      return NextResponse.json(
        { message: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es uno de los asignados a la tarea
    if (!existingTask.assignees.some((a) => a.userId === user.id)) {
      return NextResponse.json(
        { message: "No tienes permisos para eliminar esta tarea" },
        { status: 403 }
      );
    }

    await prisma.activityLog.create({
      data: {
        type: "TASK_REMOVED",
        projectId: existingTask.projectId!,
        userId: user.id,
      },
    });

    const deletedTask = await prisma.task.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(deletedTask);
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
