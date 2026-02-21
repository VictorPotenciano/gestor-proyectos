import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { projectId, userId, userIds } = await request.json();

    let targetUserIds: string[] = [];

    if (userIds && Array.isArray(userIds)) {
      targetUserIds = userIds.filter(
        (id) => typeof id === "string" && id.trim().length > 0
      );
    } else if (userId) {
      targetUserIds = [userId].filter(
        (id) => typeof id === "string" && id.trim().length > 0
      );
    }

    // Obtenemos las membresías existentes
    const existingMembers = await prisma.projectMember.findMany({
      where: {
        projectId,
        userId: { in: targetUserIds },
      },
      select: {
        userId: true,
      },
    });

    const existingUserIds = new Set(existingMembers.map((m) => m.userId));

    // Filtramos solo los que NO existen todavía
    const usersToAdd = targetUserIds.filter((id) => !existingUserIds.has(id));

    if (usersToAdd.length === 0) {
      return NextResponse.json(
        {
          message: "Todos los usuarios ya son miembros del proyecto",
          added: [],
          skipped: targetUserIds,
        },
        { status: 200 }
      );
    }

    const usersData = await prisma.user.findMany({
      where: {
        id: { in: usersToAdd },
      },
      select: {
        id: true,
        name: true,
        email: true, 
      },
    });

    const userNameMap = new Map(
      usersData.map((u) => [
        u.id,
        u.name || u.email.split("@")[0] || "Usuario sin nombre",
      ])
    );

    // Creamos las nuevas relaciones
    const addedMembers = await prisma.projectMember.createMany({
      data: usersToAdd.map((userId) => ({
        projectId,
        userId,
        invitedAt: new Date(),
        joinedAt: new Date(),
      })),
      skipDuplicates: true,
    });

    if (addedMembers.count > 0) {
      await prisma.activityLog.createMany({
        data: usersToAdd.map((userId) => ({
          type: "MEMBER_ADDED",
          projectId,
          userId,
          metadata: {
            metadata: {
              userId: userId,
              userName: userNameMap.get(userId),
              joinedAt: new Date(),
            },
          },
        })),
      });
    }
    return NextResponse.json(addedMembers);
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
