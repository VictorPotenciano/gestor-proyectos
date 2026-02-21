import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const { name, email } = await request.json();

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el nuevo email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (existingUser && existingUser.id !== userId) {
      return NextResponse.json(
        { message: "Este email ya está en uso" },
        { status: 400 }
      );
    }
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email.trim().toLowerCase(),
      },
    });

    return NextResponse.json(updateUser);
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
