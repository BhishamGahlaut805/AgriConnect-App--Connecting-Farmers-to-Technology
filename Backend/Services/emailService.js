// services/emailService.js
const nodemailer = require("nodemailer");
const { AppError } = require("../Utils/AppError");

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.NODE_ENV === "development" && !process.env.EMAIL_USER) {
      // Development using Ethereal
      nodemailer.createTestAccount().then((testAccount) => {
        this.transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.verifyConnection();
      });
    } else {
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        pool: true,
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000,
        rateLimit: 5,
      });
      this.verifyConnection();
    }
  }

  async verifyConnection() {
    if (!this.transporter) return;
    try {
      await this.transporter.verify();
      console.log("Email server connection established");
    } catch (error) {
      console.error("Email server connection failed:", error.message);
    }
  }

  async sendEmail({ to, subject, html, text, attachments = [] }) {
    const mailOptions = {
      from: `"AgriMarket" <${
        process.env.EMAIL_USER || "noreply@agrimarket.com"
      }>`,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
      to,
      subject,
      html,
      text,
      attachments,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("📧 Email sent:", {
        messageId: info.messageId,
        to,
        subject,
        timestamp: new Date().toISOString(),
      });
      return info;
    } catch (error) {
      console.error("Email sending failed:", {
        error: error.message,
        to,
        subject,
      });
      throw new AppError(`Failed to send email: ${error.message}`, 500);
    }
  }

  // Simple HTML templates without EJS
  generateOrderConfirmationHTML(order, user) {
    return `
      <h2>Order Confirmation - ${order.orderId}</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order placed on ${new Date(
        order.createdAt,
      ).toLocaleDateString()}.</p>
      <p>Estimated Delivery: ${new Date(
        order.estimatedDelivery,
      ).toLocaleDateString()}</p>
      <p>Order Total: ₹${order.total}</p>
      <p>Regards, <br/> AgriMarket Team</p>
    `;
  }

  async sendOrderConfirmationEmail(order, user) {
    const htmlContent = this.generateOrderConfirmationHTML(order, user);

    return this.sendEmail({
      to: user.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: htmlContent,
      attachments: [
        {
          filename: "order-summary.pdf",
          content: "This would be a PDF buffer in real implementation",
          contentType: "application/pdf",
        },
      ],
    });
  }

  async sendOTPEmail(email, otpCode, purpose = "verification") {
    const htmlContent = `
      <h3>OTP for ${purpose}</h3>
      <p>Your OTP is: <strong>${otpCode}</strong></p>
      <p>This OTP will expire in 30 minutes.</p>
    `;
    return this.sendEmail({
      to: email,
      subject: `OTP for ${purpose} - AgriMarket`,
      html: htmlContent,
      text: `Your OTP for ${purpose} is ${otpCode}. Expires in 30 minutes.`,
    });
  }

  async sendOrderStatusEmail(order, user, status) {
    const statusMap = {
      confirmed: "Confirmed ✅",
      processing: "Processing ⚙️",
      shipped: "Shipped 🚚",
      delivered: "Delivered ✅",
      cancelled: "Cancelled ❌",
    };
    const htmlContent = `
      <h3>Order ${statusMap[status] || "Update"}</h3>
      <p>Order ID: ${order.orderId}</p>
      <p>Hi ${user.name}, your order status is now <strong>${
        statusMap[status]
      }</strong>.</p>
      ${
        order.trackingNumber
          ? `<p>Tracking Number: ${order.trackingNumber}</p>`
          : ""
      }
      <p>Regards, <br/> AgriMarket Team</p>
    `;
    return this.sendEmail({
      to: user.email,
      subject: `Order ${statusMap[status]} - ${order.orderId}`,
      html: htmlContent,
    });
  }

  async sendDeliveryUpdateEmail(order, update) {
    const htmlContent = `
      <h3>Delivery Update</h3>
      <p>Order ID: ${order.orderId}</p>
      <p>Current Location: ${update.location}</p>
      <p>Estimated Arrival: ${update.estimatedTime}</p>
      <p>Regards, <br/> AgriMarket Team</p>
    `;
    return this.sendEmail({
      to: order.user.email,
      subject: `Delivery Update - Order ${order.orderId}`,
      html: htmlContent,
    });
  }

  async sendBulkOrderUpdates(orders, status) {
    const sendPromises = orders.map(async (order) => {
      try {
        const User = require("../Models/userModel");
        const user = await User.findById(order.user);
        if (!user) throw new Error("User not found");
        await this.sendOrderStatusEmail(order, user, status);
      } catch (error) {
        console.error(
          `Failed to send email for order ${order.orderId}:`,
          error,
        );
      }
    });
    return Promise.allSettled(sendPromises);
  }
}

// Singleton instance
const emailService = new EmailService();
module.exports = emailService;
