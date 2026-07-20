import axios from 'axios';

// Public API instance (no auth token required)
const publicApi = axios.create({
  baseURL: 'http://localhost:5000/api/public',
});

const publicService = {
  verifyProduct: async (productId) => {
    const res = await publicApi.get(`/verify/${productId}`);
    return res.data;
  }
};

export default publicService;
