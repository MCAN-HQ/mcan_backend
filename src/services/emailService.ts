import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await transporter.sendMail({
        from: `${process.env.FROM_NAME || 'MCAN'} <${process.env.FROM_EMAIL || 'noreply@mcan.org.ng'}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      logger.error('Email send error:', error);
      throw error;
    }
  },
};

export default emailService;


