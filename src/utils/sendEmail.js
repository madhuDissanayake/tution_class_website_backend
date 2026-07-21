import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const sendEmail = async (options) => {
  try {
    // FORCE STOP EMAILS AS PER USER REQUEST
    console.log('\n================== EMAIL SENDING DISABLED ==================');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('===============================================================\n');
    return;
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

export default sendEmail;
