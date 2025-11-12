import SequenceRun from '../../models/SequenceRun'
import Sequence from '../../models/Sequence'
import MessageTemplate from '../../models/MessageTemplate'
import sgMail from '@sendgrid/mail'

type StepPayload = {
  id?: string
  type?: string
  templateId?: string
  timeSeconds?: number
  [key: string]: unknown
}

type RunPayload = {
  userDetails?: {
    firstName?: string
    lastName?: string
    email?: string
    phoneNumber?: string
    [key: string]: unknown
  }
  shippingInfo?: Record<string, unknown>
  selectedProducts?: Record<string, unknown>
  patientFirstName?: string
  patientName?: string
  [key: string]: unknown
} | null

const MERGE_FIELD_REGEX = /\{\{([^}]+)\}\}/g

const toSnakeCase = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\s+/g, '_').toLowerCase()

const buildTemplateContext = (run: SequenceRun, sequence: Sequence): Record<string, string> => {
  const payload = (run.payload ?? {}) as RunPayload
  const userDetails = payload?.userDetails ?? {}

  const firstName =
    payload?.patientFirstName ||
    userDetails.firstName ||
    (userDetails as any).first_name ||
    ''

  const lastName =
    userDetails.lastName ||
    (userDetails as any).last_name ||
    ''

  const fullName = payload?.patientName || `${firstName} ${lastName}`.trim()

  const entries: Record<string, string> = {
    sequence_name: sequence.name || '',
    patient_first_name: firstName || '',
    patient_name: fullName || '',
    patient_last_name: lastName || '',
    patient_email: userDetails.email || '',
    patient_phone_number: userDetails.phoneNumber || '',
    trigger_event: run.triggerEvent || '',
  }

  if (payload?.selectedPlan) {
    entries.selected_plan = String(payload.selectedPlan)
  }

  if (payload?.shippingInfo && typeof payload.shippingInfo === 'object') {
    for (const [key, value] of Object.entries(payload.shippingInfo)) {
      entries[`shipping_${toSnakeCase(key)}`] = value === undefined || value === null ? '' : String(value)
    }
  }

  return entries
}

const replaceTemplateVariables = (text: string, context: Record<string, string>) => {
  if (!text) return text

  return text.replace(MERGE_FIELD_REGEX, (_, token) => {
    const normalized = toSnakeCase(String(token).trim())
    return context[normalized] ?? context[String(token).trim()] ?? `{{${token}}}`
  })
}

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_VERIFIED_SENDER || 'no-reply@fuse.health'
const TWILIO_API_KEY = process.env.TWILIO_API_KEY

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY)
} else {
  console.warn('⚠️ SENDGRID_API_KEY not configured. Email sending is disabled.')
}

class SmsProvider {
  async send(to: string, body: string) {
    if (!TWILIO_API_KEY) {
      console.warn('⚠️ TWILIO_API_KEY not configured. SMS sending is disabled.')
      return
    }

    const parts = TWILIO_API_KEY.split(':')
    if (parts.length < 3) {
      console.warn('⚠️ TWILIO_API_KEY format invalid. Expected "accountSid:authToken:fromNumber"')
      return
    }

    const [accountSid, authToken, fromNumber] = parts

    if (!accountSid || !authToken || !fromNumber) {
      console.warn('⚠️ TWILIO_API_KEY missing account SID, auth token, or from number')
      return
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
    const params = new URLSearchParams({
      To: to,
      From: fromNumber,
      Body: body
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('❌ Twilio SMS send failed:', text)
      throw new Error(`Twilio SMS failed with status ${response.status}`)
    }

    console.log('📱 SMS sent via Twilio:', { to })
  }
}

class EmailProvider {
  async send(to: string, subject: string, body: string, trackingRunId?: string) {
    if (!SENDGRID_API_KEY) {
      console.warn('⚠️ Skipping email send because SENDGRID_API_KEY is missing.')
      return
    }

    // Add tracking pixel if runId is provided
    let htmlBody = body
    if (trackingRunId) {
      const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const trackingPixel = `<img src="${apiUrl}/track/email/${trackingRunId}/open" width="1" height="1" alt="" style="display:none;" />`
      htmlBody = body + trackingPixel
    }

    const msg: any = {
      to,
      from: SENDGRID_FROM_EMAIL,
      subject,
      text: body.replace(/<\/?[^>]+(>|$)/g, ''),
      html: htmlBody,
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: true
        },
        openTracking: {
          enable: true
        }
      }
    }

    // Add custom args with runId for webhook tracking
    if (trackingRunId) {
      msg.customArgs = {
        runId: trackingRunId,
        run_id: trackingRunId
      }
    }

    await sgMail.send(msg)
    console.log('📧 Email sent via SendGrid with tracking:', { to, subject, trackingRunId })
  }
}

export default class SequenceMessageDispatcher {
  private smsProvider = new SmsProvider()
  private emailProvider = new EmailProvider()

  async dispatchStep(run: SequenceRun, sequence: Sequence, rawStep: StepPayload) {
    const stepType = (rawStep.type || '').toString().toLowerCase()

    if (stepType !== 'sms' && stepType !== 'email') {
      console.warn(`⚠️ Unsupported step type "${stepType}" for run ${run.id}`)
      return
    }

    const templateId = rawStep.templateId

    if (!templateId || typeof templateId !== 'string') {
      console.warn(`⚠️ Missing templateId for step ${rawStep.id ?? 'unknown'} in run ${run.id}`)
      return
    }

    const template = await MessageTemplate.findByPk(templateId)

    if (!template) {
      console.warn(`⚠️ Template ${templateId} not found for run ${run.id}`)
      return
    }

    const context = buildTemplateContext(run, sequence)
    const renderedBody = replaceTemplateVariables(template.body, context)

    if (stepType === 'sms') {
      const phone =
        context.patient_phone_number ||
        context.patient_phone ||
        ''

      if (!phone) {
        console.warn(`⚠️ No phone number available for SMS run ${run.id}`)
        return
      }

      await this.smsProvider.send(phone, renderedBody)
      
      // Increment SMS counter
      run.smsSent = (run.smsSent || 0) + 1
      await run.save()
      
      console.log(`📊 SMS sent tracked for run ${run.id}: ${run.smsSent} total`)
      return
    }

    const email =
      context.patient_email ||
      ''

    if (!email) {
      console.warn(`⚠️ No email available for email run ${run.id}`)
      return
    }

    const subject = template.subject
      ? replaceTemplateVariables(template.subject, context)
      : sequence.name || 'Sequence Message'

    // Send email with tracking pixel
    await this.emailProvider.send(email, subject, renderedBody, run.id)
    
    // Increment email counter
    run.emailsSent = (run.emailsSent || 0) + 1
    await run.save()
    
    console.log(`📊 Email sent tracked for run ${run.id}: ${run.emailsSent} total`)
  }
}

