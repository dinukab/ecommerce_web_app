import nodemailer from "nodemailer";

import dotenv from "dotenv";
dotenv.config();

export async function sendInvoiceEmail({ to, subject, text, pdfBuffer, filename }: {
  to: string;
  subject: string;
  text: string;
  pdfBuffer: Buffer;
  filename: string;
}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  return transporter.sendMail({
    from: `"Your Store Name" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text,
    attachments: [
      {
        filename,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
}