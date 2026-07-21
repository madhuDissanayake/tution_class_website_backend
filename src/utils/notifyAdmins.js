import User from '../models/User.js';
import Notification from '../models/Notification.js';
import sendEmail from './sendEmail.js';

export const notifyAdmins = async (message, type = 'info', subjectUserId = null, extraData = {}) => {
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
      
      // Build rich email body based on type
      const buildEmailHtml = (adminName) => {
        if (type === 'registration_request' && extraData.teacher) {
          const t = extraData.teacher;
          return `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
              <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 28px 32px;">
                <h2 style="margin: 0; color: #fff; font-size: 20px; font-weight: 700;">🎓 New Teacher Registration</h2>
                <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">A teacher has completed registration fee payment and is awaiting approval.</p>
              </div>
              <div style="padding: 28px 32px; space-y: 16px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr><td style="padding: 8px 0; color: #94a3b8; width: 130px;">Name</td><td style="padding: 8px 0; color: #f1f5f9; font-weight: 600;">${t.name}</td></tr>
                  <tr><td style="padding: 8px 0; color: #94a3b8;">Email</td><td style="padding: 8px 0; color: #f1f5f9;">${t.email}</td></tr>
                  ${t.phone ? `<tr><td style="padding: 8px 0; color: #94a3b8;">Phone</td><td style="padding: 8px 0; color: #f1f5f9;">${t.phone}</td></tr>` : ''}
                  ${t.teacherDetails?.nic ? `<tr><td style="padding: 8px 0; color: #94a3b8;">NIC</td><td style="padding: 8px 0; color: #f1f5f9;">${t.teacherDetails.nic}</td></tr>` : ''}
                  ${t.teacherDetails?.subjects ? `<tr><td style="padding: 8px 0; color: #94a3b8;">Subjects</td><td style="padding: 8px 0; color: #f1f5f9;">${t.teacherDetails.subjects}</td></tr>` : ''}
                  ${t.teacherDetails?.qualifications ? `<tr><td style="padding: 8px 0; color: #94a3b8;">Qualifications</td><td style="padding: 8px 0; color: #f1f5f9;">${t.teacherDetails.qualifications}</td></tr>` : ''}
                </table>
                <div style="margin-top: 24px; text-align: center;">
                  <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin#pending-users" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">
                    Review in Admin Dashboard →
                  </a>
                </div>
              </div>
              <div style="padding: 16px 32px; background: #1e293b; font-size: 12px; color: #475569; text-align: center;">
                TuitionHub Admin Alert · ${new Date().toLocaleString()}
              </div>
            </div>
          `;
        }

        return `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #0f172a; color: #e2e8f0; border-radius: 12px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 24px 28px;">
              <h2 style="margin: 0; color: #fff; font-size: 18px; font-weight: 700;">TuitionHub Admin Alert</h2>
            </div>
            <div style="padding: 24px 28px;">
              <p style="margin: 0; font-size: 14px; line-height: 1.7; color: #cbd5e1;">${message}</p>
            </div>
            <div style="padding: 14px 28px; background: #1e293b; font-size: 12px; color: #475569; text-align: center;">
              TuitionHub · ${new Date().toLocaleString()}
            </div>
          </div>
        `;
      };

      // Emails to admins have been disabled to prevent delays. 
      // Notifications will only appear in the admin dashboard.
    }
  } catch (error) {
    console.error('Failed to notify admins:', error);
  }
};
