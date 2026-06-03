'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userRole', user.role);

        if (user.role === 'admin') {
          localStorage.setItem('adminId', user.id);
        }

        router.push('/dashboard');
      } else {
        setError(result.error || 'Số điện thoại hoặc mật khẩu không đúng');
      }
    } catch (err) {
      setError('Lỗi đăng nhập. Vui lòng thử lại.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='container'>
      <div className='card'>
        <h1>Đăng nhập</h1>

        {error && <p className='error-message'>{error}</p>}

        <form onSubmit={handleLogin}>
          <div className='field'>
            <label>Email hoặc số điện thoại</label>
            <input
              type='text'
              placeholder='admin@gmail.com hoặc 09xxxxxxxx'
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className='field'>
            <label>Mật khẩu</label>
            <input
              type='password'
              placeholder='Mật khẩu'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type='submit' disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className='register-link'>
          Chưa có tài khoản? <a href='/'>Đăng ký tại đây</a>
        </p>
      </div>
    </main>
  );
}
