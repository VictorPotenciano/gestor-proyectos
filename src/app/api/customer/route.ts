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

    const total = await prisma.customer.count();

    const customers = await prisma.customer.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        projects: {
          where: {
            isDeleted: false,
          },
        },
        createdAt: true,
        // Conteo total de proyectos
        _count: {
          select: {
            projects: {
              where: {
                isDeleted: false,
              },
            },
          },
        },
      },
    });

    // Calcular metadatos de paginación
    const totalPages = Math.ceil(total / limit);

    const formattedCustomers = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      createdAt: c.createdAt,
      projectCount: c._count.projects,
      projects: c.projects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        totalAmount: p.totalAmount,
        paymentStatus: p.paymentStatus,
        dueDate: p.dueDate,
        createdAt: p.createdAt,
      })),
    }));
    return NextResponse.json({
      data: formattedCustomers,
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
    const { name, email, phone } = await request.json();

    const conditions = [];
    if (email != null) {
      conditions.push({ email: email });
    }
    if (phone != null) {
      conditions.push({ phone: phone });
    }

    // Solo buscar duplicados si hay condiciones válidas
    if (conditions.length > 0) {
      const existing = await prisma.customer.findFirst({
        where: {
          OR: conditions,
        },
      });

      if (existing) {
        const field = existing.email === email ? "correo" : "teléfono";
        return NextResponse.json(
          { message: `Ya existe un cliente con ese ${field}` },
          { status: 409 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
      },
    });
    return NextResponse.json(customer);
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
