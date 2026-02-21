import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PaymentStatus } from "../../../../../typing";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "No autorizado" }, { status: 401 });
    }

    const userId = session.user.id;

    const existingPayment = await prisma.payment.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            ownerId: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
      },
    });

    if (!existingPayment) {
      return NextResponse.json(
        { message: "Pago no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que el usuario sea el owner del proyecto
    if (existingPayment.project.ownerId !== userId) {
      return NextResponse.json(
        { message: "No tienes permiso para eliminar este pago" },
        { status: 403 }
      );
    }

    // Calcular el nuevo paidAmount después de eliminar el pago
    const newPaidAmount =
      Number(existingPayment.project.paidAmount) -
      Number(existingPayment.amount);
    const totalAmount = Number(existingPayment.project.totalAmount);

    // Determinar el nuevo estado de pago
    let newPaymentStatus: PaymentStatus;
    if (newPaidAmount === 0) {
      newPaymentStatus = PaymentStatus.NO_PAGADO;
    } else if (newPaidAmount === totalAmount) {
      newPaymentStatus = PaymentStatus.PAGADO;
    } else {
      // Si está entre 0 y totalAmount
      newPaymentStatus = PaymentStatus.A_PLAZOS;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Eliminar el pago
      const deletePayment = await tx.payment.delete({
        where: {
          id,
        },
      });

      // Actualizar el paidAmount del proyecto
      await tx.project.update({
        where: {
          id: existingPayment.projectId,
        },
        data: {
          paidAmount: {
            decrement: existingPayment.amount,
          },
          paymentStatus: newPaymentStatus,
        },
      });

      // Crear el log de actividad
      await tx.activityLog.create({
        data: {
          type: "PAYMENT_REMOVED",
          projectId: deletePayment.projectId,
          userId: userId,
        },
      });

      return deletePayment;
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
