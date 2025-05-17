import axios from 'axios';
import { WHATSAPP_PHONE_NUMBER_ID, FLUXCHAT_API_KEY , WHATSAPP_API_TOKEN} from '../config/config.js';

export const sendWhatsAppOtp = async (phoneNumber, otp) => {
    console.log('sending whatsapp message', WHATSAPP_PHONE_NUMBER_ID, otp);
    const API_URL = `https://fluxchat.io/api/v2/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

    const requestBody = {
        "messaging_product": "whatsapp",
        "to": phoneNumber,
        "type": "template",
        "template": {
          "name": "unma_phone_verification",
          "language": {
            "code": "en_US"
          },
          "components": [
            {
              "type": "body",
              "parameters": [
                {
                  "type": "text",
                  "text": otp
                }
              ]
            },
            {
              "type": "button",
              "sub_type": "url",
              "index": 0,
              "parameters": [
                {
                  "type": "text",
                  "text": otp
                }
              ]
            }
          ]
        }
      };
      

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FLUXCHAT_API_KEY}`
    };

    try {
        const response = await axios.post(API_URL, requestBody, { headers });
        console.log('whatsapp message sent successfully');
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp OTP:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp message');
    }
};

// kkk
