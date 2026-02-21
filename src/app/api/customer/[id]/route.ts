import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id,
      },
    });

    if (!existingCustomer) {
      return NextResponse.json(
        { message: "Cliente no encontrado" },
        { status: 404 }
      );
    }

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
          NOT: { id: id },
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

    const customer = await prisma.customer.update({
      where: {
        id,
      },
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const existing = await prisma.customer.findUnique({
      where: {
        id: id,
      },
    });
    if (!existing) {
      return NextResponse.json(
        { message: "Cliente no encontrado" },
        { status: 404 }
      );
    }
    const deletedCustomer = await prisma.customer.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json(deletedCustomer);
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
