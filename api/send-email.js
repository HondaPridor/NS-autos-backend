const nodemailer = require("nodemailer");

const ALLOWED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:5173",
  "https://nsauto.ae", 
];

function setCors(req, res) {
  const origin = req.headers.origin;
  const allow =
    origin && ALLOWED_ORIGINS.includes(origin) ? origin : ""; // empty -> no CORS
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Origin", allow);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  // If you ever need cookies, also set:
  // res.setHeader("Access-Control-Allow-Credentials", "true");
}

module.exports = async (req, res) => {
  setCors(req, res);

  // Handle the browser preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  const { name, email, phone, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      replyTo: email,
      subject: "💬 New Contact Form Submission - NS Auto Website",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background: #f9f9f9;">
          <h2 style="color: #e5b800;">New Contact Form Submission</h2>
          <p style="font-size: 16px;">You have received a new message via the <strong>NS Auto</strong> website contact form.</p>

          <table style="width: 100%; margin-top: 20px; font-size: 15px;">
            <tr><td style="font-weight: bold; padding: 8px;">Name:</td><td style="padding: 8px;">${name}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px;">Email:</td><td style="padding: 8px;">${email}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px;">Phone:</td><td style="padding: 8px;">${phone}</td></tr>
            <tr><td style="font-weight: bold; padding: 8px; vertical-align: top;">Message:</td><td style="padding: 8px; white-space: pre-wrap;">${message}</td></tr>
          </table>

          <hr style="margin-top: 30px;"/>
          <p style="font-size: 13px; color: #888;">Sent from the NS Auto website contact form.</p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Email sent successfully!" });
  } catch (err) {
    console.error("Error sending email:", err);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email." });
  }
};
