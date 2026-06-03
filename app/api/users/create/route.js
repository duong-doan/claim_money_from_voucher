import { createUser } from '@/app/lib/users';

export async function POST(req) {
  try {
    const body = await req.json();

    const newUser = await createUser({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: body.password,
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
