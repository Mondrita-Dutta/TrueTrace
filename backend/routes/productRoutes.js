const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../config/multerConfig');
const { productValidationRules, validate } = require('../validators/productValidator');

// Protect all routes and restrict to manufacturer role
router.use(protect);
router.use(authorize('manufacturer'));

// Routes
router.post('/', upload.single('productImage'), productValidationRules(), validate, productController.createProduct);
router.get('/', productController.getProducts);

// Categories
router.get('/categories', productController.getProductCategories);

// Template routes
router.get('/templates', productController.getTemplates);
router.post('/templates', productController.createTemplate);
router.delete('/templates/:id', productController.deleteTemplate);

// Bulk operations (must come before /:id)
router.post('/batch', upload.single('productImage'), productController.createProductBatch);
router.post('/bulk/create', productController.bulkCreateProducts);
router.put('/bulk/update', productController.bulkUpdateProducts);
router.post('/blockchain/batch', productController.publishBatchToBlockchain);

router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('productImage'), productValidationRules(), validate, productController.updateProduct);
router.post('/:id/blockchain', productController.publishToBlockchain);
router.delete('/:id', productController.deleteProduct); // Also handles comma-separated IDs for bulk delete

module.exports = router;
