import axios from './axios';

const sendMail = async (email, subject, message) => {
  try {
    const response = await axios.post('/registrations/send-message', {
      email,
      subject: 'UNMA 2025 Reunion-Message from ' + name,
      message,
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export default sendMail;
