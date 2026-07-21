import api from './api';

const productService = {
  // Get products with pagination, search, filters
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },

  getProductCategories: async () => {
    const res = await api.get('/products/categories');
    return res.data;
  },

  // Get single product
  getProductById: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },

  // Create product (supports FormData for images)
  createProduct: async (productData) => {
    const res = await api.post('/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Create batch products
  createProductBatch: async (batchData) => {
    const res = await api.post('/products/batch', batchData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Bulk create products from CSV
  bulkCreateProducts: async (products) => {
    const res = await api.post('/products/bulk/create', { products });
    return res.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const res = await api.put(`/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Delete product(s) - Supports single ID or comma-separated string for bulk
  deleteProducts: async (ids) => {
    const res = await api.delete(`/products/${ids}`);
    return res.data;
  },

  publishToBlockchain: async (id) => {
    const res = await api.post(`/products/${id}/blockchain`);
    return res.data;
  },

  markAsPublishedSoroban: async (id, txHash) => {
    const res = await api.post(`/products/${id}/blockchain/soroban`, { txHash });
    return res.data;
  },

  publishBatchToBlockchain: async (ids) => {
    const res = await api.post('/products/blockchain/batch', { ids });
    return res.data;
  },

  // Bulk update (e.g. status)
  bulkUpdateProducts: async (ids, updateData) => {
    const res = await api.put('/products/bulk/update', { ids, updateData });
    return res.data;
  }
};

export default productService;
