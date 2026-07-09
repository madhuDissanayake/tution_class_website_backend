export const getOTPVerificationEmail = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
        
        <!-- Logo Area -->
        <div style="margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
            <span style="display: inline-block; background-color: #eff6ff; color: #2563eb; padding: 8px 12px; border-radius: 12px; margin-right: 8px;">🎓</span>
            Tuition<span style="color: #2563eb;">Hub</span>
          </h1>
        </div>

        <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Verify your email address</h2>
        
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: left;">
          Hi <strong style="color: #0f172a;">${name}</strong>,<br><br>
          Thank you for joining TuitionHub! We're thrilled to have you on board. To complete your registration and secure your account, please use the verification code below:
        </p>

        <div style="background-color: #eff6ff; padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #bfdbfe;">
          <span style="font-family: monospace; font-size: 42px; font-weight: bold; color: #2563eb; letter-spacing: 8px;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 40px; text-align: left;">
          This code will expire in 10 minutes for security reasons. If you didn't create an account with TuitionHub, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 32px;">

        <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: left;">
          Best regards,<br>
          <strong style="color: #64748b;">The TuitionHub Team</strong>
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} TuitionHub. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const getPasswordResetEmail = (name, otp) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); text-align: center;">
        
        <!-- Logo Area -->
        <div style="margin-bottom: 30px;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">
            <span style="display: inline-block; background-color: #eff6ff; color: #2563eb; padding: 8px 12px; border-radius: 12px; margin-right: 8px;">🎓</span>
            Tuition<span style="color: #2563eb;">Hub</span>
          </h1>
        </div>

        <h2 style="color: #1e293b; font-size: 24px; font-weight: 800; margin-bottom: 16px;">Reset Your Password</h2>
        
        <p style="color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 32px; text-align: left;">
          Hi <strong style="color: #0f172a;">${name}</strong>,<br><br>
          We received a request to reset your TuitionHub password. Please use the verification code below to set up a new password:
        </p>

        <div style="background-color: #fef2f2; padding: 24px; border-radius: 16px; margin-bottom: 32px; border: 1px solid #fecaca;">
          <span style="font-family: monospace; font-size: 42px; font-weight: bold; color: #ef4444; letter-spacing: 8px;">${otp}</span>
        </div>

        <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 40px; text-align: left;">
          This code will expire in 10 minutes. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 32px;">

        <p style="color: #94a3b8; font-size: 13px; margin: 0; text-align: left;">
          Best regards,<br>
          <strong style="color: #64748b;">The TuitionHub Team</strong>
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <p style="color: #94a3b8; font-size: 12px;">© ${new Date().getFullYear()} TuitionHub. All rights reserved.</p>
      </div>
    </div>
  `;
};

export const getAccountApprovedEmail = (name) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #10b981;">Account Approved! 🎉</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${name}</strong>,<br><br>
          We are pleased to inform you that your TuitionHub account has been officially approved by our administration team. 
          <br><br>
          Your account is now fully active. You may proceed to log in to our platform using your registered credentials to access your dashboard.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Team</p>
      </div>
    </div>
  `;
};

export const getAccountRejectedEmail = (name) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #ef4444;">Account Update</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left;">
          Hi <strong>${name}</strong>,<br><br>
          Thank you for applying to TuitionHub. Unfortunately, after reviewing your application, our administration team has decided not to approve your account at this time.
        </p>
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">The TuitionHub Team</p>
      </div>
    </div>
  `;
};

export const getReservationApprovedEmail = (studentName, classTitle, teacherName) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #10b981;">Seat Reservation Confirmed! 🎉</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${studentName}</strong>,<br><br>
          We are pleased to inform you that your seat reservation for the class <strong>"${classTitle}"</strong> with <strong>${teacherName}</strong> has been officially approved.
          <br><br>
          You are now successfully enrolled in the class. We look forward to seeing you in the upcoming sessions.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Team</p>
      </div>
    </div>
  `;
};

export const getRegistrationPendingEmail = (name) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #f59e0b;">Registration Received ⏳</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${name}</strong>,<br><br>
          Thank you for registering with TuitionHub. We have successfully received your registration details.
          <br><br>
          Please note that your account is currently <strong>pending administrative approval</strong>. Our team will review your application and we will notify you via email as soon as your account has been activated.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Administration Team</p>
      </div>
    </div>
  `;
};

export const getClassCreatedEmail = (teacherName, classTitle) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #2563eb;">New Class Created</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${teacherName}</strong>,<br><br>
          Please be advised that the administration team has successfully created a new class for you titled <strong>"${classTitle}"</strong>.
          <br><br>
          Your class is now active and students may begin reserving seats.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Administration Team</p>
      </div>
    </div>
  `;
};

export const getSeatBookingRequestEmail = (teacherName, studentName, studentEmail, studentPhone, classTitle) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #f59e0b;">New Seat Booking Request</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${teacherName}</strong>,<br><br>
          A new student has requested to book a seat in your class <strong>"${classTitle}"</strong>.
          <br><br>
          <strong>Student Details:</strong><br>
          Name: ${studentName}<br>
          Email: ${studentEmail}<br>
          Phone: ${studentPhone}
          <br><br>
          This request is currently pending administrative approval. You will be notified once the administration processes the request.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Team</p>
      </div>
    </div>
  `;
};

export const getSeatBookingApprovedTeacherEmail = (teacherName, studentName, classTitle) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 40px 20px; border-radius: 16px;">
      <div style="background-color: #ffffff; padding: 40px; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); text-align: center;">
        <h1 style="color: #0f172a;">TuitionHub</h1>
        <h2 style="color: #10b981;">Seat Booking Approved</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Dear <strong>${teacherName}</strong>,<br><br>
          We are writing to notify you that the administration team has approved the seat booking request for <strong>${studentName}</strong> in your class <strong>"${classTitle}"</strong>.
          <br><br>
          The student is now officially enrolled in this class.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Administration Team</p>
      </div>
    </div>
  `;
};
