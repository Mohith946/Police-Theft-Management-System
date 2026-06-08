/**
 * Client QR helper
 */

export const getQRTokenFromUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('token');
  } catch (err) {
    return url; // Fallback to raw string
  }
};

export const formatQRToken = (token) => {
  if (!token) return '';
  return token.toUpperCase();
};
