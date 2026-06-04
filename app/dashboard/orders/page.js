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
  const [userTab, setUserTab] = useState('create');

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'approved', label: 'Được duyệt' },
    { value: 'rejected', label: 'Bị từ chối' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'completed', label: 'Hoàn thành' },
  ];

  const loadProductOptions = async () => {
    try {
      const response = await fetch(
        'https://64e307aebac46e480e780c02.mockapi.io/orders',
      );
      const data = await response.json();
      if (Array.isArray(data)) setProducts(data);
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
      url += admin ? `adminId=${id}` : `userId=${id}`;
      if (code) url += `&code=${encodeURIComponent(code)}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) setOrders(result.data);
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
        headers: { 'Content-Type': 'application/json' },
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

    if (!selectedProductId || !orderDate || !orderStatus || !orderCode.trim()) {
      setFormError(
        'Vui lòng chọn sản phẩm, ngày đặt hàng và nhập mã đơn hàng.',
      );
      return;
    }

    try {
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          productId: selectedProductId,
          code: orderCode,
          link: selectedProductLink,
          orderDate: new Date(orderDate).toISOString(),
          status: orderStatus,
          amount: Number(productPrice),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bankAccount, bankName }),
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

  // ── Reusable status select + save/cancel (used in both table and cards)
  const StatusEditor = ({ order }) => (
    <div className='edit-status'>
      <select
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
        className='status-select'
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button type='button' onClick={handleStatusUpdate} className='btn-save'>
        Lưu
      </button>
      <button
        type='button'
        onClick={() => setEditingOrder(null)}
        className='btn-cancel'
      >
        Hủy
      </button>
    </div>
  );

  const openEdit = (order) => {
    setEditingOrder(order);
    setNewStatus(isAdmin ? order.statusByAdmin || 'pending' : order.status);
  };

  const orderCode_ = (order) =>
    order.code || order.orderCode || order.voucherCode || 'N/A';

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
        {/* ── Tabs (user only) ── */}
        {!isAdmin && (
          <div className='user-order-tabs'>
            <button
              type='button'
              className={userTab === 'create' ? 'active' : ''}
              onClick={() => setUserTab('create')}
            >
              Tạo đơn hàng
            </button>
            <button
              type='button'
              className={userTab === 'list' ? 'active' : ''}
              onClick={() => setUserTab('list')}
            >
              Danh sách đơn hàng
            </button>
          </div>
        )}

        {/* ── Header ── */}
        <div className='dashboard-header'>
          {!isAdmin && (
            <>
              <p className='welcome-text'>
                Mỗi đơn hàng hoàn thành sẽ nhận <strong>50,000 points</strong>.
              </p>
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
            </>
          )}
        </div>

        {/* ── Admin search ── */}
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

        {/* ── Create order form ── */}
        {!isAdmin && userTab === 'create' && (
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
                  const val = e.target.value;
                  setSelectedProductId(val);
                  const product = products.find(
                    (item) => Number(item.price) === Number(val),
                  );
                  if (product) {
                    setSelectedProductLink(product.link || '');
                    setProductPrice(product.price || '0');
                  } else {
                    setSelectedProductLink('');
                    setProductPrice('0');
                  }
                  setOrderCode('');
                }}
                required
              >
                <option value=''>Chọn sản phẩm</option>
                {products.map((product) => (
                  <option key={product.link} value={product.price}>
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
                  placeholder='Link sẽ hiển thị khi chọn sản phẩm'
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
              <label>Giá gợi ý để nhận BONUS</label>
              <div className='suggested-price'>
                Nhỏ hơn hoặc bằng <br />
                <strong>{Number(productPrice).toLocaleString()} VND</strong>
              </div>
            </div>

            <div className='notice-box'>
              <strong>Lưu ý:</strong>
              <ul>
                <li>Sử dụng link trên để mua hàng trên Shopee.</li>
                <li>
                  Khi đặt hàng vui lòng bật dữ liệu di động (3G, 4G hoặc 5G),
                  không sử dụng Wifi.
                </li>
                <li>
                  Sau khi đặt hàng thành công, hãy quay lại và điền mã đơn hàng
                  vào ô bên dưới.
                </li>
              </ul>
            </div>

            <div className='form-row'>
              <label htmlFor='orderCode'>Mã đơn hàng</label>
              <input
                id='orderCode'
                type='text'
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
                placeholder='Nhập mã đơn hàng sau khi mua'
                required
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
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type='submit'
              className='btn-primary'
              style={{ width: '100%' }}
            >
              Tạo đơn hàng
            </button>
          </form>
        )}

        {/* ── Order list ── */}
        {(isAdmin || userTab === 'list') && (
          <>
            {loading ? (
              <p>Đang tải...</p>
            ) : orders.length === 0 ? (
              <p>Không có đơn hàng nào.</p>
            ) : (
              <>
                {/* Desktop table */}
                <div className='table-wrapper desktop-table'>
                  <table className='orders-table'>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Admin</th>
                        <th>Số tiền</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <td>{orderCode_(order)}</td>
                          <td>
                            {new Date(order.createdAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </td>
                          <td>
                            <span
                              className={`status-badge status-${order.status}`}
                            >
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
                            {Number(order.amount || 0).toLocaleString()} VND
                          </td>
                          <td>
                            {editingOrder?.id === order.id ? (
                              <StatusEditor order={order} />
                            ) : (
                              <button
                                type='button'
                                onClick={() => openEdit(order)}
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
                </div>

                {/* Mobile cards — inline editing */}
                <div className='mobile-orders'>
                  {orders.map((order) => {
                    const isEditingThis = editingOrder?.id === order.id;
                    return (
                      <div
                        key={order.id}
                        className={`order-card${isEditingThis ? ' is-editing' : ''}`}
                      >
                        <div className='order-row'>
                          <span>Mã đơn</span>
                          <strong>{orderCode_(order)}</strong>
                        </div>
                        <div className='order-row'>
                          <span>Ngày đặt</span>
                          <strong>
                            {new Date(order.createdAt).toLocaleDateString(
                              'vi-VN',
                            )}
                          </strong>
                        </div>
                        <div className='order-row'>
                          <span>Trạng thái</span>
                          <span
                            className={`status-badge status-${order.status}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className='order-row'>
                          <span>Admin</span>
                          <span
                            className={`status-badge status-${order.statusByAdmin || 'pending'}`}
                          >
                            {order.statusByAdmin || 'pending'}
                          </span>
                        </div>
                        <div className='order-row'>
                          <span>Số tiền</span>
                          <strong>
                            {Number(order.amount || 0).toLocaleString()} VND
                          </strong>
                        </div>

                        {/* Inline edit block — only shown when editing */}
                        {isEditingThis ? (
                          <div className='card-edit-block'>
                            <label>
                              {isAdmin
                                ? 'Cập nhật trạng thái Admin'
                                : 'Cập nhật trạng thái'}
                            </label>
                            <select
                              value={newStatus}
                              onChange={(e) => setNewStatus(e.target.value)}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <div className='card-edit-actions'>
                              <button
                                type='button'
                                className='btn-save'
                                onClick={handleStatusUpdate}
                              >
                                Lưu
                              </button>
                              <button
                                type='button'
                                className='btn-cancel'
                                onClick={() => setEditingOrder(null)}
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type='button'
                            className='btn-edit mobile-edit-btn'
                            onClick={() => openEdit(order)}
                          >
                            Chỉnh sửa trạng thái
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Bonus modal ── */}
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
