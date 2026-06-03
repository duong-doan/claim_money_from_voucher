'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    // Assume we need to be admin to access this
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
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const result = await response.json();

      if (result.success) {
        setUsers([...users, result.data]);
        setNewUser({ name: '', email: '', phone: '' });
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch('/api/users/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    try {
      const response = await fetch('/api/users/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      const result = await response.json();

      if (result.success) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (!adminId) {
    return (
      <div className='container'>
        <div className='card'>
          <h1>Bạn không có quyền truy cập</h1>
          <p>Chỉ admin mới có thể quản lý người dùng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container'>
      <div className='card'>
        <h1>Quản lý người dùng</h1>

        <div className='create-user-form'>
          <h2>Tạo người dùng mới</h2>
          <form onSubmit={handleCreateUser}>
            <div className='field'>
              <label>Họ và tên</label>
              <input
                type='text'
                placeholder='Nguyễn Văn A'
                required
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
              />
            </div>

            <div className='field'>
              <label>Email</label>
              <input
                type='email'
                placeholder='email@example.com'
                required
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
              />
            </div>

            <div className='field'>
              <label>Số điện thoại</label>
              <input
                type='tel'
                placeholder='0123456789'
                required
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser({ ...newUser, phone: e.target.value })
                }
              />
            </div>

            <button type='submit' className='btn-primary'>
              Tạo người dùng
            </button>
          </form>
        </div>

        <hr />

        <h2>Danh sách người dùng</h2>

        {loading ? (
          <p>Đang tải...</p>
        ) : users.length === 0 ? (
          <p>Không có người dùng nào.</p>
        ) : (
          <table className='users-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Role</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
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
                      user.name
                    )}
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
                  <td>{user.role}</td>
                  <td>
                    {editingUser?.id === user.id ? (
                      <>
                        <button onClick={handleUpdateUser} className='btn-save'>
                          Lưu
                        </button>
                        <button
                          onClick={() => setEditingUser(null)}
                          className='btn-cancel'
                        >
                          Hủy
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingUser(user)}
                          className='btn-edit'
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className='btn-delete'
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
