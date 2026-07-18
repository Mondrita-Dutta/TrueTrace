const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const upload = require('../config/multerConfig');

// Protect all routes and restrict to manufacturer role
router.use(protect);
router.use(authorize('manufacturer'));

// Routes
router.post('/', upload.single('productImage'), productController.createProduct);
router.get('/', productController.getProducts);

// Bulk operations (must come before /:id)
router.put('/bulk/update', productController.bulkUpdateProducts);

router.get('/:id', productController.getProductById);
router.put('/:id', upload.single('productImage'), productController.updateProduct);
router.post('/:id/blockchain', productController.publishToBlockchain);
router.delete('/:id', productController.deleteProduct); // Also handles comma-separated IDs for bulk delete

module.exports = router;
