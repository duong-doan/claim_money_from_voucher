import { createUser } from '@/app/lib/users';

export async function POST(req) {
  try {
    const body = await req.json();

    const newUser = await createUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      points: 0, // Default points for new users
      availablePoints: 0, // Default available points for new users
      referralPhone: body.referralPhone,
    });

    return Response.json({
      success: true,
      data: newUser,
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
