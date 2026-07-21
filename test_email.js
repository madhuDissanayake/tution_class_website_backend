import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendTestEmail = async () => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `TuitionHub <${process.env.SMTP_EMAIL}>`,
      to: process.env.SMTP_EMAIL,
      subject: 'Test Email',
      text: 'This is a test email to verify SMTP configuration.',
    };

    console.log('Sending email...');
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

sendTestEmail();
