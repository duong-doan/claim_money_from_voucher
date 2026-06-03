import { createUser } from '@/app/lib/users';
import { createOrder } from '@/app/lib/orders';

export async function POST(req) {
  try {
    const adminUser = await createUser({
      name: 'admin',
      email: 'admin@example.com',
      phone: '0123456789',
      role: 'admin',
    });

    const regularUser = await createUser({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '0987654321',
      role: 'user',
    });

    const order1 = await createOrder({
      refuserId: regularUser.id,
      voucherCode: 'VC001',
      amount: 100000,
    });

    const order2 = await createOrder({
      refuserId: regularUser.id,
      voucherCode: 'VC002',
      amount: 200000,
    });

    return Response.json({
      success: true,
      message: 'Sample data created successfully',
      data: {
        admin: adminUser,
        regularUser,
        orders: [order1, order2],
      },
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
