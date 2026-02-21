import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    // Obtener parámetros de paginación de la URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");

    // Calcular el skip (offset)
    const skip = (page - 1) * limit;

    // Filtro para proyectos donde el usuario es owner O member
    const whereClause = {
      isDeleted: false,
      OR: [
        { ownerId: session.user.id }, // Usuario es dueño
        {
          members: {
            some: {
              userId: session.user.id, // Usuario es miembro
            },
          },
        },
      ],
    };

    const total = await prisma.project.count({
      where: whereClause,
    });

    const projects = await prisma.project.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        owner: true,
        customer: true,
        members: {
          include: {
            user: true,
          },
        },
        tasks: true,
        comments: true,
        payments: true,
      },
      orderBy: {
        createdAt: "desc", // Ordenar por más recientes
      },
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);
    return NextResponse.json({
      data: projects,
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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const { name, description, totalAmount, dueDate, customerId, memberIds } =
      await request.json();

    const activityLogs: Array<{
      type: "MEMBER_ADDED" | "PROJECT_CREATED";
      userId: string;
      metadata?: {
        userId: string;
        userName: string | null;
        joinedAt: Date;
      };
    }> = [];

    // Siempre agregar el log de PROJECT_CREATED primero
    activityLogs.push({
      type: "PROJECT_CREATED",
      userId: session.user.id,
    });

    // Si hay miembros, obtener su información para la metadata
    if (memberIds && memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true },
      });

      const now = new Date();

      // Crear logs con metadata para cada miembro añadido
      for (const user of users) {
        activityLogs.push({
          type: "MEMBER_ADDED" as const,
          userId: session.user.id,
          metadata: {
            userId: user.id,
            userName: user.name || null,
            joinedAt: now,
          },
        });
      }
    }

    // Crear el proyecto con sus relaciones
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        status: "EN_PROCESO",
        totalAmount: parseFloat(totalAmount),
        paymentStatus: "NO_PAGADO",
        startDate: new Date(),
        dueDate: dueDate ? new Date(dueDate) : null,
        ownerId: session.user.id,
        customerId: customerId || null,

        // Crear miembros del proyecto si se proporcionaron
        members:
          memberIds && memberIds.length > 0
            ? {
                create: memberIds.map((userId: string) => ({
                  userId,
                })),
              }
            : undefined,

        // Crear el log de actividad
        activities: {
          create: activityLogs,
        },
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        customer: true,
        members: {
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
        activities: true,
      },
    });
    return NextResponse.json(project);
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
