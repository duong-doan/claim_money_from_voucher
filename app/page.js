'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [form, setForm] = useState({
    email: '',
    name: '',
    phone: '',
    password: '',
  });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        router.push('/login');
        return;
      }
    }
  };

  return (
    <main className='container'>
      <div className='card'>
        <div className='card-header'>
          <h1>🎁 Đổi Voucher Nhận Money</h1>
          <a href='/login' className='link-login'>
            Đã có tài khoản? Đăng nhập
          </a>
        </div>

        <p className='description'>
          Chương trình hỗ trợ đổi voucher và nhận tiền mặt.
        </p>

        <div className='guide'>
          <h3>Hướng dẫn</h3>

          <p>1. Điền đầy đủ thông tin đăng ký bên dưới.</p>

          <p>2. Hệ thống sẽ tiếp nhận yêu cầu và tiến hành xét duyệt.</p>

          <p>
            3. Sau khi được duyệt, bạn sẽ được hướng dẫn quy trình đổi voucher
            và nhận tiền.
          </p>

          <p>4. Vui lòng nhập chính xác số điện thoại đang sử dụng.</p>

          <p>
            5. Số điện thoại đăng ký nên có sử dụng Telegram để hệ thống có thể
            liên hệ khi cần thiết.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='field'>
            <label>Họ và tên</label>
            <input
              type='text'
              placeholder='Nguyễn Văn A'
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div className='field'>
            <label>Email</label>
            <input
              type='email'
              placeholder='example@gmail.com'
              required
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </div>

          <div className='field'>
            <label>Số điện thoại</label>
            <input
              type='tel'
              placeholder='09xxxxxxxx'
              required
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </div>

          <div className='field'>
            <label>Mật khẩu</label>
            <input
              type='password'
              placeholder='Nhập mật khẩu'
              required
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value,
                })
              }
            />
          </div>

          <button type='submit'>Đăng ký ngay</button>
        </form>
      </div>
    </main>
  );
}
