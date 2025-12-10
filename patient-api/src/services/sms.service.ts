/**
 * SMS Service - Handles sending SMS notifications via Twilio
 */

const TWILIO_API_KEY = process.env.TWILIO_API_KEY;

class SmsService {
  /**
   * Send SMS via Twilio
   * @param to - Phone number to send SMS to (E.164 format or 10-digit US number)
   * @param body - Message body
   * @returns Promise<void>
   */
  async send(to: string, body: string): Promise<void> {
    if (!TWILIO_API_KEY) {
      return;
    }

    const parts = TWILIO_API_KEY.split(":");
    if (parts.length < 3) {
      return;
    }

    const [accountSid, authToken, fromNumber] = parts;

    if (!accountSid || !authToken || !fromNumber) {
      return;
    }

    // Normalize phone number (ensure it's in E.164 format)
    const normalizedPhone = this.normalizePhoneNumber(to);

    if (!normalizedPhone) {
      return;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams({
      To: normalizedPhone,
      From: fromNumber,
      Body: body,
    });

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${accountSid}:${authToken}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error(`Twilio SMS failed with status ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Normalize phone number to E.164 format
   * Supports: 10-digit US numbers, numbers with country code, etc.
   */
  private normalizePhoneNumber(phone: string): string | null {
    if (!phone) return null;

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // If it's a 10-digit US number, add +1
    if (digits.length === 10) {
      return `+1${digits}`;
    }

    // If it's 11 digits starting with 1, add +
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+${digits}`;
    }

    // If it already starts with +, return as is
    if (phone.startsWith("+")) {
      return phone;
    }

    // If it's already in a valid format, try to use it
    if (digits.length >= 10) {
      return `+${digits}`;
    }

    return null;
  }
}

export default new SmsService();
