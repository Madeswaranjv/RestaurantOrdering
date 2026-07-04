import ContactRepository from '../repositories/ContactRepository.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendEmail } from '../services/emailService.js';
import { getContactNotificationTemplate } from '../utils/emailTemplates.js';

export const submitInquiry = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // 1. Create inquiry in DB
  const contact = await ContactRepository.create({
    name,
    email,
    subject,
    message
  });

  // 2. Alert administrator via Nodemailer
  const adminEmail = process.env.EMAIL_USER || 'admin@flavordash.com';
  const html = getContactNotificationTemplate(contact);
  
  sendEmail({
    to: adminEmail,
    subject: `FlavorDash Inquiry: ${subject || 'New Contact Request'}`,
    html
  }).catch(err => console.error(`Failed to send inquiry alert: ${err.message}`));

  res.status(201).json(
    new ApiResponse(201, { contact }, 'Inquiry submitted successfully. We will get back to you shortly.')
  );
});

export const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await ContactRepository.find({}, '', { createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { inquiries }, 'Support inquiries retrieved successfully')
  );
});
