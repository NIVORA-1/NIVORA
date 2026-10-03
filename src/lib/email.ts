/**
 * NIVORA Email Delivery Service Abstraction
 * Supports environment-configured email providers (e.g. Resend, SendGrid, SMTP).
 * Safely simulates delivery in development environments without exposing credentials or codes in production.
 */

export interface SendResetCodeParams {
  to: string;
  name?: string;
  code: string;
}

export async function sendPasswordResetEmail({ to, name = 'Student', code }: SendResetCodeParams): Promise<{ success: boolean; messageId?: string }> {
  const isProduction = process.env.NODE_ENV === 'production';

  // Check if Resend API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || 'NIVORA Security <security@nivora.edu>',
          to: [to],
          subject: 'Your NIVORA Password Reset Code',
          html: `
            <div style="font-family: sans-serif; background: #EAE7DC; color: #262220; padding: 40px; border-radius: 12px; border: 1px solid #D8C3A5;">
              <h2 style="color: #E85A4F; margin-top: 0;">NIVORA Security Verification</h2>
              <p style="color: #262220; font-size: 15px; line-height: 1.6;">Hello ${name},</p>
              <p style="color: #262220; font-size: 15px; line-height: 1.6;">You recently requested to reset your password for your NIVORA student account. Use the verification code below to confirm your identity:</p>
              <div style="background: #FAF8F3; border: 1px solid #D8C3A5; padding: 18px; border-radius: 8px; text-align: center; margin: 24px 0;">
                <span style="font-family: monospace; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #E85A4F;">${code}</span>
              </div>
              <p style="font-size: 13px; color: #8E8D8A; line-height: 1.5;">This code is valid for 10 minutes and can only be used once. If you did not make this request, your account is secure and you can safely ignore this message.</p>
            </div>
          `,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, messageId: data.id };
      }
    } catch (err) {
      console.error('[Email Service] Error dispatching email via Resend:', err);
    }
  }

  // Development environment safe simulation
  if (!isProduction) {
    // Only in non-production development environments:
    console.log(`\n========================================`);
    console.log(`[DEV EMAIL SIMULATION] Reset Code for: ${to}`);
    console.log(`[DEV EMAIL SIMULATION] 6-Digit Code:    ${code}`);
    console.log(`[DEV EMAIL SIMULATION] Valid for:       10 minutes`);
    console.log(`========================================\n`);
  }

  return { success: true };
}
