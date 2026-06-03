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
    });

    console.log('User created:', newUser);

    // Also send to n8n webhook if needed
    try {
      const response = await fetch(
        'http://localhost:5678/webhook-test/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ...body, userId: newUser.id }),
        },
      );

      const text = await response.text();
      console.log('n8n response:', response.status, text);
    } catch (webhookError) {
      console.warn(
        'Webhook failed but user was created:',
        webhookError.message,
      );
    }

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
