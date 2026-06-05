import { getUserById, updateUser } from '@/app/lib/users';
import { sendTelegramMessage } from '@/app/lib/telegram';

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

    const bonusAmount = Number(user.availablePoints || 0);

    if (bonusAmount <= 0) {
      return Response.json(
        {
          success: false,
          error: 'Không có điểm khả dụng để nhận thưởng',
        },
        { status: 400 },
      );
    }

    const updatedUser = await updateUser(userId, {
      points: Math.max(0, Number(user.points || 0) - bonusAmount),
      availablePoints: 0,
      lastBonusDate: new Date().toISOString(),
      bankAccount,
      bankName,
    });

    await sendTelegramMessage(`
    💰 Yêu cầu rút thưởng mới

    👤 User: ${user.name}
    📞 SĐT: ${user.phone}

    🏦 Ngân hàng: ${bankName}
    💳 STK: ${bankAccount}

    💵 Số tiền: ${bonusAmount.toLocaleString()} VNĐ

    ⏰ Thời gian: ${new Date().toLocaleString('vi-VN')}
    `);

    return Response.json({
      success: true,
      message: 'Bonus claimed successfully',
      data: updatedUser,
      bonusAmount,
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
