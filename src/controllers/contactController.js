import nodemailer from 'nodemailer';

// @desc    Send contact form email
// @route   POST /api/contact
// @access  Public
export const sendContactEmail = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    // Create a transporter using SMTP
    // You should configure these in your .env file
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Use Gmail as the service
      auth: {
        user: process.env.SMTP_EMAIL || 'tuitionhub0011@gmail.com', // Your email
        pass: process.env.SMTP_PASSWORD, // Your App Password
      },
    });

    // Mail options
    const mailOptions = {
      from: `"${name}" <${email}>`, // sender address
      to: 'tuitionhub0011@gmail.com', // list of receivers (the site owner)
      replyTo: email,
      subject: `New Contact Message from ${name}`, // Subject line
      text: `You received a new message from ${name} (${email}):\n\n${message}`, // plain text body
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `, // html body
    };

    // Send mail
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email. Please ensure SMTP_EMAIL and SMTP_PASSWORD are set in .env' });
  }
};
