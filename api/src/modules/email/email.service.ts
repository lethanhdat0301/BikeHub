import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | undefined;

  constructor() { }

  async onModuleInit() {
    if (process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      console.log('EmailService: using Gmail transport');
    } else {
      // Fallback to Ethereal test account for local development when credentials are missing
      try {
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
        console.error('EmailService: failed to create test account', e);
      }
    }
  }

  async sendEmail(to: string, subject: string, content: string): Promise<void> {
    if (!this.transporter) {
      throw new Error('Email transporter is not initialized. Set EMAIL_USERNAME and EMAIL_PASSWORD, or check logs for test account creation.');
    }

    const mailOptions = {
      from: 'RentnRide <noreply@rentnride.me>',
      to,
      subject,
      text: content,
    };

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



