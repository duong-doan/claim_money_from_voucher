import { getUserByEmail } from '@/app/lib/users';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return Response.json(
        {
          success: false,
          error: 'email is required',
        },
        {
          status: 400,
        },
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'User not found',
        },
        {
          status: 404,
        },
      );
    }

    return Response.json({
      success: true,
      data: user,
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
