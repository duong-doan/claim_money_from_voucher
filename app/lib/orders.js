const API_BASE = process.env.ENDPOINT_API;

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

export async function createOrder(orderData) {
  const body = {
    userId: orderData.userId,
    productId: orderData.productId,
    code: orderData.code,
    name: orderData.name ?? orderData.code ?? orderData.link,
    link: orderData.link,
    price: Number(orderData.price ?? orderData.amount ?? 0),
    amount: Number(orderData.amount ?? orderData.price ?? 0),
    status: orderData.status ?? 'pending',
    statusByAdmin: orderData.statusByAdmin ?? 'pending',
    createdAt: orderData.orderDate ?? new Date().toISOString(),
  };

  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return handleResponse(response);
}

export async function updateOrder(orderId, updateData) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  return handleResponse(response);
}

export async function updateOrderStatus(orderId, status, statusByAdmin) {
  const body = {};

  if (status) {
    body.status = status;
  }

  if (statusByAdmin) {
    body.statusByAdmin = statusByAdmin;
  }

  return updateOrder(orderId, body);
}

export async function getOrderById(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`);
  return handleResponse(response);
}

export async function getOrdersByUserId(userId) {
  const orders = await getAllOrders();
  return Array.isArray(orders)
    ? orders.filter((order) => order.userId === userId)
    : [];
}

export async function getAllOrders() {
  const response = await fetch(`${API_BASE}/orders`);
  return handleResponse(response);
}

export async function deleteOrder(orderId) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'DELETE',
  });

  await handleResponse(response);
  return { success: true, message: 'Order deleted successfully' };
}
