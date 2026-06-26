import User from '../models/User.js';
import Notification from '../models/Notification.js';
import sendEmail from './sendEmail.js';

export const notifyAdmins = async (message, type = 'info', subjectUserId = null) => {
  try {
    const admins = await User.find({ role: 'admin' });
    const notifications = admins.map((admin) => ({
      userId: admin._id,
      message,
      type,
      ...(type === 'registration_request' && subjectUserId ? { subjectUserId } : {}),
      ...(type !== 'registration_request' && subjectUserId ? { relatedId: subjectUserId } : {}),
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
      
      // Also send email to admins
      for (const admin of admins) {
        await sendEmail({
          to: admin.email,
          subject: 'TuitionHub Admin Alert',
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Admin Notification</h2>
              <p>${message}</p>
            </div>
          `
        });
      }
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};
