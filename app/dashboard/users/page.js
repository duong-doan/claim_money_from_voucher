'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState('');
  console.log('users', users);

  useEffect(() => {
    const storedAdminId = localStorage.getItem('adminId');
    if (storedAdminId) {
      setAdminId(storedAdminId);
      loadUsers(storedAdminId);
    } else {
      setLoading(false);
    }
  }, []);

  const loadUsers = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/users/list?adminId=${id}`);
      const result = await response.json();
      if (result.success) {
        setUsers(result.data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setUsers(users.map((u) => (u.id === editingUser.id ? result.data : u)));
        setEditingUser(null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingId(userId);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deletingId }),
      });
      const result = await response.json();
      if (result.success) {
        setUsers(users.filter((u) => u.id !== deletingId));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const roleBadge = (role) =>
    role === 'admin' ? 'users-badge admin' : 'users-badge user';

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.phone?.includes(search),
  );
  console.log('filtered', filtered);

  if (!adminId) {
    return (
      <div className='container'>
        <div className='card'>
          <h1>Không có quyền truy cập</h1>
          <p>Chỉ admin mới có thể quản lý người dùng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='users-page'>
      {/* Header */}
      <div className='users-header'>
        <div>
          <h2 className='users-title'>Người dùng</h2>
          <p className='users-count'>
            {filtered.length} / {users.length} tài khoản
          </p>
        </div>
      </div>

      {/* Search */}
      <div className='users-search-wrap'>
        <span className='users-search-icon'>🔍</span>
        <input
          type='text'
          className='users-search-input'
          placeholder='Tìm theo tên, email, SĐT...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            className='users-search-clear'
            onClick={() => setSearch('')}
            aria-label='Xóa tìm kiếm'
          >
            ✕
          </button>
        )}
      </div>

      {loading ? (
        <div className='users-loading'>
          <span className='users-spinner' />
          <span>Đang tải...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className='users-empty'>
          <div className='users-empty-icon'>👥</div>
          <p>
            {search ? 'Không tìm thấy kết quả.' : 'Chưa có người dùng nào.'}
          </p>
        </div>
      ) : (
        <>
          {/* ── Desktop table ── */}
          <div className='users-desktop-table'>
            <table className='users-table'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên</th>
                  <th>Points</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Role</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user, idx) => (
                  <tr key={user.id}>
                    <td style={{ color: '#9ca3af', fontSize: 12 }}>
                      {idx + 1}
                    </td>

                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type='text'
                          value={editingUser.name}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className='users-name-cell'>
                          <div className='users-avatar'>
                            {(user.name || '?')[0].toUpperCase()}
                          </div>
                          <span>{user.name}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {user.availablePoints || 0}
                    </td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type='email'
                          value={editingUser.email}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <input
                          type='tel'
                          value={editingUser.phone}
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        user.phone
                      )}
                    </td>
                    <td>
                      <span className={roleBadge(user.role)}>{user.role}</span>
                    </td>
                    <td>
                      {editingUser?.id === user.id ? (
                        <div className='users-action-row'>
                          <button
                            onClick={handleUpdateUser}
                            className='btn-save'
                          >
                            Lưu
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className='btn-cancel'
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className='users-action-row'>
                          <button
                            onClick={() => setEditingUser(user)}
                            className='btn-edit'
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className='btn-delete'
                          >
                            🗑 Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Mobile cards ── */}
          <div className='users-mobile-list'>
            {filtered.map((user) => {
              const isEditing = editingUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  className={`users-card${isEditing ? ' is-editing' : ''}`}
                >
                  <div className='users-card-top'>
                    <div className='users-avatar large'>
                      {(user.name || '?')[0].toUpperCase()}
                    </div>
                    <div className='users-card-info'>
                      {isEditing ? (
                        <input
                          type='text'
                          className='users-edit-input'
                          value={editingUser.name}
                          placeholder='Tên'
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              name: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className='users-card-name'>{user.name}</p>
                      )}
                      <span className={roleBadge(user.role)}>{user.role}</span>
                    </div>
                  </div>

                  <div className='users-card-rows'>
                    <div className='users-card-row'>
                      <span className='ucr-label'>✉️ Email</span>
                      {isEditing ? (
                        <input
                          type='email'
                          className='users-edit-input'
                          value={editingUser.email}
                          placeholder='Email'
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              email: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className='ucr-val'>{user.email}</span>
                      )}
                    </div>
                    <div className='users-card-row'>
                      <span className='ucr-label'>📞 SĐT</span>
                      {isEditing ? (
                        <input
                          type='tel'
                          className='users-edit-input'
                          value={editingUser.phone}
                          placeholder='Số điện thoại'
                          onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              phone: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <span className='ucr-val'>{user.phone}</span>
                      )}
                    </div>
                  </div>

                  {isEditing ? (
                    <div className='users-card-actions'>
                      <button className='btn-save' onClick={handleUpdateUser}>
                        ✓ Lưu
                      </button>
                      <button
                        className='btn-cancel'
                        onClick={() => setEditingUser(null)}
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className='users-card-actions'>
                      <button
                        className='btn-edit'
                        style={{ flex: 1 }}
                        onClick={() => setEditingUser(user)}
                      >
                        ✏️ Chỉnh sửa
                      </button>
                      <button
                        className='btn-delete'
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── Delete confirm modal ── */}
      {deletingId && (
        <div
          className='users-modal-overlay'
          onClick={() => setDeletingId(null)}
        >
          <div className='users-modal' onClick={(e) => e.stopPropagation()}>
            <div className='users-modal-icon'>🗑️</div>
            <h3 className='users-modal-title'>Xóa người dùng?</h3>
            <p className='users-modal-desc'>
              Hành động này không thể hoàn tác. Tất cả dữ liệu của người dùng
              này sẽ bị xóa vĩnh viễn.
            </p>
            <div className='users-modal-actions'>
              <button
                className='btn-cancel'
                style={{ flex: 1 }}
                onClick={() => setDeletingId(null)}
              >
                Hủy
              </button>
              <button
                className='users-btn-confirm-delete'
                onClick={confirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
