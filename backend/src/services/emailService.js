import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

// Sending email notification for expiring soon items
export const sendExpiringSoonEmail = async (adminEmail, items) => {

  try {

    if(!process.env.RESEND_API_KEY) {
      // console.error('RESEND_API_KEY is not set in environment variables');
      return { success: false, message: 'RESEND_API_KEY not configured' };
    }

    if(!adminEmail || !items || items.length === 0) {
      return { success: false, message: 'Invalid email or items' };
    }

    const itemsList = items.map(item => {

      const expiryDate = new Date(item.expiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.companyName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expiryDate}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity} ${item.quantityType}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #4f46e5; color: white; padding: 12px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>

        <body>
          <div class="container">
            <div class="header">
              <h2>⚠️ Items Expiring Soon Alert</h2>
            </div>
            <div class="content">
              <p>Dear Admin,</p>
              <p>The following items in your inventory are expiring within the next 3 months:</p>
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Company</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              <p style="margin-top: 20px;">Please take necessary action to manage these items before they expire.</p>
              <p>Best regards,<br>Inventory Management System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: `⚠️ Alert: ${items.length} Item(s) Expiring Soon`,
      html: htmlContent,
    });

    return { success: true, data: result };

  } catch (error) {
    console.error('Error sending expiring soon email:', error);
    return { success: false, error: error.message };
  }
};


// Sending email notification for expired items
export const sendExpiredEmail = async (adminEmail, items) => {

  try {

    if(!process.env.RESEND_API_KEY) {
      // console.error('RESEND_API_KEY is not set in environment variables');
      return { success: false, message: 'RESEND_API_KEY not configured' };
    }

    if(!adminEmail || !items || items.length === 0) {
      return { success: false, message: 'Invalid email or items' };
    }

    const itemsList = items.map(item => {

      const expiryDate = new Date(item.expiryDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.companyName}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${expiryDate}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity} ${item.quantityType}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #ef4444; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9fafb; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #dc2626; color: white; padding: 12px; text-align: left; }
            td { padding: 8px; border: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>🚨 Items Expired Alert</h2>
            </div>
            <div class="content">
              <p>Dear Admin,</p>
              <p><strong>URGENT:</strong> The following items in your inventory have expired:</p>
              <table>
                <thead>
                  <tr>
                    <th>Item Name</th>
                    <th>Company</th>
                    <th>Expiry Date</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsList}
                </tbody>
              </table>
              <p style="margin-top: 20px; color: #dc2626;"><strong>Please remove these items from your inventory immediately.</strong></p>
              <p>Best regards,<br>Inventory Management System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: adminEmail,
      subject: `🚨 URGENT: ${items.length} Item(s) Have Expired`,
      html: htmlContent,
    });

    return { success: true, data: result };
    
  } catch (error) {
    console.error('Error sending expired email:', error);
    return { success: false, error: error.message };
  }
};

