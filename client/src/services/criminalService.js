import api from './api';

export const getCriminals = async (search = '', status = '') => {
  const response = await api.get(`/api/criminals?search=${search}&status=${status}`);
  return response.data;
};

export const getCriminalById = async (id) => {
  const response = await api.get(`/api/criminals/${id}`);
  return response.data;
};

export const createCriminal = async (formData) => {
  const response = await api.post('/api/criminals', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const updateCriminal = async (id, formData) => {
  const response = await api.put(`/api/criminals/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteCriminal = async (id) => {
  const response = await api.delete(`/api/criminals/${id}`);
  return response.data;
};
