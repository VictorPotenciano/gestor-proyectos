import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // Obtener parámetros de paginación de la URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    // Calcular el skip (offset)
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip,
      take: limit,
      include: {
        ownedProjects: {
          where: {
            isDeleted: false,
          },
          include: {
            owner: true,
          },
        },
        projectMemberships: {
          where: {
            project: {
              isDeleted: false,
            },
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
                isDeleted: true,
              },
            },
          },
        },
      },
    });
    const total = await prisma.user.count();

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
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
