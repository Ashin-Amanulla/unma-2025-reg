import crypto from 'crypto';

function encryptData(data, encryptionKey) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return {
    encrypted_data: encrypted,
    iv: iv.toString('base64'),
  };
}

export { encryptData };
