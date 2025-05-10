const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: `"Test Sender" <${process.env.EMAIL_USER}>`,
  to: "your_other_email@example.com",
  subject: "Testing SMTP",
  text: "This is a test email",
}, (err, info) => {
  if (err) {
    console.error("Error:", err);
  } else {
    console.log("Email sent:", info.response);
  }
});
