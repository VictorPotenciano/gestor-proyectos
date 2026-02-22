import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put, del } from "@vercel/blob";

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
      include: { attachments: true },
    });

    if (!existingNote) {
      return NextResponse.json(
        { message: "Nota no encontrada" },
        { status: 404 }
      );
    }
    const formData = await request.formData();
    const content = formData.get("content") as string;

    // IDs de adjuntos que el cliente quiere conservar
    const keepAttachmentIds = formData.getAll("keepAttachmentIds") as string[];

    // Nuevos ficheros a subir
    const newFiles = formData.getAll("files") as File[];

    // 1. Determinar qué adjuntos se eliminaron
    const attachmentsToDelete = existingNote.attachments.filter(
      (att) => !keepAttachmentIds.includes(att.id)
    );

    // 2. Borrar de Vercel Blob los adjuntos eliminados
    if (attachmentsToDelete.length > 0) {
      await Promise.all(attachmentsToDelete.map((att) => del(att.url)));
    }

    // 3. Subir nuevos ficheros a Vercel Blob
    const newAttachments = await Promise.all(
      newFiles.map(async (file) => {
        const blob = await put(
          `notes/${existingNote.projectId}/${Date.now()}-${file.name}`,
          file,
          { access: "public" }
        );
        return {
          url: blob.url,
          blobPathname: blob.pathname,
          name: file.name,
          size: file.size,
          contentType: file.type,
        };
      })
    );

    const updatedNote = await prisma.note.update({
      where: {
        id,
      },
      data: {
        content,
        attachments: {
          delete: attachmentsToDelete.map((att) => ({ id: att.id })),
          create: newAttachments,
        },
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
        attachments: true,
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
        attachments: true,
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

      // Borrar adjuntos de Vercel Blob antes de eliminar la nota
    if (existingNote.attachments.length > 0) {
      await Promise.all(
        existingNote.attachments.map((att) => del(att.url))
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
