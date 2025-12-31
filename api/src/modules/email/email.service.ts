import { Injectable, OnModuleInit } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private transporter: Transporter | undefined;

  constructor() {}

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
      from: 'BikeHub <noreply@bikehub.me>',
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

