const User = require("../Models/userModel");
const jwt = require("../Utils/jwt");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { OAuth2Client } = require("google-auth-library");
const validator = require("validator");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Rate limiting and security middleware would be added at the route level
const authController = {
  // ---------------- Register ----------------
  register: async (req, res) => {
    try {
      const { name, Address, contact, role, password } = req.body;

      // Validate required fields
      if (!name || !contact || !password) {
        return res.status(400).json({
          message: "Name, contact, and password are required fields.",
        });
      }

      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long.",
        });
      }

      // Determine contact type and validate
      const contactType = validator.isEmail(contact) ? "email" : "phone";
      if (contactType === "email" && !validator.isEmail(contact)) {
        return res.status(400).json({
          message: "Please provide a valid email address.",
        });
      }
      if (contactType === "phone" && !validator.isMobilePhone(contact)) {
        return res.status(400).json({
          message: "Please provide a valid phone number.",
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ contact });
      if (existingUser) {
        return res.status(409).json({
          message: "User already exists with this contact.",
        });
      }

      // Hash password with salt
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = new User({
        name,
        Address,
        contactType,
        contact,
        role: role || "farmer", // Default role
        password: hashedPassword,
        lastLogin: new Date(),
      });

      await newUser.save();

      // Generate JWT with user info and expiration

      const token = jwt.generateToken({
        userId: newUser._id,
        role: newUser.role,
        contact: newUser.contact,
      });

      // Set secure HTTP-only cookie
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(201).json({
        message: "User registered successfully.",
        user: {
          id: newUser._id,
          name: newUser.name,
          role: newUser.role,
          contact: newUser.contact,
        },
      });
    } catch (err) {
      console.error("Register Error:", err);
      return res.status(500).json({
        message: "Error registering user. Please try again later.",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // ---------------- Login ----------------
// ---------------- Login ----------------
login: async (req, res) => {
  try {
    const { contact, password } = req.body;
    // console.log("body is ",req.body)
    if (!contact || !password) {
      return res.status(400).json({
        message: "Contact and password are required.",
      });
    }

    // Determine if contact is email or phone
    const isEmail = validator.isEmail(contact);
    const isPhone = validator.isMobilePhone(contact, "any", { strictMode: false });

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        message: "Invalid contact format. Must be a valid email or phone number.",
        errors: [
          {
            type: "field",
            value: contact,
            msg: "Invalid phone or email format",
            path: "contact",
            location: "body",
          },
        ],
      });
    }

    // Find user based on contact
    const user = await User.findOne({ contact }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found. Please register first.",
      });
    }

    // Google account check
    if (!user.password) {
      return res.status(403).json({
        message: "This account was created via Google. Please use Google login.",
      });
    }

    // Verify password securely
    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      return res.status(401).json({
        message: "Invalid credentials.",
      });
    }

    // Update login timestamp
    user.lastLogin = new Date();
    await user.save();

    // JWT generation
    // console.log("Generating token for user ID:", user._id,user.contact,user.role);

    const token = jwt.generateToken({
      userId: user._id.toString(),
      role: user.role,
      contact: user.contact,
    });
    // console.log("Generated JWT:", token);
    // Send HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        contact: user.contact,
        token: token,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      message: "Error during login. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });

  }
  },
  // ---------------- Logout ----------------
  logout: (req, res) => {
    // Clear the HTTP-only cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({ message: "Logged out successfully." });
  },

  // ---------------- Forgot Password ----------------
  forgotPassword: async (req, res) => {
    try {
      const { contact } = req.body;

      if (!contact) {
        return res.status(400).json({ message: "Contact is required." });
      }

      const user = await User.findOne({ contact });
      if (!user) {
        // Don't reveal whether user exists for security
        return res.status(200).json({
          message:
            "If an account with that contact exists, a reset link has been sent.",
        });
      }

      // Generate reset token with expiration
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      user.resetToken = resetToken;
      user.resetExpires = resetExpires;
      await user.save();

      // In production: Send email/SMS with reset link
      const resetLink = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      // console.log(`Reset link: ${resetLink}`); // Remove in production

      return res.status(200).json({
        message:
          "If an account with that contact exists, a reset link has been sent.",
      });
    } catch (err) {
      console.error("Forgot Password Error:", err);
      return res.status(500).json({
        message: "Error processing password reset request.",
      });
    }
  },

  // ---------------- Reset Password ----------------
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword, confirmPassword } = req.body;

      if (!newPassword || !confirmPassword) {
        return res.status(400).json({
          message: "Both password fields are required.",
        });
      }

      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          message: "Passwords do not match.",
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters long.",
        });
      }

      const user = await User.findOne({
        resetToken: token,
        resetExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({
          message: "Invalid or expired reset token.",
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update user and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetExpires = undefined;
      await user.save();

      return res.status(200).json({
        message:
          "Password reset successful. You can now login with your new password.",
      });
    } catch (err) {
      console.error("Reset Password Error:", err);
      return res.status(500).json({
        message: "Error resetting password.",
      });
    }
  },

  // ---------------- Google Login ----------------
  googleLogin: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: "Google token is required." });
      }

      // Verify Google token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload.email_verified) {
        return res.status(403).json({
          message: "Google email not verified.",
        });
      }

      const email = payload.email;
      const name = payload.name || "Google User";

      // Find or create user
      let user = await User.findOne({ contact: email });

      if (!user) {
        user = new User({
          name,
          contactType: "email",
          contact: email,
          role: "farmer", // Default role
          isGoogleAuth: true,
          lastLogin: new Date(),
        });
        await user.save();
      } else {
        // Update last login for existing user
        user.lastLogin = new Date();
        await user.save();
      }

      // Generate JWT
      const jwtToken = jwt.generateToken({
        userId: user._id,
        role: user.role,
        contact: user.contact,
      });

      // Set secure HTTP-only cookie
      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return res.status(200).json({
        message: "Google login successful.",
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          contact: user.contact,
        },
      });
    } catch (err) {
      console.error("Google Login Error:", err);
      return res.status(401).json({
        message: "Google authentication failed.",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
  },

  // ---------------- Get Current User ----------------
  getCurrentUser: async (req, res) => {
    try {
      // The user ID is attached to the request by the auth middleware
      const user = await User.findById(req.userId).select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      return res.status(200).json({
        user: {
          id: user._id,
          name: user.name,
          role: user.role,
          contact: user.contact,
          address: user.Address,
        },
      });
    } catch (err) {
      console.error("Get Current User Error:", err);
      return res.status(500).json({
        message: "Error fetching user data.",
      });
    }
  },
};

module.exports = authController;
