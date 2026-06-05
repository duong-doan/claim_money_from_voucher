import { createUser } from '@/app/lib/users';

export async function POST(req) {
  try {
    const body = await req.json();

    console.log('Received:', body);

    const newUser = await createUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
      referralPhone: body.referralPhone,
      availablePoints: 0,
      points: 0,
    });

    console.log('User created:', newUser);

    return Response.json({
      success: true,
      data: newUser,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
