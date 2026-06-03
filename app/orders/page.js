'use client';

import { useState, useEffect } from 'react';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [searchCode, setSearchCode] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [productPrice, setProductPrice] = useState('0');
  const [offerPrice, setOfferPrice] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedProductLink, setSelectedProductLink] = useState('');
  const [products, setProducts] = useState([]);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bankAccount, setBankAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bonusLoading, setBonusLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [availablePoints, setAvailablePoints] = useState(0);

  const isClaimableOrder = (order) =>
    order.statusByAdmin === 'completed' && order.status === 'completed';

  const loadProductOptions = async () => {
    try {
      const response = await fetch(
        'https://64e307aebac46e480e780c02.mockapi.io/orders',
      );
      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading product list:', error);
    }
  };

  const loadUserInfo = async (id) => {
    try {
      const response = await fetch(
        `/api/users/get-by-id?userId=${encodeURIComponent(id)}`,
      );
      const result = await response.json();
      if (result.success) {
        setPoints(result.data.points ?? 0);
        setAvailablePoints(result.data.availablePoints ?? 0);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    const storedUserRole = localStorage.getItem('userRole');

    if (storedUserId) {
      setUserId(storedUserId);
      setUserName(storedUserName || '');
      setUserRole(storedUserRole || 'user');
      const admin = storedUserRole === 'admin';
      setIsAdmin(admin);
      loadOrders(storedUserId, admin);
      loadUserInfo(storedUserId);
      loadProductOptions();
    } else {
      setLoading(false);
    }
  }, []);

  const loadOrders = async (id, admin = false, code = '') => {
    try {
      setLoading(true);
      let url = '/api/orders/list?';

      if (admin) {
        url += `adminId=${id}`;
      } else {
        url += `userId=${id}`;
      }

      if (code) {
        url += `&code=${encodeURIComponent(code)}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!editingOrder || !newStatus) return;

    try {
      const body = { orderId: editingOrder.id };
      if (isAdmin) {
        body.statusByAdmin = newStatus;
      } else {
        body.status = newStatus;
      }

      const response = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        setOrders(
          orders.map((o) => (o.id === editingOrder.id ? result.data : o)),
        );
        setEditingOrder(null);
        setNewStatus('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleCreateOrder = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    if (!selectedProductId || !orderDate || !orderStatus) {
      setFormError('Vui lòng chọn sản phẩm, ngày đặt hàng và trạng thái.');
      return;
    }

    if (offerPrice && Number(offerPrice) > Number(productPrice)) {
      setFormError('Giá bạn nhập phải bằng hoặc nhỏ hơn giá gợi ý.');
      return;
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          productId: selectedProductId,
          code: orderCode,
          link: selectedProductLink,
          orderDate: new Date(orderDate).toISOString(),
          status: orderStatus,
          amount: offerPrice ? Number(offerPrice) : Number(productPrice),
          price: Number(productPrice),
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMessage('Đã tạo đơn hàng thành công.');
        setOrderCode('');
        setOrderDate('');
        setOrderStatus('pending');
        setProductPrice('0');
        setOfferPrice('');
        setSelectedProductId('');
        setSelectedProductLink('');
        loadOrders(userId);
      } else {
        setFormError(result.error || 'Tạo đơn hàng thất bại.');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      setFormError('Tạo đơn hàng thất bại.');
    }
  };

  const handleClaimBonus = async (event) => {
    event.preventDefault();
    if (!bankAccount || !bankName) {
      alert('Vui lòng điền đầy đủ số tài khoản và tên ngân hàng.');
      return;
    }

    setBonusLoading(true);
    try {
      const response = await fetch('/api/users/claim-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          bankAccount,
          bankName,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setShowBonusForm(false);
        setBankAccount('');
        setBankName('');
        setSuccessMessage('Hệ thống sẽ thanh toán cho bạn trong vòng 6h.');
        loadOrders(userId);
        loadUserInfo(userId);
      } else {
        alert(result.error || 'Lỗi khi nhận bonus.');
      }
    } catch (error) {
      console.error('Error claiming bonus:', error);
      alert('Lỗi khi nhận bonus.');
    } finally {
      setBonusLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className='container'>
        <div className='card'>
          <h1>Bạn cần đăng nhập</h1>
          <p>Vui lòng đăng nhập để xem đơn hàng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='card'>
        <h1>Quản lý đơn hàng</h1>

        <div className='dashboard-header'>
          <div>
            <p className='welcome-text'>
              {isAdmin ? 'Admin' : 'Người dùng'}: <strong>{userName}</strong>
            </p>
            {!isAdmin && (
              <p className='welcome-text'>
                Mỗi đơn hàng hoàn thành sẽ nhận <strong>50,000 points</strong>.
              </p>
            )}
          </div>
          {!isAdmin && (
            <div>
              <p className='welcome-text'>
                Số dư khả dụng: <strong>{availablePoints} points</strong>
              </p>
              {availablePoints > 0 && (
                <button
                  type='button'
                  className='btn-primary'
                  onClick={() => setShowBonusForm(true)}
                >
                  Nhận bonus
                </button>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div className='order-search'>
            <label htmlFor='searchCode'>Tìm đơn hàng theo mã</label>
            <div className='search-row'>
              <input
                id='searchCode'
                type='text'
                placeholder='Nhập mã đơn hàng'
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
              />
              <button
                type='button'
                className='btn-primary'
                onClick={() => loadOrders(userId, true, searchCode)}
              >
                Tìm kiếm
              </button>
            </div>
          </div>
        )}

        {!isAdmin && (
          <form className='order-form' onSubmit={handleCreateOrder}>
            <h2>Tạo đơn hàng mới</h2>

            {formError && <div className='form-error'>{formError}</div>}
            {successMessage && (
              <div className='form-success'>{successMessage}</div>
            )}

            <div className='form-row'>
              <label htmlFor='productSelect'>Chọn sản phẩm</label>
              <select
                id='productSelect'
                value={selectedProductId}
                onChange={(e) => {
                  const productId = e.target.value;
                  setSelectedProductId(productId);
                  const product = products.find(
                    (item) => item.id === productId,
                  );
                  if (product) {
                    setOrderCode(product.link || product.id);
                    setSelectedProductLink(product.link || '');
                    setProductPrice(product.price || '0');
                    setOfferPrice('');
                  } else {
                    setOrderCode('');
                    setSelectedProductLink('');
                    setProductPrice('0');
                    setOfferPrice('');
                  }
                }}
                required
              >
                <option value=''>Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.link} - {product.price} VND
                  </option>
                ))}
              </select>
            </div>

            <div className='form-row'>
              <label>Link đặt hàng</label>
              <div className='copy-link-row'>
                <input
                  type='text'
                  readOnly
                  value={selectedProductLink}
                  placeholder='Link sẽ hiển thị ở đây khi chọn sản phẩm'
                />
                <button
                  type='button'
                  className='btn-secondary'
                  onClick={() => {
                    if (selectedProductLink) {
                      navigator.clipboard.writeText(selectedProductLink);
                      setSuccessMessage('Đã sao chép link vào bộ nhớ tạm.');
                    }
                  }}
                >
                  Sao chép
                </button>
              </div>
            </div>

            <div className='form-row'>
              <label>Giá gợi ý</label>
              <div className='suggested-price'>
                {Number(productPrice).toLocaleString()} VND
              </div>
            </div>

            <div className='form-row'>
              <label htmlFor='offerPrice'>Giá bạn muốn đặt</label>
              <input
                id='offerPrice'
                type='number'
                min='0'
                max={productPrice}
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                placeholder='Bằng hoặc nhỏ hơn giá gợi ý'
              />
            </div>

            <div className='form-row'>
              <label htmlFor='orderDate'>Ngày đặt hàng</label>
              <input
                id='orderDate'
                type='date'
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
                required
              />
            </div>

            <div className='form-row'>
              <label htmlFor='orderStatus'>Trạng thái</label>
              <select
                id='orderStatus'
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                required
              >
                <option value='pending'>Chờ xử lý</option>
                <option value='approved'>Được duyệt</option>
                <option value='rejected'>Bị từ chối</option>
                <option value='delivered'>Đã giao</option>
                <option value='completed'>Hoàn thành</option>
              </select>
            </div>

            <button type='submit' className='btn-primary'>
              Tạo đơn hàng
            </button>
          </form>
        )}

        {loading ? (
          <p>Đang tải...</p>
        ) : orders.length === 0 ? (
          <p>Không có đơn hàng nào.</p>
        ) : (
          <table className='orders-table'>
            <thead>
              <tr>
                <th>ID đơn hàng</th>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt hàng</th>
                <th>Trạng thái</th>
                <th>Trạng thái admin</th>
                <th>Số tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {order.code ||
                      order.orderCode ||
                      order.voucherCode ||
                      'N/A'}
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-badge status-${order.statusByAdmin || 'pending'}`}
                    >
                      {order.statusByAdmin || 'pending'}
                    </span>
                  </td>
                  <td>
                    {order.amount
                      ? Number(order.amount).toLocaleString() + ' VND'
                      : '0 VND'}
                  </td>
                  <td>
                    {editingOrder?.id === order.id ? (
                      <div className='edit-status'>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className='status-select'
                        >
                          <option value=''>Chọn trạng thái</option>
                          <option value='pending'>Chờ xử lý</option>
                          <option value='approved'>Được duyệt</option>
                          <option value='rejected'>Bị từ chối</option>
                          <option value='delivered'>Đã giao</option>
                          <option value='completed'>Hoàn thành</option>
                        </select>
                        <button
                          onClick={handleStatusUpdate}
                          className='btn-save'
                        >
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className='btn-cancel'
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingOrder(order);
                          setNewStatus(
                            isAdmin
                              ? order.statusByAdmin || 'pending'
                              : order.status,
                          );
                        }}
                        className='btn-edit'
                      >
                        Chỉnh sửa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {showBonusForm && (
          <div
            className='modal-overlay'
            onClick={() => setShowBonusForm(false)}
          >
            <div className='modal-content' onClick={(e) => e.stopPropagation()}>
              <h2>Nhận bonus</h2>
              <form onSubmit={handleClaimBonus}>
                <div className='form-row'>
                  <label htmlFor='bankAccount'>Số tài khoản</label>
                  <input
                    id='bankAccount'
                    type='text'
                    placeholder='Nhập số tài khoản'
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    required
                  />
                </div>

                <div className='form-row'>
                  <label htmlFor='bankName'>Tên ngân hàng</label>
                  <input
                    id='bankName'
                    type='text'
                    placeholder='Nhập tên ngân hàng'
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    required
                  />
                </div>

                <div className='form-row form-actions'>
                  <button
                    type='submit'
                    className='btn-primary'
                    disabled={bonusLoading}
                  >
                    {bonusLoading ? 'Đang xử lý...' : 'Xác nhận'}
                  </button>
                  <button
                    type='button'
                    className='btn-cancel'
                    onClick={() => setShowBonusForm(false)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
