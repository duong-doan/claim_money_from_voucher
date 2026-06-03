import { getUserByCredentials } from '@/app/lib/users';

export async function POST(req) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return Response.json(
        {
          success: false,
          error: 'identifier and password are required',
        },
        {
          status: 400,
        },
      );
    }

    const user = await getUserByCredentials(identifier, password);

    if (!user) {
      return Response.json(
        {
          success: false,
          error: 'Số điện thoại hoặc mật khẩu không đúng',
        },
        {
          status: 401,
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
