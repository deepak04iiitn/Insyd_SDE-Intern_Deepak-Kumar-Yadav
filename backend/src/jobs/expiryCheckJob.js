import cron from 'node-cron';
import Stock from '../models/Stock.js';
import { sendExpiringSoonEmail, sendExpiredEmail } from '../services/emailService.js';


// Checking for items expiring soon (within 3 months) and expired items
// This function can be called immediately or scheduled via cron
export const runExpiryCheck = async () => {
  try {
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(now.getMonth() + 3);

    const allItems = await Stock.find({
      expiryDate: { $exists: true, $ne: null },
      isSoldOut: false,
    });

    const expiringSoonItems = [];
    const expiredItems = [];

    for(const item of allItems) {
      const expiryDate = new Date(item.expiryDate);
      
      if(expiryDate < now && !item.isExpired) {
        item.isExpired = true;
        item.isExpiringSoon = false;
        item.dateExpired = now;
        
        if(!item.dateExpiredNotified) {
          expiredItems.push(item);
          item.dateExpiredNotified = now;
        }
        
        await item.save();
      }
      else if (expiryDate >= now && expiryDate <= threeMonthsFromNow && !item.isExpiringSoon && !item.isExpired) {
        item.isExpiringSoon = true;
        
        if(!item.dateExpiringSoonNotified) {
          expiringSoonItems.push(item);
          item.dateExpiringSoonNotified = now;
        }
        
        await item.save();
      }
      else if (item.isExpiringSoon && expiryDate > threeMonthsFromNow) {
        item.isExpiringSoon = false;
        await item.save();
      }
    }

    const notificationEmail = 'deepak20yadav10@gmail.com';

    if(expiringSoonItems.length === 0 && expiredItems.length === 0) {
      return;
    }

    const emailPromises = [];

    if(expiringSoonItems.length > 0) {
      emailPromises.push(
        sendExpiringSoonEmail(notificationEmail, expiringSoonItems)
          .catch(error => {
            console.error('Error sending expiring soon email:', error);
            return { success: false, error: error.message };
          })
      );
    }

    if(expiredItems.length > 0) {
      emailPromises.push(
        sendExpiredEmail(notificationEmail, expiredItems)
          .catch(error => {
            console.error('Error sending expired email:', error);
            return { success: false, error: error.message };
          })
      );
    }

    await Promise.all(emailPromises);
  } catch (error) {
    console.error('Error in expiry check job:', error);
    throw error; 
  }
};


// Scheduling the job to run daily at 9:00 AM
export const startExpiryCheckJob = () => {
  cron.schedule('0 9 * * *', async () => {
    await runExpiryCheck();
  });

  console.log('Expiry check job scheduled to run daily at 9:00 AM');
};

