import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | undefined;
  private azureToken?: { accessToken: string; expiresAt: number };
  private fromAddress: string;

  constructor() {
    this.fromAddress = process.env.MAIL_FROM || 'RentnRide <noreply@rentnride.me>';
  }

  async onModuleInit() {
    const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();
    const user = process.env.EMAIL_USERNAME;
    const pass = process.env.EMAIL_PASSWORD;

    try {
      // If Outlook/Office365 configured to use Azure app credentials, prefer Graph API (no SMTP transporter needed)
      if ((provider === 'outlook' || provider === 'office365') && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID && process.env.MAIL_FROM) {
        console.log('EmailService: configured to send via Microsoft Graph (Outlook) using Azure app credentials');
        return;
      }

      if ((provider === 'gmail' || provider === 'gmail-smtp') && user && pass) {
        this.transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: { user, pass },
        });
        console.log('EmailService: using Gmail transport');
        return;
      }

      if ((provider === 'outlook' || provider === 'office365') && user && pass) {
        // Office365 / Exchange Online SMTP
        this.transporter = nodemailer.createTransport({
          host: process.env.EMAIL_SMTP_HOST || 'smtp.office365.com',
          port: Number(process.env.EMAIL_SMTP_PORT || 587),
          secure: process.env.EMAIL_SMTP_SECURE === 'true' || false,
          auth: { user, pass },
          tls: { ciphers: 'TLSv1.2' },
        });
        console.log('EmailService: using Outlook/Office365 SMTP transport');
        return;
      }

      // Fallback to Ethereal test account for local development when credentials are missing
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('EmailService: no credentials found — using Ethereal test account for emails');
    } catch (e) {
      console.error('EmailService: failed to initialize transporter', e);
    }
  }

  private async getAzureAccessToken(): Promise<string> {
    // Return cached token if valid
    if (this.azureToken && Date.now() < this.azureToken.expiresAt - 60000) return this.azureToken.accessToken;

    const tenant = process.env.AZURE_TENANT_ID;
    const clientId = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;

    if (!tenant || !clientId || !clientSecret) throw new Error('Missing Azure AD credentials for Graph API');

    const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

    // Use global fetch if available, otherwise require node-fetch dynamically
    const fetchFn: any = (globalThis as any).fetch || require('node-fetch');

    const params = new URLSearchParams();
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('scope', 'https://graph.microsoft.com/.default');
    params.append('grant_type', 'client_credentials');

    const res = await fetchFn(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Failed to obtain Azure access token: ${res.status} ${body}`);
    }

    const data = await res.json();
    const accessToken = data.access_token;
    const expiresIn = data.expires_in || 3600;
    this.azureToken = { accessToken, expiresAt: Date.now() + expiresIn * 1000 };
    return accessToken;
  }

  async sendEmail(to: string, subject: string, content: string, html?: string, options?: { inlineLogoPath?: string }): Promise<void> {
    const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

    // If Outlook/outlook provider and Azure credentials present, use Microsoft Graph API with client credentials
    if ((provider === 'outlook' || provider === 'office365') && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID && process.env.MAIL_FROM) {
      try {
        const token = await this.getAzureAccessToken();
        const mailFrom = process.env.MAIL_FROM!;

        const message: any = {
          message: {
            subject,
            body: {
              contentType: html ? 'HTML' : 'Text',
              content: html || content,
            },
            toRecipients: [
              {
                emailAddress: { address: to },
              },
            ],
          },
          saveToSentItems: 'false',
        };

        // If logo path provided, add inline attachment to message.attachments
        const logoPath = (options && options.inlineLogoPath) || process.env.EMAIL_LOGO_PATH;
        if (logoPath && fs.existsSync(logoPath)) {
          try {
            const fileBuffer = fs.readFileSync(logoPath);
            const fileBase64 = fileBuffer.toString('base64');
            const filename = path.basename(logoPath);
            message.message.attachments = [
              {
                '@odata.type': '#microsoft.graph.fileAttachment',
                name: filename,
                contentBytes: fileBase64,
                isInline: true,
                contentId: 'logo',
              },
            ];
          } catch (e) {
            console.error('Failed to attach inline logo for Graph API:', e);
          }
        }

        // Send via Graph API on behalf of the configured MAIL_FROM mailbox
        const graphUrl = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(mailFrom)}/sendMail`;
        const fetchFn: any = (globalThis as any).fetch || require('node-fetch');
        const resp = await fetchFn(graphUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        if (!resp.ok) {
          const body = await resp.text();
          console.error('Microsoft Graph sendMail failed:', resp.status, body);
          throw new Error(`Graph sendMail failed: ${resp.status}`);
        }

        console.log('Email sent via Microsoft Graph');
        return;
      } catch (err) {
        console.error('Error sending email via Microsoft Graph', err);
        // Let fallback attempt proceed below (SMTP/Ethereal) if a transporter exists
      }
    }

    // Fallback to SMTP transporter
    if (!this.transporter) {
      throw new Error('Email transporter is not initialized. Set EMAIL_USERNAME and EMAIL_PASSWORD, or check logs for test account creation.');
    }

    const mailOptions = {
      from: this.fromAddress,
      to,
      subject,
      text: content,
    };

    if (html) mailOptions.html = html;

    // If logo path provided and HTML references cid:logo, attach inline for SMTP
    const logoPath = (options && options.inlineLogoPath) || process.env.EMAIL_LOGO_PATH;
    if (logoPath && fs.existsSync(logoPath) && (html || '').includes('cid:logo')) {
      const filename = path.basename(logoPath);
      mailOptions.attachments = [
        {
          filename,
          path: logoPath,
          cid: 'logo',
        },
      ];
    }

    console.log('Sending email...');
    const info = await this.transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId || info);

    // If using Ethereal test account, log the preview URL
    const preview = nodemailer.getTestMessageUrl(info as any);
    if (preview) {
      console.log('Preview URL (Ethereal):', preview);
    }
  }
}



// import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
// import nodemailer, { Transporter } from 'nodemailer';

// @Injectable()
// export class EmailService implements OnModuleInit {
//   private transporter: Transporter | undefined;
//   private logger = new Logger(EmailService.name);
//   private fromAddress: string;

//   constructor() {
//     this.fromAddress = process.env.EMAIL_FROM || `BikeHub <noreply@${process.env.EMAIL_DOMAIN || 'bikehub.me'}>`;
//   }

//   async onModuleInit() {
//     const provider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();
//     const user = process.env.EMAIL_USERNAME;
//     const pass = process.env.EMAIL_PASSWORD;

//     try {
//       if ((provider === 'gmail' || provider === 'gmail-smtp') && user && pass) {
//         this.transporter = nodemailer.createTransport({
//           service: 'Gmail',
//           auth: { user, pass },
//         });
//         this.logger.log('EmailService: using Gmail transport');
//         return;
//       }

//       if ((provider === 'outlook' || provider === 'office365') && user && pass) {
//         // Office365/Exchange Online SMTP
//         this.transporter = nodemailer.createTransport({
//           host: process.env.EMAIL_SMTP_HOST || 'smtp.office365.com',
//           port: Number(process.env.EMAIL_SMTP_PORT || 587),
//           secure: process.env.EMAIL_SMTP_SECURE === 'true' || false, // STARTTLS on port 587
//           auth: { user, pass },
//           tls: {
//             // prefer modern TLS
//             ciphers: 'TLSv1.2',
//           },
//         });
//         this.logger.log('EmailService: using Outlook/Office365 SMTP transport');
//         return;
//       }

//       if (provider === 'smtp' && process.env.EMAIL_SMTP_HOST) {
//         this.transporter = nodemailer.createTransport({
//           host: process.env.EMAIL_SMTP_HOST,
//           port: Number(process.env.EMAIL_SMTP_PORT || 587),
//           secure: process.env.EMAIL_SMTP_SECURE === 'true',
//           auth: user && pass ? { user, pass } : undefined,
//         });
//         this.logger.log('EmailService: using custom SMTP transport');
//         return;
//       }

//       // Fallback: if credentials present but no provider matched, attempt generic SMTP with provided creds
//       if (user && pass) {
//         this.transporter = nodemailer.createTransport({
//           auth: { user, pass },
//         });
//         this.logger.log('EmailService: using generic SMTP transport with credentials');
//         return;
//       }

//       // Last-resort: Ethereal for local dev/testing
//       const testAccount = await nodemailer.createTestAccount();
//       this.transporter = nodemailer.createTransport({
//         host: testAccount.smtp.host,
//         port: testAccount.smtp.port,
//         secure: testAccount.smtp.secure,
//         auth: {
//           user: testAccount.user,
//           pass: testAccount.pass,
//         },
//       });
//       this.logger.warn('EmailService: no credentials found — using Ethereal test account for emails');
//     } catch (err) {
//       this.logger.error('EmailService: failed to initialize transporter', err as any);
//     }
//   }

//   /**
//    * Send an email. If `html` is provided it will be used as the HTML body.
//    */
//   async sendEmail(to: string, subject: string, text: string, html?: string): Promise<void> {
//     if (!this.transporter) {
//       throw new Error('Email transporter is not initialized. Set EMAIL_USERNAME/EMAIL_PASSWORD and EMAIL_PROVIDER, or check logs for test account creation.');
//     }

//     const mailOptions: any = {
//       from: this.fromAddress,
//       to,
//       subject,
//       text,
//     };

//     if (html) mailOptions.html = html;

//     this.logger.log(`Sending email to ${to} (subject="${subject}")`);
//     try {
//       const info = await this.transporter.sendMail(mailOptions);
//       this.logger.log(`Email sent: ${info && (info as any).messageId ? (info as any).messageId : JSON.stringify(info)}`);

//       const preview = nodemailer.getTestMessageUrl(info as any);
//       if (preview) {
//         this.logger.warn(`Preview URL (Ethereal): ${preview}`);
//       }
//     } catch (err: any) {
//       this.logger.error('Error sending email', err);
//       throw err;
//     }
//   }

//   // Convenience helper for registration emails
//   async sendRegistrationEmail(to: string, plainText: string, html?: string) {
//     const subject = process.env.REGISTRATION_EMAIL_SUBJECT || 'Welcome to BikeHub';
//     await this.sendEmail(to, subject, plainText, html);
//   }
// }



