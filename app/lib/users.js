const API_BASE = process.env.ENDPOINT_API;

import { comparePassword, hashPassword } from './password';

export const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASSWORD,
  phone: '0900000000',
  name: 'Admin',
};

async function handleResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMessage =
      data?.message || data?.error || response.statusText || 'Unknown error';
    throw new Error(errorMessage);
  }

  return data;
}

export async function createUser(userData) {
  const existingEmailUser = await getUserByEmail(userData.email);
  if (existingEmailUser) {
    throw new Error('Email đã tồn tại');
  }

  const existingPhoneUser = await getUserByPhone(userData.phone);
  if (existingPhoneUser) {
    throw new Error('Số điện thoại đã tồn tại');
  }

  const hashedPassword = await hashPassword(userData.password);

  let referredByUserId = null;
  console.log('userData', userData);

  //   if (userData.referralPhone) {
  //     const referrer = await getUserByPhone(userData.referralPhone);
  //     console.log('referrer', referrer)

  //     if (!referrer) {
  //       throw new Error('Mã giới thiệu không tồn tại');
  //     }

  //     referredByUserId = referrer.id;
  //   }

  const referrer = userData.referralPhone
    ? await getUserByPhone(userData.referralPhone)
    : null;
  console.log('referrer', referrer);

  const body = {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: hashedPassword,
    role: userData.role || 'user',
    referredBy: referrer?.phone || null,
    referredByUserId: referrer?.id || null,
    availablePoints: 0,
    points: 0,
  };

  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function updateUser(userId, updateData) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  return handleResponse(response);
}

export async function deleteUser(userId) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
  });

  await handleResponse(response);
  return { success: true, message: 'User deleted successfully' };
}

export async function getUserById(userId) {
  const response = await fetch(`${API_BASE}/users/${userId}`);
  return handleResponse(response);
}

export async function getUserByEmail(email) {
  const users = await getAllUsers();
  return Array.isArray(users)
    ? users.find((user) => user.email === email) || null
    : null;
}

export async function getUserByPhone(phone) {
  const users = await getAllUsers();
  return Array.isArray(users)
    ? users.find((user) => user.phone === phone) || null
    : null;
}

export async function getUserByCredentials(identifier, password) {
  const users = await getAllUsers();

  if (!Array.isArray(users)) {
    return null;
  }

  // tìm user theo email hoặc phone
  const user = users.find(
    (entry) => entry.phone === identifier || entry.email === identifier,
  );

  if (user) {
    const isMatch = await comparePassword(password, user.password);

    if (isMatch) {
      return user;
    }
  }

  // xử lý tài khoản admin mặc định
  if (
    identifier === ADMIN_CREDENTIALS.email &&
    password === ADMIN_CREDENTIALS.password
  ) {
    let adminUser = await getUserByEmail(identifier);

    if (adminUser) {
      return adminUser;
    }

    try {
      adminUser = await createUser({
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        phone: ADMIN_CREDENTIALS.phone,
        password: ADMIN_CREDENTIALS.password,
        role: 'admin',
      });

      return adminUser;
    } catch (error) {
      return {
        id: 'admin',
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        phone: ADMIN_CREDENTIALS.phone,
        role: 'admin',
      };
    }
  }

  return null;
}

export async function getAllUsers() {
  const response = await fetch(`${API_BASE}/users`);
  return handleResponse(response);
}

export async function rewardOrder(order) {
  const user = await getUserById(order.userId);

  if (!user) return;

  const hasReferrer = !!user.referredByUserId;

  // User được giới thiệu
  if (hasReferrer) {
    await updateUser(user.id, {
      points: Number(user.points || 0) + 30000,
      availablePoints: Number(user.availablePoints || 0) + 30000,
    });

    const referrer = await getUserById(user.referredByUserId);

    if (referrer) {
      await updateUser(referrer.id, {
        points: Number(referrer.points || 0) + 20000,
        availablePoints: Number(referrer.availablePoints || 0) + 20000,
      });
    }
  } else {
    await updateUser(user.id, {
      points: Number(user.points || 0) + 50000,
      availablePoints: Number(user.availablePoints || 0) + 50000,
    });
  }
}
