import api from './api';

export const login = async (email, password, accessCode) => {
  const response = await api.post('/api/auth/login', { email, password, accessCode });
  return response.data;
};

export const register = async (username, email, password, role, badgeNumber) => {
  const payload = { username, email, password };
  if (role) payload.role = role;
  if (badgeNumber) payload.badgeNumber = badgeNumber;
  
  const response = await api.post('/api/auth/register', payload);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};
