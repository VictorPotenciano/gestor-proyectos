import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const member = await prisma.projectMember.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Miembro no encontrado" },
        { status: 404 }
      );
    }

    const memberDeleted = await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId: member.projectId,
          userId: member.userId,
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        type: "MEMBER_REMOVED",
        projectId: member.projectId,
        userId: member.userId,
        metadata: {
          userId: member.userId,
          userName: member.user.name || null,
          joinedAt: member.joinedAt,
        },
      },
    });
    return NextResponse.json(memberDeleted);
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
