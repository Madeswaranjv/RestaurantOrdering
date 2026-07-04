import nodemailer from 'nodemailer';

// Create a reusable transporter using SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // or custom SMTP
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

/**
 * Sends an email using Nodemailer
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 * @returns {Promise<boolean>} Success status
 */
const sendEmail = async ({ to, subject, html }) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;

  // Fallback to console log if email credentials are not set
  if (!emailUser || !emailPass || emailUser === 'dummy_email@example.com') {
    console.log('\n--- EMAIL SERVICE MOCK ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('HTML Body Snippet:');
    console.log(html.slice(0, 300) + '...');
    console.log('--- END EMAIL SERVICE MOCK ---\n');
    return true;
  }

  try {
    const mailOptions = {
      from: `"FlavorDash Premium" <${emailUser}>`,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    return false;
  }
};

export { sendEmail };
