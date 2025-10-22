// 1. EmailService.js
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
      pool: true,
      maxConnections: 5,
      maxMessages: 100
    });

    // Verify transporter on initialization
    this.verifyTransporter();
  }

  async verifyTransporter() {
    try {
      await this.transporter.verify();
      console.log("Email transporter is ready");
    } catch (error) {
      console.error("Email transporter verification failed:", error);
    }
  }

  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(email, otp, productsCount) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const mailOptions = {
          from: `AgriConnect <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "AgriConnect - Order Verification OTP",
          html: this.generateOTPEmailTemplate(otp, productsCount),
          priority: 'high'
        };

        await this.transporter.sendMail(mailOptions);
        console.log(`OTP email sent successfully to ${email} on attempt ${attempt}`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`OTP email sending attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }

    console.error("All OTP email sending attempts failed:", lastError);
    throw new Error("Failed to send OTP email after multiple attempts");
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateOTPEmailTemplate(otp, productsCount) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AgriConnect - Order Verification</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); color: white; padding: 30px 20px; text-align: center; }
          .header h1 { font-size: 28px; margin-bottom: 10px; font-weight: 700; }
          .header p { font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; background: #f8f9fa; }
          .card { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 5px 15px rgba(0,0,0,0.08); margin-bottom: 25px; }
          .otp-display { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 25px; border-radius: 10px; text-align: center; margin: 25px 0; }
          .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; margin: 15px 0; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center; }
          .footer { background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center; font-size: 14px; }
          .harvest-link { color: #3CB371; font-weight: 600; text-decoration: none; }
          .btn-primary { display: inline-block; background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 10px 0; }
          .icon { font-size: 48px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌾 AgriConnect</h1>
            <p>Order Verification Required</p>
          </div>

          <div class="content">
            <div class="card">
              <div style="text-align: center; margin-bottom: 20px;">
                <div class="icon">🔒</div>
                <h2 style="color: #2E8B57; margin-bottom: 15px;">Secure Your Order</h2>
              </div>

              <p style="text-align: center; margin-bottom: 20px; font-size: 16px;">
                You are placing an order for <strong>${productsCount}</strong> item(s) on <span class="harvest-link">AgriConnect</span>.
                Use the verification code below to confirm your order.
              </p>

              <div class="otp-display">
                <p style="margin-bottom: 10px; opacity: 0.9; font-size: 14px;">YOUR VERIFICATION CODE</p>
                <div class="otp-code">${otp}</div>
                <p style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Valid for 10 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Alert:</strong> This code is confidential. Never share it with anyone.
                AgriConnect will never ask for this code via phone or email.
              </div>

              <p style="text-align: center; color: #666; font-size: 14px;">
                If you didn't initiate this request, please ignore this email or contact our
                <a href="mailto:support@agriconnect.com" style="color: #2E8B57;">support team</a> immediately.
              </p>
            </div>
          </div>

          <div class="footer">
            <p style="margin-bottom: 10px;">
              <strong>AgriConnect - Connecting Farmers to Markets</strong>
            </p>
            <p style="font-size: 12px; opacity: 0.8; margin-bottom: 10px;">
              Harvesting Opportunities, Growing Communities
            </p>
            <p style="font-size: 12px; opacity: 0.7;">
              &copy; 2024 AgriConnect. All rights reserved.<br>
              Ensuring secure agricultural transactions across the supply chain.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendAdminNotification(email, productsCount) {
    try {
      const mailOptions = {
        from: `AgriConnect <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || email,
        subject: "🆕 New Products Awaiting Approval - AgriConnect",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); color: white; padding: 25px; text-align: center; }
              .content { padding: 30px; background: #f8f9fa; }
              .card { background: white; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
              .btn { display: inline-block; background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; }
              .footer { background: #2c3e50; color: #ecf0f1; padding: 20px; text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌾 AgriConnect Admin</h1>
                <p>New Products Require Approval</p>
              </div>
              <div class="content">
                <div class="card">
                  <h2 style="color: #2E8B57; margin-bottom: 15px;">Action Required</h2>
                  <p>There are <strong style="color: #2E8B57;">${productsCount}</strong> new product listing(s) waiting for your approval in the AgriConnect admin panel.</p>
                  <p style="margin: 20px 0;">Please review them at your earliest convenience to ensure timely availability for our farming community.</p>
                  <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL}/admin/products/pending" class="btn">
                      📋 Review Products Now
                    </a>
                  </div>
                </div>
              </div>
              <div class="footer">
                <p>&copy; 2024 AgriConnect. Secure agricultural marketplace.</p>
              </div>
            </div>
          </body>
          </html>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log("Admin notification sent successfully");
    } catch (error) {
      console.error("Admin notification email error:", error);
      // Don't throw for admin notifications to avoid blocking main flow
    }
  }

  // Send OTP email (wrapper that generates OTP if not provided)
  async sendOTPEmail(email, otp = null, productsCount = 1) {
    try {
      const code = otp || this.generateOTP();
      console.log("🔐 Sending OTP:", code, "to", email);

      await this.sendOTP(email, code, productsCount);
      return code;
    } catch (error) {
      console.error("sendOTPEmail Error:", error);
      throw new Error("Failed to send OTP email: " + error.message);
    }
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(order, user) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log("📧 Sending order confirmation email to:", user.contact);

        const itemsHtml = order.items
          .map(
            (item) =>
              `<tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                  <strong>${item.product?.title || "Agricultural Product"}</strong>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">
                  ${item.quantity} ${item.unit || "unit"}
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">
                  ₹${(item.price * item.quantity).toLocaleString()}
                </td>
              </tr>`
          )
          .join("");

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #2E8B57 0%, #3CB371 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .order-card { background: white; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.08); }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #f8f9fa; padding: 12px; text-align: left; font-weight: 600; }
            .total-row { background: #2E8B57; color: white; font-weight: bold; }
            .footer { background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed</h1>
              <p>Thank you for choosing AgriConnect</p>
            </div>
            <div class="content">
              <div class="order-card">
                <h2 style="color: #2E8B57; margin-bottom: 20px;">Hello ${user.name},</h2>
                <p>Your order <strong>#${order._id}</strong> has been successfully placed and is being processed.</p>

                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style="text-align: center;">Quantity</th>
                      <th style="text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr class="total-row">
                      <td colspan="2" style="padding: 15px; text-align: right;"><strong>Total Amount:</strong></td>
                      <td style="padding: 15px; text-align: right;"><strong>₹${order.totalAmount.toLocaleString()}</strong></td>
                    </tr>
                  </tbody>
                </table>

                <p style="background: #e8f5e8; padding: 15px; border-radius: 8px; border-left: 4px solid #2E8B57;">
                  <strong>Next Steps:</strong> We will notify you when your order is shipped and provide tracking information.
                </p>

                <p style="margin-top: 20px;">Thank you for supporting agricultural commerce through <strong>AgriConnect</strong>!</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>AgriConnect - Growing Together</strong></p>
              <p style="font-size: 12px; opacity: 0.8;">Connecting farmers to markets, ensuring fair trade and fresh produce delivery.</p>
            </div>
          </div>
        </body>
        </html>
      `;

        await this.transporter.sendMail({
          from: `AgriConnect <${process.env.EMAIL_USER}>`,
          to: user.contact,
          subject: `✅ Order Confirmation - #${order._id} - AgriConnect`,
          html,
        });

        console.log("Order confirmation email sent successfully");
        return;
      } catch (error) {
        lastError = error;
        console.error(`Order confirmation email attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    console.error("All order confirmation email attempts failed:", lastError);
    throw new Error("Failed to send order confirmation email");
  }

  // Send order status update email
  async sendOrderStatusEmail(order, user, status) {
    const maxRetries = 2;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📧 Sending order status email (${status}) to:`, user.contact);

        let statusMessage = "";
        let statusIcon = "📦";
        let statusColor = "#2E8B57";

        switch (status) {
          case "confirmed":
            statusMessage = "Your order has been confirmed and is being processed.";
            statusIcon = "✅";
            statusColor = "#2E8B57";
            break;
          case "shipped":
            statusMessage = "Your order has been shipped and is on its way to you.";
            statusIcon = "🚚";
            statusColor = "#FFA500";
            break;
          case "delivered":
            statusMessage = "Your order has been successfully delivered.";
            statusIcon = "🎉";
            statusColor = "#008000";
            break;
          case "cancelled":
            statusMessage = "Your order has been cancelled as requested.";
            statusIcon = "";
            statusColor = "#DC3545";
            break;
          default:
            statusMessage = `Your order status has been updated to ${status}.`;
            statusIcon = "ℹ️";
        }

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}99 100%); color: white; padding: 30px; text-align: center; }
            .content { padding: 30px; background: #f8f9fa; }
            .status-card { background: white; border-radius: 10px; padding: 25px; margin: 20px 0; box-shadow: 0 5px 15px rgba(0,0,0,0.08); text-align: center; }
            .footer { background: #2c3e50; color: #ecf0f1; padding: 25px; text-align: center; }
            .icon { font-size: 48px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${statusIcon} Order Status Update</h1>
              <p>AgriConnect Order #${order._id}</p>
            </div>
            <div class="content">
              <div class="status-card">
                <div class="icon">${statusIcon}</div>
                <h2 style="color: ${statusColor}; margin-bottom: 15px;">Hello ${user.name},</h2>
                <p style="font-size: 18px; margin-bottom: 20px;">${statusMessage}</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Order ID:</strong> #${order._id}</p>
                  <p style="margin: 10px 0 0 0;"><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</p>
                </div>
                <p style="color: #666;">Thank you for choosing <strong>AgriConnect</strong> for your agricultural needs.</p>
              </div>
            </div>
            <div class="footer">
              <p><strong>AgriConnect - Fresh from Farm to You</strong></p>
              <p style="font-size: 12px; opacity: 0.8;">Ensuring quality and timely delivery of agricultural products.</p>
            </div>
          </div>
        </body>
        </html>
      `;

        await this.transporter.sendMail({
          from: `AgriConnect <${process.env.EMAIL_USER}>`,
          to: user.contact,
          subject: `${statusIcon} Order #${order._id} - Status Update - AgriConnect`,
          html,
        });

        console.log("Order status email sent successfully");
        return;
      } catch (error) {
        lastError = error;
        console.error(`Order status email attempt ${attempt} failed:`, error);

        if (attempt < maxRetries) {
          await this.delay(1000 * attempt);
        }
      }
    }

    console.error("All order status email attempts failed:", lastError);
    throw new Error("Failed to send order status email");
  }
}

module.exports = new EmailService();
