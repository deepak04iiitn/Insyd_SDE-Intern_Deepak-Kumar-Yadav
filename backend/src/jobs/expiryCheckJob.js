import cron from 'node-cron';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import { sendExpiringSoonEmail, sendExpiredEmail } from '../services/emailService.js';

/**
 * Check for items expiring soon (within 3 months) and expired items
 * Runs daily at 9:00 AM
 */
export const startExpiryCheckJob = () => {
  // Run daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running expiry check job...');
    
    try {
      const now = new Date();
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(now.getMonth() + 3);

      // Find all items with expiry dates that are not sold out
      const allItems = await Stock.find({
        expiryDate: { $exists: true, $ne: null },
        isSoldOut: false,
      });

      const expiringSoonItems = [];
      const expiredItems = [];

      for (const item of allItems) {
        const expiryDate = new Date(item.expiryDate);
        
        // Check if item is expired
        if (expiryDate < now && !item.isExpired) {
          item.isExpired = true;
          item.isExpiringSoon = false;
          item.dateExpired = now;
          
          // Only send email if not already notified
          if (!item.dateExpiredNotified) {
            expiredItems.push(item);
            item.dateExpiredNotified = now;
          }
          
          await item.save();
        }
        // Check if item is expiring soon (within 3 months) and not expired
        else if (expiryDate >= now && expiryDate <= threeMonthsFromNow && !item.isExpiringSoon && !item.isExpired) {
          item.isExpiringSoon = true;
          
          // Only send email if not already notified
          if (!item.dateExpiringSoonNotified) {
            expiringSoonItems.push(item);
            item.dateExpiringSoonNotified = now;
          }
          
          await item.save();
        }
        // If item is no longer expiring soon (expired or past 3 months threshold), update status
        else if (item.isExpiringSoon && expiryDate > threeMonthsFromNow) {
          item.isExpiringSoon = false;
          await item.save();
        }
      }

      // Get admin email addresses
      const admins = await User.find({ role: 'admin', isActive: true }).select('email');

      if (admins.length === 0) {
        console.log('No admin users found to send notifications');
        return;
      }

      // Send emails to all admins
      const emailPromises = [];

      if (expiringSoonItems.length > 0) {
        for (const admin of admins) {
          emailPromises.push(sendExpiringSoonEmail(admin.email, expiringSoonItems));
        }
        console.log(`Sent expiring soon notifications for ${expiringSoonItems.length} items`);
      }

      if (expiredItems.length > 0) {
        for (const admin of admins) {
          emailPromises.push(sendExpiredEmail(admin.email, expiredItems));
        }
        console.log(`Sent expired notifications for ${expiredItems.length} items`);
      }

      await Promise.all(emailPromises);

      console.log('Expiry check job completed successfully');
    } catch (error) {
      console.error('Error in expiry check job:', error);
    }
  });

  console.log('Expiry check job scheduled to run daily at 9:00 AM');
};

