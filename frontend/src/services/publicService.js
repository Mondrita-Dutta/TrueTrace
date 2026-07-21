import axios from 'axios';

// Public API instance (no auth token required)
const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api/public',
});

const publicService = {
  verifyProduct: async (productId) => {
    const res = await publicApi.get(`/verify/${encodeURIComponent(productId)}`);
    return res.data;
  },
  submitContactForm: async (data) => {
    const res = await publicApi.post('/contact', data);
    return res.data;
  },
  reportProduct: async (formData) => {
    const res = await publicApi.post('/report', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return res.data;
  }
};

export default publicService;
