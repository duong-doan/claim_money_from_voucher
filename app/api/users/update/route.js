import { updateUser } from '@/app/lib/users';

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { userId, ...updateData } = body;

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

    const updatedUser = await updateUser(userId, updateData);

    return Response.json({
      success: true,
      data: updatedUser,
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
