const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const CommonModel = require("../models/CommonModel");
require("dotenv").config();
const secret = process.env.SECRET;
const nodemailer = require("nodemailer");


exports.register = async (req, res) => {

  const { name,email,password,interests,goals,weekly_time,role } = req.body;

   try {
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const existingUser = await CommonModel.findOne("users", { email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ status: 400, message: "User already exists." });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000);

    await CommonModel.create("pending_users", {
      name: name,
      interests:interests,
      goals:goals,
      role: role,
      weekly_time:weekly_time,
      email: normalizedEmail,
      password: await bcrypt.hash(trimmedPassword, 10),
      otp,
      created_at: new Date()
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    try {
      await transporter.sendMail({
        from: `"Api World" <${process.env.EMAIL_USER}>`,
        to: normalizedEmail,
        subject: "OTP Verification",
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OTP Verification - Skillkart</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .header {
      background-color: #004080;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 1px;
    }
    .content {
      padding: 30px;
      color: #333;
    }
    .content h2 {
      font-size: 20px;
      margin-bottom: 10px;
    }
    .otp-box {
      background-color: #f0f8ff;
      border: 2px dashed #004080;
      padding: 20px;
      text-align: center;
      font-size: 28px;
      font-weight: bold;
      color: #004080;
      margin: 20px 0;
      border-radius: 8px;
    }
    .footer {
      background-color: #f0f0f0;
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #777;
    }
  </style>
</head>
<body>

  <div class="container">
    <div class="header">
      <h1>Websharthi</h1>
    </div>
    <div class="content">
      <h2>Hello,</h2>
      <p>Your OTP for registration is:</p>
      <div class="otp-box">${otp}</div>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this OTP, please ignore this email.</p>
      <p>Thank you,<br><strong>Team Websharthi</strong></p>
    </div>
    <div class="footer">
      &copy; 2025 skillkart. All rights reserved.
    </div>
  </div>

</body>
</html>
`
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Delete the pending user record if email fails
      await CommonModel.deleteOne("pending_users", { email: normalizedEmail });
      return res.status(500).json({ 
        status: 500, 
        message: "Failed to send OTP email. Please try again." 
      });
    }

    res.status(200).json({
      status: 200,
      message: "OTP sent to email. Please verify to complete registration."
    });

  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error." });

  }
};
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await CommonModel.findOne("pending_users", { email: email.toLowerCase().trim(), otp });

    if (!user) {
      return res.status(400).json({ status: 400, message: "Invalid or expired OTP." });
    }

    // Move user from pending_users to users
    const { name, interests, goals, role, weekly_time, email: userEmail, password } = user;
    const newUser = await CommonModel.create("users", {
      name: name,
      interests: interests,
      goals: goals,
      role: role,
      weekly_time: weekly_time,
      email: userEmail,
      password
    });

    // Delete from pending
    await CommonModel.delete("pending_users", { email: user.email });
    
    // Create gamification entry for the new user
    await CommonModel.create("gamification", {
      user_id: newUser.id,
      xp: 0,
      badge: "Beginner",
      created_at: new Date(),
      updated_at: new Date()
    });

    // Generate JWT token for direct login
    const token = jwt.sign(
      { id: newUser.id, email: userEmail, role: role, name: name },
      secret,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      status: 201,
      message: "Registration complete. You are now logged in.",
      data: {
        user: {
          id: newUser.id,
          name: name,
          email: userEmail,
          role: role
        },
        token
      }
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error." });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: 400, message: "Email is required." });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await CommonModel.findOne("pending_users", { email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ status: 404, message: "User not found in pending registrations." });
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000);

    // Update OTP in DB
    await CommonModel.update("pending_users", { otp: newOtp, created_at: new Date() },{ email: normalizedEmail });

    // Resend Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"skillkart" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Resend OTP - skillKart",

      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#fff;padding:20px;border:1px solid #eee;">
          <h2 style="color:#004080;">Websharthi</h2>
          <p>Your new OTP for registration is:</p>
          <div style="background:#f0f8ff;padding:15px;border-left:5px solid #004080;font-size:22px;margin:10px 0;">${newOtp}</div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p>If you didn't request this, please ignore the message.</p>
          <p>Regards,<br><strong>Team Websharthi</strong></p>
        </div>`
    });

    return res.status(200).json({
      status: 200,
      message: "OTP resent successfully. Please check your email."
    });

  } catch (error) {
    console.error("Resend OTP error:", error.message);
    return res.status(500).json({ status: 500, message: "Internal server error." });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);

  if (!email || !password) {
    return res
      .status(400)
      .json({ status: 400, message: "Email and password are required." });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const trimmedPassword = password.trim();

    const user = await CommonModel.findOne("users", { email: normalizedEmail });
    if (!user) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password." });
    }
  
   const isPasswordValid = await bcrypt.compare(trimmedPassword, user.password);
    

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 401, message: "Invalid email or password." });
    }

    const token = jwt.sign({ id: user.id, email: user.Email,role:user.role,name:user.name }, secret, {
      expiresIn: "1h",
    });

   res.status(200).json({
  status: 200,
  message: "Login successful.",
  data: {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role:user.role,
    },
    token,
  },
    });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ status: 500, message: "Internal server error." });
  }
};

exports.validateToken = async (req, res) => {
  try {
    // Extract token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ status: 401, message: "Authorization token missing or malformed." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ status: 401, message: "Authorization token missing." });
    }

    // Verify the token
    const decoded = jwt.verify(token, secret);

    // Fetch the user based on the token payload
    const user = await CommonModel.findOne("users", { id: decoded.id });
    if (!user) {
      return res.status(401).json({ status: 401, message: "User not found." });
    }

    // Respond with user information if the token is valid
    res.status(200).json({
      status: 200,
      message: "Token is valid.",
      data: {
        id: user.id,
        firstName: user.Fullname, // Assuming 'Fullname' is the correct field
        email: user.Email,       // Assuming 'Email' is the correct field
      },
    });
  } catch (error) {
    // Handle errors (e.g., token verification failure or unexpected errors)
    console.error("Token validation error:", error.message);

    // Differentiate between expired/invalid token errors and server errors
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ status: 401, message: "Invalid or expired token." });
    }

    // Default to a generic server error response for unexpected issues
    res.status(500).json({ status: 500, message: "Internal server error." });
  }
};


  
  
