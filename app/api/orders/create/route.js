import { createOrder } from '@/app/lib/orders';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, productId, code, link, orderDate, status, amount, price } =
      body;

    if (!userId || !productId || !code || !orderDate || !status) {
      return Response.json(
        {
          success: false,
          error:
            'userId, productId, code, link, orderDate, and status are required',
        },
        {
          status: 400,
        },
      );
    }

    const newOrder = await createOrder({
      userId,
      productId,
      code,
      link,
      orderDate,
      status,
      amount: amount ?? price ?? 0,
      price: price ?? amount ?? 0,
    });

    return Response.json({
      success: true,
      data: newOrder,
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
