'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const userId = localStorage.getItem('userId');

    if (!userId) {
      router.push('/login');
      return;
    }

    setUser({
      id: userId,
      name: localStorage.getItem('userName'),
      role: localStorage.getItem('userRole'),
    });
  }, []);

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

  return (
    <div className='dashboard-layout'>
      {/* ── Topbar ── */}
      <header className='dashboard-topbar'>
        <h2 className='logo'>🎟 Voucher Claim</h2>

        <div className='user-section'>
          {user && (
            <>
              {/* Avatar initials */}
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1.5px solid rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                {getInitials(user.name)}
              </div>

              {/* Name + role — hide on very small screens */}
              <div className='user-info' style={{ display: 'none' }}>
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
