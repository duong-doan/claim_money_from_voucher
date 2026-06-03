import { getUserById } from '@/app/lib/users';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return Response.json(
        {
          success: false,
          error: 'userId is required',
        },
        {
          status: 400,
        },
      );
    }

    const user = await getUserById(userId);
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
