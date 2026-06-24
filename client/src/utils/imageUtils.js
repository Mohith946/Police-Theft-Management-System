/**
 * Formats a relative upload URL to point to the backend server in production,
 * while maintaining compatibility with local development proxying.
 * 
 * @param {string} url The relative or absolute URL of the image
 * @returns {string} Fully qualified or local path URL
 */
export const getUploadUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${apiBase}${cleanUrl}`;
};
