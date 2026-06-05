'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname, redirect } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userId = localStorage.getItem('userId');

        if (!userId) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `/api/users/get-by-id?userId=${encodeURIComponent(userId)}`,
        );

        const result = await response.json();

        if (!result.success) {
          localStorage.clear();
          router.push('/login');
          return;
        }

        setUser({
          id: result.data.id,
          name: result.data.name,
          role: result.data.role,
        });

        setLoading(false);
      } catch (error) {
        console.error(error);
        localStorage.clear();
        router.push('/login');
      }
    };

    loadUser();
  }, [router]);

  useEffect(() => {
    router.replace('/dashboard/orders');
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/');
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);

    if (tab === 'orders') {
      router.push('/dashboard/orders');
    }

    if (tab === 'users') {
      router.push('/dashboard/users');
    }
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
    <main className='dashboard-layout'>
      {/* TABS */}
      <div className='tabs'>
        <button
          className={`tab ${pathname === '/dashboard/orders' ? 'active' : ''}`}
          onClick={() => router.push('/dashboard/orders')}
        >
          Quản lý đơn hàng
        </button>

        {user?.role === 'admin' && (
          <button
            className={`tab ${pathname === '/dashboard/users' ? 'active' : ''}`}
            onClick={() => router.push('/dashboard/users')}
          >
            Quản lý người dùng
          </button>
        )}
      </div>

      {/* CONTENT */}
      <div className='dashboard-content'>
        <div className='card'>
          <h2>Chọn chức năng từ tab phía trên</h2>
        </div>
      </div>
    </main>
  );
}
