import api from './api';

export const getTemplates = async () => {
  const res = await api.get('/products/templates');
  return res.data;
};

export const createTemplate = async (templateData) => {
  const res = await api.post('/products/templates', templateData);
  return res.data;
};

export const deleteTemplate = async (id) => {
  const res = await api.delete(`/products/templates/${id}`);
  return res.data;
};
