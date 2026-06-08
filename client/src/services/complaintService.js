import api from './api';

export const getComplaints = async (status = '', category = '') => {
  const response = await api.get(`/api/complaints?status=${status}&category=${category}`);
  return response.data;
};

export const getComplaintById = async (id) => {
  const response = await api.get(`/api/complaints/${id}`);
  return response.data;
};

export const createComplaint = async (complaintData) => {
  const response = await api.post('/api/complaints', complaintData);
  return response.data;
};

export const updateComplaint = async (id, updateData) => {
  const response = await api.put(`/api/complaints/${id}`, updateData);
  return response.data;
};

export const deleteComplaint = async (id) => {
  const response = await api.delete(`/api/complaints/${id}`);
  return response.data;
};
