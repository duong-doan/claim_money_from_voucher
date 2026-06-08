// app/lib/mail.js

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBuyerRewardMail({
  email,
  userName,
  orderCode,
  rewardPoints = 50000,
  availablePoints = 0,
}) {
  try {
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: email,
      subject: `🎉 Đơn hàng ${orderCode} đã được xác nhận`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Chúc mừng ${userName || 'bạn'}!</h2>

          <p>Đơn hàng <strong>${orderCode}</strong> đã được Admin xác nhận hoàn thành.</p>

          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;">
              Điểm thưởng nhận được:
              <strong style="color:#16a34a;">
                +${Number(rewardPoints).toLocaleString()} points
              </strong>
            </p>
          </div>

          <div style="background:#eff6ff;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;">
              Số dư hiện tại:
              <strong>
                ${Number(availablePoints).toLocaleString()} points
              </strong>
            </p>
          </div>

          <p>
            Đăng nhập hệ thống để xem chi tiết đơn hàng và lịch sử điểm thưởng.
          </p>

          <br />

          <p>Trân trọng,</p>
          <p><strong>Đội ngũ hỗ trợ</strong></p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Send mail error:', error);
    throw error;
  }
}

export async function sendReferralRewardMail({
  email,
  referrerName,
  referredUserName,
  orderCode,
  rewardPoints = 20000,
  availablePoints = 0,
}) {
  try {
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM,
      to: email,
      subject: '🎉 Bạn vừa nhận được điểm thưởng giới thiệu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>🎉 Chúc mừng ${referrerName || 'bạn'}!</h2>

          <p>
            Người được bạn giới thiệu
            <strong>${referredUserName}</strong>
            đã hoàn thành đơn hàng thành công.
          </p>

          <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;">
              Điểm thưởng giới thiệu:
              <strong style="color:#16a34a;">
                +${Number(rewardPoints).toLocaleString()} points
              </strong>
            </p>
          </div>

          <div style="background:#eff6ff;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:0;">
              Số dư hiện tại:
              <strong>
                ${Number(availablePoints).toLocaleString()} points
              </strong>
            </p>
          </div>

          <p>
            Cảm ơn bạn đã tham gia chương trình giới thiệu thành viên.
          </p>

          <br />

          <p>Trân trọng,</p>
          <p><strong>Đội ngũ hỗ trợ</strong></p>
        </div>
      `,
    });

    return result;
  } catch (error) {
    console.error('Send referral mail error:', error);
    throw error;
  }
}
