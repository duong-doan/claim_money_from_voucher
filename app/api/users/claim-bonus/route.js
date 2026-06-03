import { getUserById, updateUser } from '@/app/lib/users';
import { getOrdersByUserId } from '@/app/lib/orders';

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId, bankAccount, bankName } = body;

    if (!userId || !bankAccount || !bankName) {
      return Response.json(
        {
          success: false,
          error: 'userId, bankAccount, and bankName are required',
        },
        { status: 400 },
      );
    }

    const user = await getUserById(userId);
    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 },
      );
    }

    const orders = await getOrdersByUserId(userId);
    const completedOrders = orders.filter(
      (order) =>
        order.statusByAdmin === 'completed' && order.status === 'completed',
    );

    if (completedOrders.length === 0) {
      return Response.json(
        {
          success: false,
          error: 'No completed orders with admin complete status',
        },
        { status: 400 },
      );
    }

    const bonusAmount = completedOrders.length * 50000;

    // Update user points and availablePoints based on completed orders.
    await updateUser(userId, {
      points: bonusAmount,
      availablePoints: bonusAmount,
      bankAccount,
      bankName,
    });

    // After claiming, clear the points fields.
    const updatedUser = await updateUser(userId, {
      points: 0,
      availablePoints: 0,
      lastBonusDate: new Date().toISOString(),
      bankAccount,
      bankName,
    });

    return Response.json({
      success: true,
      message: 'Bonus claimed successfully',
      data: updatedUser,
      bonusAmount,
      calculatedPoints: bonusAmount,
    });
  } catch (error) {
    console.error('Error claiming bonus:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 400 },
    );
  }
}
