import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key from environment
const sendgridApiKey = process.env.SENDGRID_API_KEY
if (!sendgridApiKey) {
  console.error('❌ SENDGRID_API_KEY environment variable is not set')
} else {
  sgMail.setApiKey(sendgridApiKey)
  console.log('✅ SendGrid initialized')
}

interface EmailOptions {
  to: string
  subject: string
  text?: string
  html?: string
}

export class MailsSender {
  private static readonly FROM_EMAIL = 'noreply@fusehealth.com'

  /**
   * Send a verification email to activate user account
   */
  static async sendVerificationEmail(email: string, activationToken: string, firstName: string, frontendOrigin?: string): Promise<boolean> {
    // Determine the frontend URL based on environment
    const getFrontendUrl = () => {
      // Use provided origin from the request
      if (frontendOrigin) {
        return frontendOrigin
      }

      if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL
      }

      // Fallback based on NODE_ENV
      if (process.env.NODE_ENV === 'production') {
        return 'https://app.fuse.health'
      }

      return 'http://localhost:3002'
    }

    const activationUrl = `${getFrontendUrl()}/verify-email?token=${activationToken}`
    console.log('🔗 Activation URL generated:', activationUrl)

    const msg: any = {
      to: email,
      from: this.FROM_EMAIL,
      subject: 'Activate Your Fuse Brand Partner Account',
      text: `Hello ${firstName},\n\nWelcome to Fuse! Please activate your brand partner account by clicking the link below:\n\n${activationUrl}\n\nThis link will expire in 24 hours.\n\nBest regards,\nThe Fuse Team`,
      // Disable click tracking to prevent URL rewriting
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false
        }
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Fuse!</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up as a brand partner with Fuse. To complete your registration and access your dashboard, please activate your account by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${activationUrl}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;">
                Activate Your Account
              </a>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              <strong>Note:</strong> This activation link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
            </p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <span style="word-break: break-all;">${activationUrl}</span>
              </p>
            </div>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              Best regards,<br>
              The Fuse Team
            </p>
          </div>
        </div>
      `
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Verification email sent to: ${email}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send verification email:', error)
      return false
    }
  }

  /**
   * Send a general email
   */
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    const msg: any = {
      to: options.to,
      from: this.FROM_EMAIL,
      subject: options.subject,
    }

    if (options.text) {
      msg.text = options.text
    }

    if (options.html) {
      msg.html = options.html
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Email sent to: ${options.to}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return false
    }
  }

  /**
   * Send welcome email after successful activation
   */
  static async sendWelcomeEmail(email: string, firstName: string, frontendOrigin?: string): Promise<boolean> {
    // Use same URL logic as verification email
    const getFrontendUrl = () => {
      // Use provided origin from the request (same as verification email)
      if (frontendOrigin) {
        return frontendOrigin
      }

      if (process.env.FRONTEND_URL) {
        return process.env.FRONTEND_URL
      }

      if (process.env.NODE_ENV === 'production') {
        return 'https://app.fuse.health'
      }

      return 'http://localhost:3002'
    }

    const frontendUrl = getFrontendUrl()

    const msg: any = {
      to: email,
      from: this.FROM_EMAIL,
      subject: 'Welcome to Fuse - Your Account is Active!',
      text: `Hello ${firstName},\n\nYour brand partner account has been successfully activated! You can now access your dashboard and start managing your brand presence.\n\nLogin at: ${frontendUrl}/signin\n\nBest regards,\nThe Fuse Team`,
      // Disable click tracking to prevent URL rewriting
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false
        }
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Account Activated!</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Congratulations! Your Fuse brand partner account has been successfully activated. You now have full access to your dashboard and can start managing your brand presence.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${frontendUrl}/signin" 
                 style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We're excited to have you as a partner. If you have any questions or need assistance, please don't hesitate to reach out to our support team.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              Best regards,<br>
              The Fuse Team
            </p>
          </div>
        </div>
      `
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Welcome email sent to: ${email}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error)
      return false
    }
  }

  /**
   * Send patient welcome email with temporary password
   */
  static async sendPatientWelcomeEmail(
    email: string,
    firstName: string,
    temporaryPassword: string,
    clinicName?: string
  ): Promise<boolean> {
    const getFrontendUrl = () => {
      if (process.env.PATIENT_PORTAL_URL) {
        return process.env.PATIENT_PORTAL_URL
      }

      if (process.env.NODE_ENV === 'production') {
        return 'https://patient.fuse.health'
      }

      return 'http://localhost:3002'
    }

    const loginUrl = `${getFrontendUrl()}/login`
    const clinic = clinicName || 'Your Healthcare Provider'

    const msg: any = {
      to: email,
      from: this.FROM_EMAIL,
      subject: `Welcome to ${clinic} Patient Portal`,
      text: `Hello ${firstName},\n\nYour patient account has been created. You can now access your patient portal using the following credentials:\n\nEmail: ${email}\nTemporary Password: ${temporaryPassword}\n\nLogin at: ${loginUrl}\n\nFor your security, we recommend changing your password after your first login.\n\nBest regards,\n${clinic}`,
      // Disable click tracking
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: true // Track opens for patient engagement
        }
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Your Patient Portal!</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">Hello ${firstName},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Your patient account with <strong>${clinic}</strong> has been created. You can now access your patient portal to view your health information, manage appointments, and communicate with your care team.
            </p>
            
            <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #e5e7eb;">
              <h3 style="margin-top: 0; color: #333;">Your Login Credentials</h3>
              <p style="margin: 10px 0; color: #666;">
                <strong>Email:</strong> ${email}
              </p>
              <p style="margin: 10px 0; color: #666;">
                <strong>Temporary Password:</strong> 
                <span style="background-color: #fef3c7; padding: 4px 8px; border-radius: 4px; font-family: monospace; color: #92400e;">
                  ${temporaryPassword}
                </span>
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold; 
                        display: inline-block;">
                Access Patient Portal
              </a>
            </div>
            
            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-size: 14px; margin: 0;">
                <strong>🔒 Security Tip:</strong> For your security, we recommend changing your password after your first login.
              </p>
            </div>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              Best regards,<br>
              ${clinic}
            </p>
            <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">
              If you didn't expect this email, please contact your healthcare provider.
            </p>
          </div>
        </div>
      `
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Patient welcome email sent to: ${email}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send patient welcome email:', error)
      return false
    }
  }

  /**
   * Send a 6-digit verification code for email sign-in
   */
  static async sendVerificationCode(email: string, code: string, firstName?: string): Promise<boolean> {
    const greeting = firstName ? `Hello ${firstName}` : 'Hello';

    const msg: any = {
      to: email,
      from: this.FROM_EMAIL,
      subject: 'Your Fuse Verification Code',
      text: `${greeting},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.\n\nBest regards,\nThe Fuse Team`,
      // Disable click tracking
      trackingSettings: {
        clickTracking: {
          enable: false
        },
        openTracking: {
          enable: false
        }
      },
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Verification Code</h1>
          </div>
          
          <div style="padding: 40px 30px; background-color: #f8f9fa;">
            <h2 style="color: #333; margin-top: 0;">${greeting},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Use this verification code to continue:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <div style="background-color: #f3f4f6; 
                          padding: 20px; 
                          border-radius: 12px; 
                          display: inline-block;
                          border: 2px solid #e5e7eb;">
                <span style="font-size: 36px; 
                            font-weight: bold; 
                            letter-spacing: 8px; 
                            color: #667eea;
                            font-family: 'Courier New', monospace;">
                  ${code}
                </span>
              </div>
            </div>
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              <strong>This code will expire in 10 minutes.</strong>
            </p>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <div style="background-color: #333; padding: 20px; text-align: center;">
            <p style="color: #ccc; margin: 0; font-size: 14px;">
              Best regards,<br>
              The Fuse Team
            </p>
          </div>
        </div>
      `
    }

    try {
      await sgMail.send(msg)
      console.log(`✅ Verification code sent to: ${email}`)
      return true
    } catch (error) {
      console.error('❌ Failed to send verification code:', error)
      return false
    }
  }
}