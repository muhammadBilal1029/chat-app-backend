import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASS'),
      },
    });
  }

  private transporter;

  async sendWelcomeEmail(email: string, name: string, otp: string) {
    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Welcome to ConnectHub - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to ConnectHub</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
            }
            h1 {
              color: #667eea;
              margin-bottom: 20px;
            }
            p {
              margin-bottom: 15px;
            }
            .otp {
              font-size: 48px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 10px;
              margin: 30px 0;
              background: #f0f0f0;
              padding: 20px;
              border-radius: 10px;
            }
            .footer {
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>Welcome to ConnectHub! 🎉</h1>
              <p>Hi ${name},</p>
              <p>Thank you for registering with ConnectHub. We're excited to have you on board!</p>
              <p>To get started, please verify your email address using the OTP below:</p>
              <div class="otp">${otp}</div>
              <p>This OTP will expire in 10 minutes.</p>
              <div class="footer">
                <p>If you didn't create an account with ConnectHub, please ignore this email.</p>
                <p>© 2024 ConnectHub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendContactNotificationEmail(email: string, addedByName: string, addedByEmail: string) {
    const loginUrl = `${this.configService.get<string>('FRONTEND_URL')}/login`;

    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'New Contact Request - ConnectHub',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Contact Request</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
            }
            .content {
              background: white;
              border-radius: 10px;
              padding: 30px;
              margin-top: 20px;
            }
            h1 {
              color: #667eea;
              margin-bottom: 20px;
            }
            p {
              margin-bottom: 15px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 25px;
              margin: 20px 0;
              font-weight: bold;
            }
            .button:hover {
              opacity: 0.9;
            }
            .info-box {
              background: #f0f0f0;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <h1>New Contact Added! 👥</h1>
              <p>Great news!</p>
              <p><strong>${addedByName}</strong> (${addedByEmail}) has added you to their contacts on ConnectHub.</p>
              <div class="info-box">
                <p>You can now chat with them by logging into your account.</p>
              </div>
              <a href="${loginUrl}" class="button">Login to Chat</a>
              <div class="footer">
                <p>If you don't know this person or didn't expect this notification, you can safely ignore this email.</p>
                <p>© 2024 ConnectHub. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
