import nodemailer from 'nodemailer';
import Settings from '../models/Settings.js';

/**
 * Sends a welcome email to a newly registered user.
 * Prioritizes environment variables, then falls back to Admin-configured DB settings.
 *
 * @param {string} userEmail - The registered user's email address
 * @param {string} userName  - The registered user's name
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const settings = await Settings.findOne();

    const smtpHost = process.env.SMTP_HOST || settings?.smtpConfig?.host;
    const smtpPort = process.env.SMTP_PORT || settings?.smtpConfig?.port || 587;
    const smtpUser = process.env.SMTP_USER || settings?.smtpConfig?.user;
    const smtpPass = process.env.SMTP_PASS || settings?.smtpConfig?.pass;
    const smtpSecure = process.env.SMTP_SECURE === 'true' || settings?.smtpConfig?.secure || false;

    if (!smtpHost) {
      return;
    }

    const transportOptions = {
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: smtpSecure,
    };

    if (smtpUser || smtpPass) {
      transportOptions.auth = { user: smtpUser, pass: smtpPass };
    }

    const transporter = nodemailer.createTransport(transportOptions);

    try {
      await transporter.verify();
    } catch (verifyError) {
      console.error('[EmailService] SMTP Verification Failed:', verifyError.message);
      return;
    }

    const platformName = process.env.PLATFORM_NAME || settings?.platformName || 'Xoon LMS';
    const fromEmail = process.env.FROM_EMAIL || smtpUser || 'noreply@xoon.com';
    const year = new Date().getFullYear();

    // ─── HTML Email Template ──────────────────────────────────────────────────
    const htmlBody = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <title>Welcome to ${platformName}</title>
  <style>
    @media only screen and (max-width:600px) {
      .card { width:100% !important; }
      .card-pad { padding-left:24px !important; padding-right:24px !important; }
      .brand { font-size:22px !important; letter-spacing:5px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0b1120;">
<!-- Preheader: prevents Gmail quoted-text collapse -->
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:#0b1120;line-height:1px;">Welcome to ${platformName} &mdash; discover expert-led courses and start your learning journey.&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<!--[if mso]><table width="100%" bgcolor="#0b1120" cellpadding="0" cellspacing="0"><tr><td><![endif]-->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:#0b1120;min-width:100%;padding:48px 0;">
  <tr>
    <td align="center" style="padding:0 16px;">

      <!-- WRAPPER CARD -->
      <table class="card" role="presentation" width="520" cellpadding="0" cellspacing="0"
             style="max-width:520px;width:100%;background-color:#111827;
                    border-radius:12px;border:1px solid #1f2a3a;
                    box-shadow:0 8px 40px rgba(0,0,0,0.5);">

        <!-- BRAND -->
        <tr>
          <td align="center" class="card-pad" style="padding:44px 40px 32px 40px;">
            <h1 class="brand"
                style="margin:0;font-family:Helvetica,Arial,sans-serif;
                       font-size:26px;font-weight:800;letter-spacing:6px;
                       text-transform:uppercase;color:#60a5fa;
                       line-height:1;white-space:nowrap;">
              ${platformName}
            </h1>
          </td>
        </tr>

        <!-- GREETING -->
        <tr>
          <td align="center" class="card-pad" style="padding:32px 40px 8px 40px;">
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;
                      font-size:15px;font-weight:500;color:#ffffff;
                      letter-spacing:0.3px;">
              Hello ${userName},
            </p>
            <p style="margin:8px 0 0 0;font-family:Helvetica,Arial,sans-serif;
                      font-size:13px;font-weight:400;color:#6b7280;
                      letter-spacing:0.3px;">
              We're glad to have you with us.
            </p>
          </td>
        </tr>

        <!-- MESSAGE BOX -->
        <tr>
          <td class="card-pad" style="padding:24px 32px 36px 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="background-color:#0f172a;border:1px solid #1e2d45;
                          border-radius:8px;">
              <tr>
                <td style="padding:24px 28px;">
                  <p style="margin:0;font-family:Helvetica,Arial,sans-serif;
                            font-size:14px;font-weight:500;color:#ffffff;
                            line-height:1.7;">
                    Access quality courses, expand your knowledge, and strengthen your skills with ${platformName}.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td align="center" class="card-pad" style="padding:0 32px 36px 32px;
              border-top:1px solid #1f2937;">
            <p style="margin:20px 0 4px 0;font-family:Helvetica,Arial,sans-serif;
                      font-size:11px;color:#374151;letter-spacing:1px;
                      text-transform:uppercase;">
              ${platformName} &mdash; &copy; ${year}
            </p>
            <p style="margin:0;font-family:Helvetica,Arial,sans-serif;
                      font-size:10px;color:#1f2937;">
              Automated message &mdash; please do not reply.
            </p>
          </td>
        </tr>

      </table><!-- /WRAPPER CARD -->
    </td>
  </tr>
</table>
<!--[if mso]></td></tr></table><![endif]-->
</body>
</html>`;

    const mailOptions = {
      from: `"${platformName}" <${fromEmail}>`,
      to: userEmail,
      subject: `Welcome to ${platformName}`,
      html: htmlBody,
    };

    const info = await transporter.sendMail(mailOptions);
    if (process.env.NODE_ENV === 'development') {
      console.log(`[EmailService] Welcome email sent (Message ID: ${info.messageId})`);
    }

  } catch (error) {
    console.error('[EmailService] Failed to send welcome email:', error.message);
  }
};

export default sendWelcomeEmail;
