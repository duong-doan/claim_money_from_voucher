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
  const [productSelected, setProductSelected] = useState({});
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
  const [userData, setUserData] = useState('create');

  // Shipping code state: { [orderId]: string }
  const [shippingCodeInputs, setShippingCodeInputs] = useState({});
  // Track which orders are being saved
  const [savingShippingCode, setSavingShippingCode] = useState({});

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Chờ xác nhận' },
    { value: 'approved', label: 'Chờ lấy hàng' },
    { value: 'rejected', label: 'Bị huỷ' },
    { value: 'delivered', label: 'Chờ giao hàng' },
    { value: 'completed', label: 'Đã giao' },
  ];

  const getTodayProductCount = (productPrice) => {
    const today = new Date().toISOString().split('T')[0];

    return orders.filter((order) => {
      const orderDay = new Date(order.createdAt).toISOString().split('T')[0];

      return orderDay === today && Number(order.price) === Number(productPrice);
    }).length;
  };

  const getRemainingQuantity = (product) => {
    console.log('product', product);
    if (!product) return;
    const used = getTodayProductCount(product.price);

    return Math.max(0, Number(product.maxQuantity) - used);
  };

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
        const user = result.data;

        setPoints(user.points ?? 0);
        setAvailablePoints(user.availablePoints ?? 0);

        setUserName(user.name || '');
        setUserData(user);

        const admin = user.role === 'admin';

        setUserRole(user.role || 'user');
        setIsAdmin(admin);

        await loadOrders(user.id, admin);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');

    if (storedUserId) {
      setUserId(storedUserId);

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
      if (result.success) {
        setOrders(result.data);
        // Initialize shipping code inputs from existing data
        const inputs = {};
        result.data.forEach((o) => {
          if (o.shippingCode) inputs[o.id] = o.shippingCode;
        });
        setShippingCodeInputs((prev) => ({ ...inputs, ...prev }));
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save shipping code for a specific order
  const handleSaveShippingCode = async (orderId) => {
    const code = shippingCodeInputs[orderId] || '';
    if (!code.trim()) {
      alert('Vui lòng nhập mã vận chuyển.');
      return;
    }
    setSavingShippingCode((prev) => ({ ...prev, [orderId]: true }));
    try {
      const response = await fetch('/api/orders/update-order', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          shippingCode: code.trim(),
        }),
      });
      const result = await response.json();
      if (result.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? result.data : o)),
        );
        setSuccessMessage('Đã lưu mã vận chuyển thành công.');
      } else {
        alert(result.error || 'Lỗi khi lưu mã vận chuyển.');
      }
    } catch (error) {
      console.error('Error saving shipping code:', error);
      alert('Lỗi khi lưu mã vận chuyển.');
    } finally {
      setSavingShippingCode((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const handleStatusUpdate = async () => {
    if (!editingOrder || !newStatus) return;

    // If user (not admin) tries to set completed, require shippingCode
    if (!isAdmin && newStatus === 'completed') {
      const currentShipping =
        shippingCodeInputs[editingOrder.id] || editingOrder.shippingCode || '';
      if (!currentShipping.trim()) {
        alert(
          'Bạn cần cập nhật mã vận chuyển trước khi chuyển sang trạng thái "Đã giao".',
        );
        return;
      }
    }

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

    const product = products.find(
      (p) => Number(p.price) === Number(selectedProductId),
    );

    if (!product) {
      setFormError('Sản phẩm không tồn tại');
      return;
    }

    const remaining = getRemainingQuantity(product);

    if (remaining <= 0) {
      setFormError(`${product.nameProduct} đã đạt giới hạn đặt hàng hôm nay.`);
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
        setProductSelected({});
        await loadOrders(userId);
        setUserTab('list');
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
        setSuccessMessage(
          'Hệ thống sẽ thanh toán cho bạn trong thời gian sớm nhất.',
        );
        await loadOrders(userId);
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

  // Shipping code cell/block for a given order (user-facing only)

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

  const handleCopyPhone = async (phone) => {
    await navigator.clipboard.writeText(phone);
    setSuccessMessage('Đã sao chép mã giới thiệu');
  };

  return (
    <div className='container'>
      <div className='card'>
        {/* ── Header ── */}
        {!isAdmin && (
          <div className='dashboard-header'>
            <>
              <p className='welcome-text'>
                Mỗi đơn hàng hoàn thành sẽ nhận <strong>50,000 points</strong>.
              </p>
              <p className='welcome-text'>
                Sao chép mã giới thiệu (
                <span
                  onClick={() => handleCopyPhone(userData?.phone || '')}
                  style={{
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    color: '#1677ff',
                  }}
                >
                  {userData?.phone}
                </span>
                ) để nhận <strong>20,000 points/đơn</strong>.
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
          </div>
        )}
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
            <div
              className='form-row'
              style={{ textAlign: 'center', color: 'red' }}
            >
              <label style={{ color: 'red ' }}>
                BẠN CHỈ CẦN ĐẶT HÀNG <br /> CÒN LẠI ĐỂ ADMIN LO!!!
              </label>
            </div>

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

                  const remaining = getRemainingQuantity(product);

                  if (remaining <= 0) {
                    setFormError(
                      `Sản phẩm ${product.nameProduct} đã hết số lượng cho hôm nay.`,
                    );
                    return;
                  }

                  if (product) {
                    setSelectedProductLink(product.link || '');
                    setProductPrice(product.price || '0');
                    setProductSelected(product);
                  } else {
                    setSelectedProductLink('');
                    setProductPrice('0');
                    setProductSelected({});
                  }
                  setOrderCode('');
                }}
                required
              >
                <option value=''>Chọn sản phẩm</option>
                {products.map((product) => (
                  <option
                    key={product.link}
                    value={product.price}
                    disabled={getRemainingQuantity(product) <= 0}
                  >
                    {product.nameProduct} - {product.price} VND
                    {` (Còn ${getRemainingQuantity(product)}/${product.maxQuantity})`}
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
                  disabled={!selectedProductLink}
                  className='btn-secondary'
                  onClick={() => {
                    if (selectedProductLink) {
                      window.open(
                        selectedProductLink,
                        '_blank',
                        'noopener,noreferrer',
                      );
                    }
                  }}
                >
                  Mua ngay
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

            {/* ── Shipping code reminder above submit button ── */}
            <div className='shipping-reminder-box'>
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <p>
                Sau khi đơn hàng được giao, hãy vào{' '}
                <strong>tab "Danh sách đơn hàng"</strong> và cập nhật{' '}
                <strong>mã vận chuyển</strong> (mã tracking) từ ứng dụng Shopee
                của bạn.
              </p>
              <p style={{ marginTop: 4 }}>
                📦 Cách lấy mã vận chuyển: Vào <strong>Shopee → Đơn mua</strong>{' '}
                → chọn đơn hàng → nhấn{' '}
                <strong>"Xem chi tiết vận chuyển"</strong> → sao chép mã
                tracking.
              </p>
              <p style={{ marginTop: 4, color: '#d32f2f' }}>
                Bạn <strong>phải có mã vận chuyển</strong> mới được chuyển trạng
                thái sang <strong>"Đã giao"</strong> để nhận điểm thưởng.
              </p>
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
                  <div style={{ textAlign: 'center', color: 'green' }}>
                    SAU KHI ADMIN NHẬN ĐƯỢC ĐƠN VÀ CHUYỂN TRẠNG THÁI <br /> BẠN
                    SẼ NHẬN ĐƯỢC POINTS
                  </div>
                  <table className='orders-table'>
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Ngày đặt</th>
                        <th>Trạng thái</th>
                        <th>Admin</th>
                        <th>Số tiền</th>
                        <th>Mã vận chuyển</th>
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
                          {/* Shipping code column — user only */}
                          {!isAdmin ? (
                            <td>
                              <ShippingCodeField
                                order={order}
                                inline
                                shippingCodeInputs={shippingCodeInputs}
                                savingShippingCode={savingShippingCode}
                                setShippingCodeInputs={setShippingCodeInputs}
                                handleSaveShippingCode={handleSaveShippingCode}
                              />
                            </td>
                          ) : (
                            <td>{order.shippingCode}</td>
                          )}
                          {/* Admin sees shipping code read-only */}
                          {isAdmin && <td style={{ display: 'none' }} />}
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
                  <div style={{ textAlign: 'center', color: 'green' }}>
                    SAU KHI ADMIN NHẬN ĐƯỢC ĐƠN VÀ CHUYỂN TRẠNG THÁI <br /> BẠN
                    SẼ NHẬN ĐƯỢC POINTS
                  </div>
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
                          <span>Mã vận chuyển</span>
                          <span
                          // className={`status-badge status-${order.status}`}
                          >
                            {order.shippingCode}
                          </span>
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

                        {/* Shipping code block — user only */}
                        {!isAdmin ? (
                          <ShippingCodeField
                            order={order}
                            inline
                            shippingCodeInputs={shippingCodeInputs}
                            savingShippingCode={savingShippingCode}
                            setShippingCodeInputs={setShippingCodeInputs}
                            handleSaveShippingCode={handleSaveShippingCode}
                          />
                        ) : (
                          <div className='order-row'>
                            <span>Mã vận chuyển</span>
                            <strong>{order.shippingCode}</strong>
                          </div>
                        )}

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

      {/* ── Extra CSS for new elements ── */}
      <style>{`
        /* Shipping reminder box above submit */
        .shipping-reminder-box {
          background: #fff8e1;
          border: 1px solid #f9a825;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 16px;
          font-size: 14px;
          line-height: 1.6;
          color: #5d4037;
        }
        .shipping-reminder-box strong {
          color: #e65100;
        }
        .shipping-reminder-box p {
          margin: 4px 0 0;
        }

        /* Shipping code field */
        .shipping-block {
          margin-top: 10px;
          padding: 10px;
          background: #f0f7ff;
          border-radius: 8px;
          border: 1px solid #90caf9;
        }
        .shipping-inline {
          min-width: 220px;
        }
        .shipping-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
          color: #1565c0;
        }
        .shipping-required {
          color: #d32f2f;
          font-weight: 400;
        }
        .shipping-row {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .shipping-input {
          flex: 1;
          padding: 6px 10px;
          border: 1px solid #90caf9;
          border-radius: 6px;
          font-size: 13px;
        }
        .shipping-saved {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #2e7d32;
        }
      `}</style>
    </div>
  );
}

const ShippingCodeField = ({
  order,
  inline = false,
  shippingCodeInputs,
  savingShippingCode,
  setShippingCodeInputs,
  handleSaveShippingCode,
}) => {
  const orderId = order?.id || '';
  const saved = order?.shippingCode || '';
  const current = shippingCodeInputs?.[orderId] ?? saved;
  const isSaving = savingShippingCode?.[orderId] || false;

  console.log('ShippingCodeField render', order.id);

  useEffect(() => {
    console.log('mounted', order.id);

    return () => {
      console.log('unmounted', order.id);
    };
  }, []);

  return (
    <div className={inline ? 'shipping-inline' : 'shipping-block'}>
      {!inline && (
        <label className='shipping-label'>
          Mã vận chuyển{' '}
          {!saved && <span className='shipping-required'>(cần cập nhật)</span>}
        </label>
      )}
      <div className='shipping-row'>
        <input
          type='text'
          className='shipping-input'
          placeholder='Nhập mã vận chuyển từ Shopee'
          value={current}
          onChange={(e) =>
            setShippingCodeInputs((prev) => ({
              ...prev,
              [orderId]: e.target.value,
            }))
          }
        />
        <button
          type='button'
          className='btn-save'
          disabled={isSaving}
          onClick={() => handleSaveShippingCode(orderId)}
        >
          {isSaving ? '...' : 'Lưu'}
        </button>
      </div>
      {saved && <span className='shipping-saved'>✓ Đã lưu: {saved}</span>}
    </div>
  );
};
