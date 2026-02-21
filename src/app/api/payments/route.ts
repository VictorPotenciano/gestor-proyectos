import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentStatus } from "../../../../typing";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const { amount, description, projectId } = await request.json();

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: userId,
      },
      select: {
        id: true,
        name: true,
        totalAmount: true,
        paidAmount: true,
        paymentStatus: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { message: "Proyecto no encontrado o sin permisos" },
        { status: 403 }
      );
    }

    // Calcular el nuevo total de pagos
    const currentPaidAmount = Number(project.paidAmount);
    const newPaidAmount = currentPaidAmount + amount;
    const totalAmount = Number(project.totalAmount);

    // Validar que el nuevo total no supere el totalAmount del proyecto
    if (newPaidAmount > totalAmount) {
      return NextResponse.json(
        {
          message: `El monto excede el presupuesto del proyecto. Disponible: ${totalAmount - currentPaidAmount}, Solicitado: ${amount}`,
        },
        { status: 400 }
      );
    }

    // Determinar el nuevo estado de pago
    let newPaymentStatus: PaymentStatus;
    if (newPaidAmount === totalAmount) {
      newPaymentStatus = PaymentStatus.PAGADO;
    } else if (
      currentPaidAmount === 0 ||
      project.paymentStatus === PaymentStatus.NO_PAGADO
    ) {
      newPaymentStatus = PaymentStatus.A_PLAZOS;
    } else {
      // Si ya está en A_PLAZOS, mantener ese estado
      newPaymentStatus = project.paymentStatus as PaymentStatus;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Crear el pago
      const payment = await tx.payment.create({
        data: {
          amount,
          description,
          projectId,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      // Actualizar el paidAmount del proyecto
      await tx.project.update({
        where: {
          id: projectId,
        },
        data: {
          paidAmount: newPaidAmount,
          paymentStatus: newPaymentStatus,
        },
      });

      // Crear el log de actividad
      await tx.activityLog.create({
        data: {
          type: "PAYMENT_ADDED",
          projectId: projectId,
          userId: userId,
        },
      });

      return payment;
    });

    return NextResponse.json(result);
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
