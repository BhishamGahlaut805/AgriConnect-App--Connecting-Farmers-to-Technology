// services/emailService.js
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email, otp, productsCount) {
    try {
      const mailOptions = {
        from: `Agrimarket <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Agrimarket - Product Listing Verification OTP",
        html: this.generateOTPEmailTemplate(otp, productsCount),
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Email sending error:", error);
      throw new Error("Failed to send OTP email");
    }
  }

  generateOTPEmailTemplate(otp, productsCount) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #F9FAFB; padding: 30px; }
          .otp-box { background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
          .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Agrimarket Verification</h1>
          </div>
          <div class="content">
            <h2>Verify Your Product Listing</h2>
            <p>You are creating ${productsCount} product listing(s). Use the OTP below to verify your email and submit for admin approval.</p>

            <div class="otp-box">
              <p style="color: #6B7280; margin-bottom: 10px;">Your verification code:</p>
              <div class="otp-code">${otp}</div>
              <p style="color: #EF4444; font-size: 14px; margin-top: 10px;">
                This OTP is valid for 10 minutes. Do not share it with anyone.
              </p>
            </div>

            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 Agrimarket. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendAdminNotification(email, productsCount) {
    try {
      const mailOptions = {
        from: `Agrimarket <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || email,
        subject: "New Products Pending Approval",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4F46E5;">New Products Awaiting Approval</h2>
            <p>There are ${productsCount} new product(s) waiting for your approval in the Agrimarket admin panel.</p>
            <p>Please review them at your earliest convenience.</p>
            <a href="${process.env.FRONTEND_URL}/admin/products/pending"
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 20px;">
               Review Products
            </a>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Admin notification email error:", error);
    }
  }
}

module.exports = new EmailService();
