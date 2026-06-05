'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const result = await response.json();

      if (result.success) {
        const user = result.data;
        localStorage.setItem('userId', user.id);
        localStorage.setItem('userName', user.name);
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
    <main className='login-page'>
      {/* Top decoration */}
      <div className='login-hero'>
        <div className='login-logo'>🎟</div>
        <h1 className='login-brand'>Voucher Claim</h1>
        <p className='login-tagline'>Đăng nhập để tiếp tục</p>
      </div>

      <div className='login-card-wrap'>
        <div className='login-card'>
          {error && (
            <div className='login-error'>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            <div className='login-field'>
              <label htmlFor='login-id'>Email hoặc số điện thoại</label>
              <div className='login-input-wrap'>
                <span className='login-input-icon'>👤</span>
                <input
                  id='login-id'
                  type='text'
                  placeholder='email@gmail.com hoặc 09xxxxxxxx'
                  required
                  autoComplete='username'
                  inputMode='email'
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className='login-field'>
              <label htmlFor='login-pw'>Mật khẩu</label>
              <div className='login-input-wrap'>
                <span className='login-input-icon'>🔒</span>
                <input
                  id='login-pw'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Nhập mật khẩu'
                  required
                  autoComplete='current-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type='button'
                  className='login-pw-toggle'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button
              type='submit'
              className='login-submit-btn'
              disabled={loading}
            >
              {loading ? <span className='login-spinner' /> : '🔑 Đăng nhập'}
            </button>
          </form>

          <div className='login-divider'>
            <span>Chưa có tài khoản?</span>
          </div>

          <a href='/' className='login-register-btn'>
            ✍️ Đăng ký miễn phí
          </a>
        </div>
      </div>
    </main>
  );
}
