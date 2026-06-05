'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      const userId = localStorage.getItem('userId');

      if (!userId) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`/api/users/get-by-id?userId=${userId}`);

        const result = await response.json();

        if (!result.success) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        setUser(result.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
        setLoading(false);
        router.push('/login');
      }
    };

    loadUser();
  }, [router]);

  const logout = () => {
    localStorage.clear();
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const roleLabel = {
    admin: 'Quản trị viên',
    user: 'Người dùng',
  };

  if (loading) {
    return (
      <div className='container'>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      {/* ── Topbar ── */}
      <header className='dashboard-topbar'>
        <h2 className='logo'>🎟 Voucher Claim</h2>

        <div className='user-section'>
          {user && (
            <>
              {/* Avatar initials */}

              {/* Name + role — hide on very small screens */}
              <div className='user-info'>
                <span className='user-name'>{user.name}</span>
                <span className='user-role'>
                  {roleLabel[user.role] ?? user.role}
                </span>
              </div>
            </>
          )}

          <button type='button' onClick={logout} className='btn-logout'>
            Đăng xuất
          </button>
        </div>
      </header>

      {/* ── Nav tabs ── */}
      <div className='tabs'>
        <button
          type='button'
          className={pathname.includes('/orders') ? 'tab active' : 'tab'}
          onClick={() => router.push('/dashboard/orders')}
        >
          📦 Đơn hàng
        </button>

        {user?.role === 'admin' && (
          <button
            type='button'
            className={pathname.includes('/users') ? 'tab active' : 'tab'}
            onClick={() => router.push('/dashboard/users')}
          >
            👥 Người dùng
          </button>
        )}
      </div>

      {/* ── Page content ── */}
      <main className='dashboard-content'>{children}</main>
    </div>
  );
}
