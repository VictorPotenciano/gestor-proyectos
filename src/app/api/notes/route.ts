import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const authorId = session.user.id;
    
    const { content, projectId } = await request.json();
    const note = await prisma.note.create({
      data: {
        content,
        projectId,
        authorId: authorId,
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
