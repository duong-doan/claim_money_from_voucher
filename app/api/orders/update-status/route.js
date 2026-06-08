import { sendBuyerRewardMail, sendReferralRewardMail } from '@/app/lib/mail';
import { updateOrder, updateOrderStatus } from '@/app/lib/orders';
import { getUserById, rewardOrder } from '@/app/lib/users';

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { orderId, status, statusByAdmin } = body;

    if (!orderId || (!status && !statusByAdmin)) {
      return Response.json(
        {
          success: false,
          error: 'orderId and status or statusByAdmin are required',
        },
        {
          status: 400,
        },
      );
    }

    const updatedOrder = await updateOrderStatus(
      orderId,
      status,
      statusByAdmin,
    );

    if (
      updatedOrder.status === 'completed' &&
      updatedOrder.statusByAdmin === 'completed'
    ) {
      await rewardOrder(updatedOrder);

      const buyer = await getUserById(updatedOrder.userId);

      if (buyer?.email) {
        await sendBuyerRewardMail({
          userName: buyer.name,
          email: buyer.email,
          orderCode: updatedOrder.code,
          rewardPoints: 50000,
        });
      }

      if (buyer?.referredByUserId) {
        const refUser = await getUserById(buyer.referredByUserId);

        if (refUser?.email) {
          await sendReferralRewardMail({
            email: refUser.email,
            referrerName: refUser.name,
            referredUserName: buyer.name,
            orderCode: updatedOrder.code,
            rewardPoints: 20000,
            availablePoints: refUser.availablePoints,
          });
        }
      }
    }

    await updateOrder(updatedOrder.id, {
      rewardPaid: true,
    });

    return Response.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 400,
      },
    );
  }
}
