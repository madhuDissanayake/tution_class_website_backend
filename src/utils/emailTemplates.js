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
        <h2 style="color: #10b981;">Account Approved!</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left;">
          Hi <strong>${name}</strong>,<br><br>
          Great news! Your TuitionHub account has been officially approved by our administration team. 
          You can now log in to access your full dashboard and start managing your classes.
        </p>
        <p style="text-align: left;"><a href="http://localhost:5173/login" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px;">Login Now</a></p>
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">The TuitionHub Team</p>
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
          Hi <strong>${studentName}</strong>,<br><br>
          Great news! <strong>${teacherName}</strong> has just approved your seat reservation for the class <strong>"${classTitle}"</strong>.
          <br><br>
          You are now officially enrolled in the class. Please log in to your Student Dashboard to find the class details and the group link.
        </p>
        <p style="text-align: left; margin-top: 30px;">
          <a href="http://localhost:5173/dashboard" style="background-color: #2563eb; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
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
        <h2 style="color: #f59e0b;">Registration Received! ⏳</h2>
        <p style="color: #64748b; font-size: 16px; text-align: left; line-height: 1.6;">
          Hi <strong>${name}</strong>,<br><br>
          Thank you for joining TuitionHub! Your registration has been received successfully. 
          <br><br>
          Your account is currently <strong>pending Admin approval</strong>. We will review your details and send you an email as soon as your account is activated.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
        <p style="color: #94a3b8; font-size: 13px; text-align: left;">Best Regards,<br>The TuitionHub Team</p>
      </div>
    </div>
  `;
};
