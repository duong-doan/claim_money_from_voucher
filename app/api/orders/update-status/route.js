import { updateOrderStatus } from '@/app/lib/orders';

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
