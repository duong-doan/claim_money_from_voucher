import { getAllUsers, getUserById } from '@/app/lib/users';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const adminId = searchParams.get('adminId');

    if (!adminId) {
      return Response.json(
        {
          success: false,
          error: 'adminId is required',
        },
        {
          status: 400,
        },
      );
    }

    const admin = await getUserById(adminId);
    if (!admin || admin.role !== 'admin') {
      return Response.json(
        {
          success: false,
          error: 'Only admin can view all users',
        },
        {
          status: 403,
        },
      );
    }

    const allUsers = await getAllUsers();

    return Response.json({
      success: true,
      data: allUsers,
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
