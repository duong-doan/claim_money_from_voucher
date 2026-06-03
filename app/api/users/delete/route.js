import { deleteUser } from '@/app/lib/users';

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { userId } = body;

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

    const result = await deleteUser(userId);

    return Response.json({
      success: true,
      data: result,
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
