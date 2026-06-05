'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
    referralPhone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (form.referralPhone && form.referralPhone === form.phone) {
      setError(
        'Bạn không thể sử dụng số điện thoại của chính mình làm mã giới thiệu.',
      );
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push('/login');
      } else {
        setError(
          result.message || 'Đăng ký không thành công. Vui lòng thử lại.',
        );
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { icon: '📝', text: 'Điền đầy đủ thông tin đăng ký bên dưới.' },
    { icon: '⏳', text: 'Hệ thống tiếp nhận và xét duyệt yêu cầu.' },
    {
      icon: '💰',
      text: 'Sau duyệt, bạn được hướng dẫn đổi voucher nhận tiền.',
    },
    { icon: '📱', text: 'Dùng SĐT có Telegram để nhận thông báo kịp thời.' },
  ];

  return (
    <main className='home-page'>
      {/* ── Hero banner ── */}
      <div className='home-hero'>
        <div className='home-hero-inner'>
          <h1 className='home-title'>
            Đổi Voucher 🎁
            <br />
            Nhận Money 💸
          </h1>
          <p className='home-subtitle'>
            Tham gia ngay — hoàn toàn miễn phí, nhận tiền thực.
          </p>
        </div>
      </div>

      {/* ── Steps ── */}
      <div className='home-steps-wrap'>
        <p className='home-section-label'>Cách thức hoạt động</p>
        <div className='home-steps'>
          {steps.map((s, i) => (
            <div className='home-step' key={i}>
              <div className='home-step-num'>{i + 1}</div>
              <div className='home-step-icon'>{s.icon}</div>
              <p className='home-step-text'>{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Register form ── */}
      <div className='home-form-wrap'>
        <div className='home-form-card'>
          <div className='home-form-header'>
            <h2 className='home-form-title'>Tạo tài khoản</h2>
            <a href='/login' className='home-login-link'>
              Đã có tài khoản? <strong>ĐĂNG NHẬP</strong>
            </a>
          </div>

          {error && (
            <div className='home-error'>
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div
              style={{
                color: 'red',
                fontStyle: 'italic',
                textTransform: 'capitalize',
                marginBottom: '20px',
              }}
            >
              Vui lòng nhập SĐT và email thật <br /> (hỗ trợ telegram
              @BuyPhoneInfoBot)
            </div>
            {/* Name */}
            <div className='home-field'>
              <label htmlFor='reg-name'>Họ và tên</label>
              <div className='home-input-wrap'>
                <span className='home-input-icon'>👤</span>
                <input
                  id='reg-name'
                  type='text'
                  placeholder='Nguyễn Văn A'
                  required
                  autoComplete='name'
                  value={form.name}
                  onChange={update('name')}
                />
              </div>
            </div>
            {/* Referral */}
            <div className='home-field'>
              <label htmlFor='referral-phone'>
                Mã giới thiệu
                <span className='home-field-hint'>không bắt buộc</span>
              </label>

              <div className='home-input-wrap'>
                <span className='home-input-icon'>🎁</span>

                <input
                  id='referral-phone'
                  type='tel'
                  placeholder='Số điện thoại người giới thiệu'
                  inputMode='tel'
                  value={form.referralPhone}
                  onChange={update('referralPhone')}
                />
              </div>
            </div>
            {/* Email */}
            <div className='home-field'>
              <label htmlFor='reg-email'>Email</label>
              <div className='home-input-wrap'>
                <span className='home-input-icon'>✉️</span>
                <input
                  id='reg-email'
                  type='email'
                  placeholder='example@gmail.com'
                  required
                  autoComplete='email'
                  inputMode='email'
                  value={form.email}
                  onChange={update('email')}
                />
              </div>
            </div>
            {/* Phone */}
            <div className='home-field'>
              <label htmlFor='reg-phone'>
                Số điện thoại
                <span className='home-field-hint'>có Telegram</span>
              </label>
              <div className='home-input-wrap'>
                <span className='home-input-icon'>📞</span>
                <input
                  id='reg-phone'
                  type='tel'
                  placeholder='09xxxxxxxx'
                  required
                  autoComplete='tel'
                  inputMode='tel'
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
            </div>
            {/* Password */}
            <div className='home-field'>
              <label htmlFor='reg-pw'>Mật khẩu</label>
              <div className='home-input-wrap'>
                <span className='home-input-icon'>🔒</span>
                <input
                  id='reg-pw'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Tối thiểu 6 ký tự'
                  required
                  autoComplete='new-password'
                  value={form.password}
                  onChange={update('password')}
                />
                <button
                  type='button'
                  className='home-pw-toggle'
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button
              type='submit'
              className='home-submit-btn'
              disabled={loading}
            >
              {loading ? <span className='home-spinner' /> : '🚀 Đăng ký ngay'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
