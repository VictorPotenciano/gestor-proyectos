import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put } from "@vercel/blob";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const authorId = session.user.id;
    const formData = await request.formData();

    const content = formData.get("content") as string;
    const projectId = formData.get("projectId") as string;
    const files = formData.getAll("files") as File[];

    const uploadedAttachments = await Promise.all(
      files.map(async (file) => {
        const blob = await put(
          `notes/${projectId}/${Date.now()}-${file.name}`,
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

    const note = await prisma.note.create({
      data: {
        content,
        projectId,
        authorId: authorId,
        attachments:
          uploadedAttachments.length > 0
            ? { create: uploadedAttachments }
            : undefined,
      },
      include: {
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
        type: "COMMENT_ADDED",
        projectId: projectId,
        userId: authorId,
        metadata: {
          metadata: {
            userId: authorId,
            userName: note.author.name,
          },
        },
      },
    });

    return NextResponse.json(note);
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
