import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // If no email config is provided, log to console in development
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    if (process.env.NODE_ENV === 'development') {
      console.log('--------------------------------------------------');
      console.log('📧 DEVELOPMENT EMAIL MOCK');
      console.log('To:', options.email);
      console.log('Subject:', options.subject);
      console.log('Message:', options.message);
      console.log('--------------------------------------------------');
      return;
    }
    throw new Error('Email credentials not provided in .env');
  }

  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"Open Door" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: 
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
