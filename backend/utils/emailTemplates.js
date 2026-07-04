export const getPasswordResetTemplate = (resetUrl, userName) => {
  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0d0d0d; color: #ffffff; border-radius: 12px; border: 1px solid #1a1a1a;">
      <h2 style="color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 30px; letter-spacing: 1px;">FLAVORDASH</h2>
      <p style="font-size: 16px; line-height: 1.6; color: #e6e6e6;">Dear ${userName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #e6e6e6;">We received a request to reset your password. Click the button below to choose a new password. This link is valid for 1 hour.</p>
      <div style="text-align: center; margin: 35px 0;">
        <a href="${resetUrl}" style="background-color: #d4af37; color: #000000; padding: 14px 30px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 6px; letter-spacing: 1px; display: inline-block; transition: all 0.3s ease;">RESET PASSWORD</a>
      </div>
      <p style="font-size: 14px; line-height: 1.6; color: #8c8c8c;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
      <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 30px 0;">
      <p style="font-size: 12px; text-align: center; color: #666666;">&copy; ${new Date().getFullYear()} FlavorDash Premium Kitchen. All rights reserved.</p>
    </div>
  `;
};

export const getContactNotificationTemplate = (contactData) => {
  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0d0d0d; color: #ffffff; border-radius: 12px; border: 1px solid #1a1a1a;">
      <h2 style="color: #d4af37; font-size: 20px; font-weight: 700; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; margin-bottom: 25px;">New Contact Inquiry Received</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #d4af37; width: 30%;">Name:</td>
          <td style="padding: 8px 0; color: #e6e6e6;">${contactData.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #d4af37;">Email:</td>
          <td style="padding: 8px 0; color: #e6e6e6;">${contactData.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #d4af37;">Subject:</td>
          <td style="padding: 8px 0; color: #e6e6e6;">${contactData.subject || 'N/A'}</td>
        </tr>
      </table>
      <div style="background-color: #121212; padding: 20px; border-radius: 8px; border-left: 4px solid #d4af37; margin-bottom: 25px;">
        <h4 style="margin-top: 0; color: #d4af37; margin-bottom: 10px;">Message:</h4>
        <p style="font-size: 15px; line-height: 1.6; color: #cccccc; margin: 0;">${contactData.message}</p>
      </div>
      <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 30px 0;">
      <p style="font-size: 12px; text-align: center; color: #666666;">FlavorDash Admin Portal Notification</p>
    </div>
  `;
};

export const getOrderConfirmationTemplate = (order, userName) => {
  const itemsList = order.items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a; color: #e6e6e6;">${item.name} x ${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #1a1a1a; color: #e6e6e6; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #0d0d0d; color: #ffffff; border-radius: 12px; border: 1px solid #1a1a1a;">
      <h2 style="color: #d4af37; font-size: 24px; font-weight: 700; text-align: center; margin-bottom: 10px; letter-spacing: 1px;">ORDER CONFIRMED</h2>
      <p style="text-align: center; color: #8c8c8c; font-size: 14px; margin-bottom: 30px;">Order ID: ${order._id}</p>
      
      <p style="font-size: 16px; line-height: 1.6; color: #e6e6e6;">Hi ${userName},</p>
      <p style="font-size: 16px; line-height: 1.6; color: #e6e6e6;">Thank you for dining with FlavorDash. Your order has been received and is being prepared with culinary excellence.</p>
      
      <h3 style="color: #d4af37; font-size: 18px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; margin-top: 30px; margin-bottom: 15px;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; color: #8c8c8c;">Item</th>
            <th style="text-align: right; padding-bottom: 10px; border-bottom: 2px solid #1a1a1a; color: #8c8c8c;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsList}
        </tbody>
      </table>

      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td style="color: #8c8c8c; padding: 4px 0;">Subtotal:</td>
          <td style="color: #e6e6e6; text-align: right; padding: 4px 0;">$${order.subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #8c8c8c; padding: 4px 0;">Delivery Fee:</td>
          <td style="color: #e6e6e6; text-align: right; padding: 4px 0;">$${order.deliveryFee.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="color: #8c8c8c; padding: 4px 0;">Tax (10%):</td>
          <td style="color: #e6e6e6; text-align: right; padding: 4px 0;">$${order.tax.toFixed(2)}</td>
        </tr>
        <tr style="font-size: 18px; font-weight: bold;">
          <td style="color: #d4af37; padding-top: 15px; border-top: 1px solid #1a1a1a;">Grand Total:</td>
          <td style="color: #d4af37; text-align: right; padding-top: 15px; border-top: 1px solid #1a1a1a;">$${order.grandTotal.toFixed(2)}</td>
        </tr>
      </table>

      <div style="background-color: #121212; padding: 20px; border-radius: 8px; margin-top: 30px; border: 1px solid #1a1a1a;">
        <h4 style="margin-top: 0; color: #d4af37; margin-bottom: 8px;">Delivery Details</h4>
        <p style="margin: 0; color: #cccccc; font-size: 14px; line-height: 1.5;">${order.deliveryAddress}</p>
      </div>

      <hr style="border: 0; border-top: 1px solid #1a1a1a; margin: 30px 0;">
      <p style="font-size: 12px; text-align: center; color: #666666;">Thank you for choosing FlavorDash. Bon Appetit!</p>
    </div>
  `;
};
