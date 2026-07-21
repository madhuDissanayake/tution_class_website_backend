import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { getRegistrationPendingEmail } from './src/utils/emailTemplates.js';

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
      subject: 'Test Email Template',
      html: getRegistrationPendingEmail('Test User'),
    };

    console.log('Sending template email...');
    await transporter.sendMail(mailOptions);
    console.log('Template Email sent successfully!');
  } catch (error) {
    console.error('Error sending template email:', error);
  }
};

sendTestEmail();
