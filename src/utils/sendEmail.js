import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `TuitionHub <${process.env.SMTP_EMAIL || 'noreply@tuitionhub.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
      console.log('\n================== DEV MODE EMAIL SIMULATION ==================');
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Content:\n${options.html.replace(/<[^>]*>?/gm, '')}`); // Strip HTML for console readability
      console.log('===============================================================\n');
      return;
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
