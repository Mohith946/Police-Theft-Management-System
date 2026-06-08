import api from './api';

export const getStolenItems = async (search = '', category = '') => {
  const response = await api.get(`/api/items/stolen?search=${search}&category=${category}`);
  return response.data;
};

export const getRecoveredItems = async (category = '') => {
  const response = await api.get(`/api/items/recovered?category=${category}`);
  return response.data;
};

export const getItemById = async (id) => {
  const response = await api.get(`/api/items/${id}`);
  return response.data;
};

export const updateItemRecovery = async (id, recoveryLocation) => {
  const response = await api.put(`/api/items/${id}/recover`, { recoveryLocation });
  return response.data;
};
