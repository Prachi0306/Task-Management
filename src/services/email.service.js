const axios = require('axios');
const AppError = require('../utils/AppError');

class EmailService {
  constructor() {
    this.apiKey = process.env.BREVO_API_KEY;
    this.senderEmail = process.env.BREVO_SENDER_EMAIL || 'noreply@tasknexus.com';
    this.senderName = process.env.BREVO_SENDER_NAME || 'TaskNexus';
    this.apiUrl = 'https://api.brevo.com/v3/smtp/email';
  }

  async sendVerificationEmail(email, name, verificationCode) {
    if (!this.apiKey) {
      console.warn('BREVO_API_KEY is not set. Skipping email sending.');
      return;
    }

    const payload = {
      sender: { name: this.senderName, email: this.senderEmail },
      to: [{ email, name }],
      subject: 'Verify your TaskNexus Account',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #6d28d9; text-align: center;">TaskNexus</h2>
          <p>Hi ${name},</p>
          <p>Welcome to TaskNexus! To complete your registration, please verify your email address using the code below:</p>
          <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-radius: 8px; margin: 24px 0;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0f172a;">${verificationCode}</span>
          </div>
          <p style="color: #64748b; font-size: 14px;">This code will expire in 24 hours.</p>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">TaskNexus Task Management System</p>
        </div>
      `,
    };

    try {
      await axios.post(this.apiUrl, payload, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
    } catch (error) {
      console.error('Brevo API Error:', error.response?.data || error.message);
      throw AppError.internal('Failed to send verification email. Please try again later.');
    }
  }
}

module.exports = new EmailService();
