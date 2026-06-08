import { updateOrder } from '@/app/lib/orders';

export async function PATCH(req) {
  try {
    const body = await req.json();

    const { orderId, shippingCode } = body;

    if (!orderId || !shippingCode) {
      return Response.json(
        {
          success: false,
          error: 'orderId and shippingCode are required',
        },
        { status: 400 },
      );
    }

    const updatedOrder = await updateOrder(orderId, {
      shippingCode,
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
      { status: 500 },
    );
  }
}
