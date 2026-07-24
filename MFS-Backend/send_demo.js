require('dotenv').config();
const { sendEmail } = require('./src/services/emailService');

const otp = '824915';
const html = `
  <div style="background-color: #0d0d12; color: #ffffff; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; border-radius: 12px; max-width: 500px; margin: 0 auto; border: 1px solid #2a2a3e;">
    <h1 style="color: #ffffff; font-size: 24px; margin-bottom: 8px;">MFS Crypto</h1>
    <p style="color: #a0a0b0; font-size: 16px; margin-bottom: 30px;">Verify your identity to proceed</p>
    
    <div style="background-color: #1a1a26; padding: 24px; border-radius: 8px; margin-bottom: 30px;">
      <p style="color: #a0a0b0; font-size: 14px; margin-top: 0; margin-bottom: 12px;">Your one-time password (OTP) is:</p>
      <h2 style="color: #7b61ff; font-size: 36px; letter-spacing: 6px; margin: 0; font-weight: 700;">${otp}</h2>
    </div>
    
    <p style="color: #6b6b80; font-size: 12px;">This code expires in 10 minutes. Do not share this code with anyone.</p>
  </div>
`;

async function test() {
  try {
    await sendEmail({
      to: 'anmolsinha345@gmail.com',
      subject: 'Your MFS Crypto Verification Code',
      html,
    });
    console.log('Demo email sent successfully!');
  } catch(e) {
    console.error('Error sending email:', e);
  }
}
test();
