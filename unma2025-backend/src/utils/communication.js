import nodemailer from 'nodemailer';
import { logger } from './logger.js';

import {SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM} from '../config/config.js';

/**
 * Generate a random OTP code
 * @param {number} length - Length of the OTP (default: 6)
 * @returns {string} Generated OTP
 */
export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < length; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    return otp;
};

/**
 * Send email using nodemailer
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} content - Email content (HTML supported)
 * @returns {Promise} - Result of email sending operation
 */
export const sendEmail = async (to, subject, content) => {
    try {
        const transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === '465', // true for 465, false for other ports
            auth: {
                user: SMTP_USER,
                pass: SMTP_PASS,
            },
        });

        const mailOptions = {
            from: EMAIL_FROM || 'noreply@unma2025.org',
            to: to,
            subject: subject,
            html: content,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Error sending email to ${to}: ${error.message}`);
        throw error;
    }
};

/**
 * Send SMS using a third-party service
 * @param {string} phoneNumber - Recipient phone number
 * @param {string} message - SMS content
 * @returns {Promise} - Result of SMS sending operation
 */
export const sendSMS = async (phoneNumber, message) => {
    try {
        // This is a placeholder implementation
        // In a production environment, integrate with an SMS service provider
        // such as Twilio, MessageBird, AWS SNS, etc.

        // Log for development/testing purposes
        logger.info(`[DEV] SMS would be sent to ${phoneNumber}: ${message}`);

        // If in development mode, just return success
        if (process.env.NODE_ENV !== 'production') {
            return {
                success: true,
                messageId: `DEV-${Date.now()}`,
                phoneNumber,
            };
        }

        // TODO: Implement actual SMS sending logic with a provider
        // Example with a hypothetical SMS provider:
        /*
        const response = await fetch('https://api.sms-provider.com/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SMS_API_KEY}`
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: message
            })
        });
        
        const result = await response.json();
        logger.info(`SMS sent to ${phoneNumber}: ${result.messageId}`);
        return result;
        */

        throw new Error('SMS sending not implemented in production mode');
    } catch (error) {
        logger.error(`Error sending SMS to ${phoneNumber}: ${error.message}`);
        throw error;
    }
}; 