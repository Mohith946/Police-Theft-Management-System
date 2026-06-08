const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * Generates a unique secure QR token for a stolen item
 * @returns {string} Unique token string
 */
const generateUniqueToken = () => {
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `QR-ITEM-${Date.now()}-${randomBytes.toUpperCase()}`;
};

/**
 * Generates a Base64 Data URL (image/png) from a text string
 * @param {string} text Text to encode in the QR code
 * @returns {Promise<string>} Base64 data URL
 */
const generateQRCodeDataURL = async (text) => {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      margin: 1,
      width: 300,
      color: {
        dark: '#1e293b', // slate-800
        light: '#ffffff'
      }
    });
    return dataURL;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    throw new Error('QR Code generation failed');
  }
};

const generateComplaintToken = () => {
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `QR-COMP-${Date.now()}-${randomBytes.toUpperCase()}`;
};

module.exports = {
  generateUniqueToken,
  generateComplaintToken,
  generateQRCodeDataURL
};
