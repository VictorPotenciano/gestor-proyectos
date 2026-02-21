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
    const existingNote = await prisma.note.findUnique({
      where: {
        id,
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { message: "Nota no encontrada" },
        { status: 404 }
      );
    }
    const { content } = await request.json();

    const updatedNote = await prisma.note.update({
      where: {
        id,
      },
      data: {
        content,
      },
      include: {
        project: {
          select: {
            id: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    await prisma.activityLog.create({
      data: {
        type: "COMMENT_UPDATED",
        projectId: updatedNote.projectId!,
        userId: updatedNote.authorId,
        metadata: {
          userId: updatedNote.authorId,
          userName: updatedNote.author.name,
        },
      },
    });
    return NextResponse.json(updatedNote);
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

    const existingNote = await prisma.note.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!existingNote) {
      return NextResponse.json(
        { message: "Nota no encontrada" },
        { status: 404 }
      );
    }

    // Verificar que el usuario es el author de la nota
    if (existingNote.authorId !== user.id) {
      return NextResponse.json(
        { message: "No tienes permisos para eliminar esta nota" },
        { status: 403 }
      );
    }

    await prisma.activityLog.create({
      data: {
        type: "COMMENT_REMOVED",
        projectId: existingNote.projectId!,
        userId: existingNote.authorId,
        metadata: {
          userId: existingNote.authorId,
          userName: existingNote.author.name,
        },
      },
    });

    const deletedNote = await prisma.note.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json(deletedNote);
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
