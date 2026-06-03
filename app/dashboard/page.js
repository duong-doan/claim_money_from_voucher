'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (!userId) {
      router.push('/login');
    } else {
      setUser({
        id: userId,
        name: userName,
        role: userRole,
      });
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminId');
    router.push('/');
  };

  if (loading) {
    return (
      <div className='container'>
        <div className='card'>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <main className='container'>
      <div className='card'>
        <h1>Bảng điều khiển</h1>

        <div className='dashboard-header'>
          <p className='welcome-text'>
            Chào mừng, <strong>{user?.name}</strong> ({user?.role})
          </p>
          <button onClick={handleLogout} className='btn-logout'>
            Đăng xuất
          </button>
        </div>

        <div className='dashboard-menu'>
          <a href='/orders' className='menu-item'>
            <h3>Quản lý đơn hàng</h3>
            <p>Xem và cập nhật trạng thái đơn hàng của bạn</p>
          </a>

          {user?.role === 'admin' && (
            <a href='/users' className='menu-item'>
              <h3>Quản lý người dùng</h3>
              <p>Tạo, chỉnh sửa, xóa người dùng</p>
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
