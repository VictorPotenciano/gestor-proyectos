import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const projectToComplete = await prisma.project.findUnique({
      where: { id },
    });

    if (!projectToComplete) {
      return NextResponse.json(
        { message: "Proyecto no encontrado" },
        { status: 404 }
      );
    }

    if (projectToComplete.status === "CANCELADO") {
      return NextResponse.json(
        { message: "El proyecto ya está cancelado" },
        { status: 400 }
      );
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        status: "CANCELADO",
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "PROJECT_CANCEL",
        projectId: updatedProject.id,
        userId: updatedProject.ownerId,
      },
    });

    return NextResponse.json(updatedProject);
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
