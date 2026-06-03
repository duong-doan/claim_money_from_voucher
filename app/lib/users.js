const API_BASE = 'https://602d0cc330ba720017223bfc.mockapi.io';

export const ADMIN_CREDENTIALS = {
  email: 'admin@gmail.com',
  password: 'Admin123',
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

  const body = {
    name: userData.name,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: userData.role || 'user',
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

  const user = users.find(
    (entry) =>
      (entry.phone === identifier || entry.email === identifier) &&
      entry.password === password,
  );

  if (user) {
    return user;
  }

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
      // If admin account cannot be created, fall back to a local hardcoded admin object.
      return {
        id: 'admin',
        name: ADMIN_CREDENTIALS.name,
        email: ADMIN_CREDENTIALS.email,
        phone: ADMIN_CREDENTIALS.phone,
        password: ADMIN_CREDENTIALS.password,
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
