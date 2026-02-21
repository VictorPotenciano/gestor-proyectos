import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const taskToUpdate = await prisma.task.findUnique({
      where: { id },
    });
    if (!taskToUpdate) {
      return NextResponse.json(
        { message: "Tarea no encontrada" },
        { status: 404 }
      );
    }
    if (taskToUpdate.status === "CANCELADA") {
      return NextResponse.json(
        { message: "La tarea ya está cancelada" },
        { status: 400 }
      );
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        status: "CANCELADA",
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "TASK_STATUS_CANCEL",
        projectId: updatedTask.projectId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(updatedTask);
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
