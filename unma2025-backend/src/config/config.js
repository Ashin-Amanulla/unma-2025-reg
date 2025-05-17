import dotenv from 'dotenv';

dotenv.config();

export const PAYMENT_GATEWAY_API_KEY = process.env.PAYMENT_GATEWAY_API_KEY;
export const PAYMENT_GATEWAY_ENCRYPTION_KEY = process.env.PAYMENT_GATEWAY_ENCRYPTION_KEY;
export const PAYMENT_GATEWAY_SALT = process.env.PAYMENT_GATEWAY_SALT;
export const PAYMENT_GATEWAY_BASE_URL = process.env.PAYMENT_GATEWAY_BASE_URL;

//whatsapp
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
export const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
export const FLUXCHAT_API_KEY = process.env.FLUXCHAT_API_KEY;
export const ENV = process.env.ENV;

//email
export const SMTP_HOST = process.env.SMTP_HOST;
export const SMTP_PORT = process.env.SMTP_PORT;
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const EMAIL_FROM = process.env.EMAIL_FROM;
