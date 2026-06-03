import { getOrdersByUserId, getAllOrders } from '@/app/lib/orders';
import { getUserById } from '@/app/lib/users';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const adminId = searchParams.get('adminId');
    const code = searchParams.get('code');

    if (!userId && !adminId) {
      return Response.json(
        {
          success: false,
          error: 'userId or adminId is required',
        },
        {
          status: 400,
        },
      );
    }

    let orders;

    if (adminId) {
      const admin = await getUserById(adminId);
      if (!admin || admin.role !== 'admin') {
        return Response.json(
          {
            success: false,
            error: 'Only admin can view all orders',
          },
          {
            status: 403,
          },
        );
      }
      orders = await getAllOrders();
      if (code) {
        const searchCode = code.toLowerCase();
        orders = orders.filter(
          (order) =>
            order.code?.toLowerCase().includes(searchCode) ||
            order.name?.toLowerCase().includes(searchCode),
        );
      }
    } else {
      orders = await getOrdersByUserId(userId);
    }

    return Response.json({
      success: true,
      data: orders,
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
