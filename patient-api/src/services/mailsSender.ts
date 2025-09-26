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
  private static readonly FROM_EMAIL = 'noreply@fuse.health'

  /**
   * Send a verification email to activate user account
   */
  static async sendVerificationEmail(email: string, activationToken: string, firstName: string): Promise<boolean> {
    // Determine the frontend URL based on environment
    const getFrontendUrl = () => {
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
  static async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    // Use same URL logic as verification email
    const getFrontendUrl = () => {
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
}