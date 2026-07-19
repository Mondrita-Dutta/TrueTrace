import api from './api';

export const getTemplates = () => {
  return api.get('/products/templates');
};

export const createTemplate = (templateData) => {
  return api.post('/products/templates', templateData);
};

export const deleteTemplate = (id) => {
  return api.delete(`/products/templates/${id}`);
};
