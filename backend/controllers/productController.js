const Product = require('../models/Product');
const ProductTemplate = require('../models/ProductTemplate');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const stellarService = require('../services/stellarService');

// Ensure qrcodes directory exists
const qrDir = path.join(__dirname, '../uploads/qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Manufacturer)
exports.createProduct = async (req, res) => {
  try {
    const {
      productName, category, brandName, description,
      batchNumber, serialNumber, manufacturingDate,
      expiryDate, countryOfOrigin, status,
      manufacturerName, manufacturerCompany,
      warrantyPeriod, additionalNotes
    } = req.body;

    // Check if serial number already exists
    const existingProduct = await Product.findOne({ serialNumber });
    if (existingProduct) {
      return res.error('Serial number already exists. It must be unique.', 400);
    }

    // Validate dates
    if (new Date(manufacturingDate) > new Date()) {
      return res.error('Manufacturing date cannot be in the future', 400);
    }
    if (expiryDate && new Date(expiryDate) < new Date(manufacturingDate)) {
      return res.error('Expiry date cannot be before manufacturing date', 400);
    }

    let imagePath = '';
    if (req.file) {
      // Store relative path to access via static route
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    // Generate unique productId (e.g., TT-2026-000001)
    const currentYear = new Date().getFullYear();
    const productCount = await Product.countDocuments();
    const sequence = String(productCount + 1).padStart(6, '0');
    const productId = `TT-${currentYear}-${sequence}`;

    // Generate QR Data Payload
    const qrDataPayload = {
      productId,
      manufacturerId: req.user.id,
      timestamp: new Date().toISOString(),
      // The verification URL can be handled on the frontend based on ID, 
      // but we embed the core data here.
    };
    const qrDataString = JSON.stringify(qrDataPayload);

    // Generate QR Code Image
    const qrFilename = `qr-${productId}.png`;
    const qrFilePath = path.join(qrDir, qrFilename);
    await QRCode.toFile(qrFilePath, qrDataString, {
      errorCorrectionLevel: 'H',
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });
    const qrImageUrl = `/uploads/qrcodes/${qrFilename}`;

    const product = new Product({
      productId,
      productName,
      category,
      brandName,
      manufacturerName,
      manufacturerCompany,
      manufacturerId: req.user.id,
      description,
      batchNumber,
      serialNumber,
      manufacturingDate,
      expiryDate,
      countryOfOrigin,
      warrantyPeriod,
      additionalNotes,
      status: status || 'Pending Blockchain',
      productImage: imagePath,
      qrData: qrDataString,
      qrImageUrl
    });

    const savedProduct = await product.save();
    return res.success(savedProduct, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return res.error(error.message, 500);
  }
};

// @desc    Get all products for the authenticated manufacturer
// @route   GET /api/products
// @access  Private (Manufacturer)
exports.getProducts = async (req, res) => {
  try {
    const { 
      page = 1, limit = 10, search = '', 
      category = '', status = '', sortBy = 'createdAt', sortOrder = 'desc' 
    } = req.query;

    const query = { manufacturerId: req.user.id };

    // Search logic (product name, brand, batch, serial)
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { batchNumber: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (category) query.category = category;
    if (status) query.status = status;

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    return res.success({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    }, 'Products fetched successfully');
  } catch (error) {
    console.error('Get products error:', error);
    return res.error('Failed to fetch products', 500);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Private (Manufacturer)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, manufacturerId: req.user.id });
    
    if (!product) {
      return res.error('Product not found', 404);
    }

    return res.success(product, 'Product fetched successfully');
  } catch (error) {
    console.error('Get product by id error:', error);
    return res.error('Failed to fetch product', 500);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Manufacturer)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, manufacturerId: req.user.id });
    
    if (!product) {
      return res.error('Product not found', 404);
    }

    const {
      productName, category, brandName, description,
      batchNumber, serialNumber, manufacturingDate,
      expiryDate, countryOfOrigin, status,
      manufacturerName, manufacturerCompany,
      warrantyPeriod, additionalNotes
    } = req.body;

    // Serial number uniqueness check if changing
    if (serialNumber && serialNumber !== product.serialNumber) {
      const existingProduct = await Product.findOne({ serialNumber });
      if (existingProduct) {
        return res.error('Serial number already exists', 400);
      }
    }

    // Validate dates if updated
    const newMfgDate = manufacturingDate || product.manufacturingDate;
    if (manufacturingDate && new Date(manufacturingDate) > new Date()) {
      return res.error('Manufacturing date cannot be in the future', 400);
    }
    const newExpDate = expiryDate || product.expiryDate;
    if (newExpDate && new Date(newExpDate) < new Date(newMfgDate)) {
      return res.error('Expiry date cannot be before manufacturing date', 400);
    }

    // Handle image upload
    if (req.file) {
      product.productImage = `/uploads/products/${req.file.filename}`;
    }

    // Update fields
    if (productName) product.productName = productName;
    if (category) product.category = category;
    if (brandName) product.brandName = brandName;
    if (manufacturerName) product.manufacturerName = manufacturerName;
    if (manufacturerCompany) product.manufacturerCompany = manufacturerCompany;
    if (description) product.description = description;
    if (batchNumber) product.batchNumber = batchNumber;
    if (serialNumber) product.serialNumber = serialNumber;
    if (manufacturingDate) product.manufacturingDate = manufacturingDate;
    if (expiryDate !== undefined) product.expiryDate = expiryDate; // allow nulling
    if (countryOfOrigin) product.countryOfOrigin = countryOfOrigin;
    if (warrantyPeriod !== undefined) product.warrantyPeriod = warrantyPeriod;
    if (additionalNotes !== undefined) product.additionalNotes = additionalNotes;
    if (status) product.status = status;

    const updatedProduct = await product.save();
    return res.success(updatedProduct, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    return res.error(error.message, 500);
  }
};

// @desc    Delete product (or bulk delete)
// @route   DELETE /api/products/:id
// @access  Private (Manufacturer)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Support for bulk delete via comma separated IDs
    const ids = id.split(',');
    
    const result = await Product.deleteMany({
      _id: { $in: ids },
      manufacturerId: req.user.id
    });

    if (result.deletedCount === 0) {
      return res.error('No products found or unauthorized', 404);
    }

    return res.success(null, `${result.deletedCount} product(s) deleted successfully`);
  } catch (error) {
    console.error('Delete product error:', error);
    return res.error('Failed to delete product(s)', 500);
  }
};

// @desc    Bulk update products (e.g. status)
// @route   PUT /api/products/bulk/update
// @access  Private (Manufacturer)
exports.bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updateData } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.error('No product IDs provided', 400);
    }

    const result = await Product.updateMany(
      { _id: { $in: ids }, manufacturerId: req.user.id },
      { $set: updateData }
    );

    return res.success(null, `${result.modifiedCount} product(s) updated successfully`);
  } catch (error) {
    console.error('Bulk update error:', error);
    return res.error('Failed to update products', 500);
  }
};

// @desc    Publish product to Stellar Blockchain
// @route   POST /api/products/:id/blockchain
// @access  Private (Manufacturer)
exports.publishToBlockchain = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, manufacturerId: req.user.id });
    
    if (!product) {
      return res.error('Product not found', 404);
    }

    if (product.blockchainStatus === 'Verified') {
      return res.error('Product is already verified on the blockchain', 400);
    }

    // Prepare core data for hash payload
    const productDataPayload = {
      productId: product.productId,
      manufacturerId: product.manufacturerId.toString(),
      batchNumber: product.batchNumber,
      serialNumber: product.serialNumber
    };

    // Publish to Stellar
    const txData = await stellarService.publishProductToBlockchain(product.productId, productDataPayload);

    // Update Product Record
    product.blockchainStatus = 'Verified';
    product.blockchainTxHash = txData.hash;
    product.blockchainLedger = txData.ledger;
    product.status = 'Verified';
    
    const updatedProduct = await product.save();

    return res.success(updatedProduct, 'Successfully published to Stellar Blockchain');
  } catch (error) {
    console.error('Publish to blockchain error:', error);
    return res.error(error.message || 'Failed to publish to blockchain', 500);
  }
};

// --- TEMPLATE ENDPOINTS ---

exports.getTemplates = async (req, res) => {
  try {
    const templates = await ProductTemplate.find({ manufacturerId: req.user.id }).sort({ createdAt: -1 });
    return res.success(templates, 'Templates fetched successfully');
  } catch (error) {
    console.error('Get templates error:', error);
    return res.error('Failed to fetch templates', 500);
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const { templateName, productName, category, brandName, manufacturerName, manufacturerCompany, description, countryOfOrigin, warrantyPeriod, additionalNotes } = req.body;
    
    const template = new ProductTemplate({
      templateName, productName, category, brandName, manufacturerName, manufacturerCompany,
      description, countryOfOrigin, warrantyPeriod, additionalNotes,
      manufacturerId: req.user.id
    });
    
    const savedTemplate = await template.save();
    return res.success(savedTemplate, 'Template created successfully', 201);
  } catch (error) {
    console.error('Create template error:', error);
    return res.error(error.message, 500);
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const result = await ProductTemplate.findOneAndDelete({ _id: req.params.id, manufacturerId: req.user.id });
    if (!result) return res.error('Template not found', 404);
    return res.success(null, 'Template deleted successfully');
  } catch (error) {
    console.error('Delete template error:', error);
    return res.error('Failed to delete template', 500);
  }
};

// --- BATCH & BULK REGISTRATION ---

exports.createProductBatch = async (req, res) => {
  try {
    const { quantity, ...productData } = req.body;
    const qty = parseInt(quantity);
    if (!qty || qty < 1 || qty > 500) {
      return res.error('Valid quantity between 1 and 500 is required', 400);
    }

    const {
      productName, category, brandName, description,
      batchNumber, manufacturingDate, expiryDate, countryOfOrigin, status,
      manufacturerName, manufacturerCompany, warrantyPeriod, additionalNotes
    } = productData;

    if (!batchNumber) return res.error('Batch number is required for batch registration', 400);

    const currentYear = new Date().getFullYear();
    let productCount = await Product.countDocuments();
    
    const productsToSave = [];
    
    for (let i = 1; i <= qty; i++) {
      productCount++;
      const sequence = String(productCount).padStart(6, '0');
      const productId = `TT-${currentYear}-${sequence}`;
      const serialNumber = `${batchNumber}-${String(i).padStart(4, '0')}`;
      
      const qrDataPayload = {
        productId,
        manufacturerId: req.user.id,
        timestamp: new Date().toISOString(),
      };
      const qrDataString = JSON.stringify(qrDataPayload);
      
      const qrFilename = `qr-${productId}.png`;
      const qrFilePath = path.join(qrDir, qrFilename);
      await QRCode.toFile(qrFilePath, qrDataString, {
        errorCorrectionLevel: 'H', width: 400, margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const qrImageUrl = `/uploads/qrcodes/${qrFilename}`;
      
      productsToSave.push(new Product({
        productId, productName, category, brandName, manufacturerName, manufacturerCompany,
        manufacturerId: req.user.id, description, batchNumber, serialNumber,
        manufacturingDate, expiryDate, countryOfOrigin, warrantyPeriod, additionalNotes,
        status: status || 'Pending Blockchain', qrData: qrDataString, qrImageUrl
      }));
    }

    const savedProducts = await Product.insertMany(productsToSave);
    return res.success(savedProducts, `${qty} products registered successfully`, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.error('A serial number in this batch already exists. Ensure batch numbers are unique.', 400);
    }
    console.error('Create product batch error:', error);
    return res.error(error.message, 500);
  }
};

exports.bulkCreateProducts = async (req, res) => {
  try {
    const productsData = req.body.products;
    if (!Array.isArray(productsData) || productsData.length === 0) {
      return res.error('No products provided', 400);
    }
    if (productsData.length > 500) {
      return res.error('Maximum 500 products allowed per bulk upload', 400);
    }

    const currentYear = new Date().getFullYear();
    let productCount = await Product.countDocuments();
    
    const productsToSave = [];
    
    for (const p of productsData) {
      productCount++;
      const sequence = String(productCount).padStart(6, '0');
      const productId = `TT-${currentYear}-${sequence}`;
      
      const qrDataPayload = {
        productId,
        manufacturerId: req.user.id,
        timestamp: new Date().toISOString(),
      };
      const qrDataString = JSON.stringify(qrDataPayload);
      
      const qrFilename = `qr-${productId}.png`;
      const qrFilePath = path.join(qrDir, qrFilename);
      await QRCode.toFile(qrFilePath, qrDataString, {
        errorCorrectionLevel: 'H', width: 400, margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      const qrImageUrl = `/uploads/qrcodes/${qrFilename}`;
      
      productsToSave.push(new Product({
        ...p,
        productId,
        manufacturerId: req.user.id,
        status: p.status || 'Pending Blockchain',
        qrData: qrDataString,
        qrImageUrl
      }));
    }

    const savedProducts = await Product.insertMany(productsToSave);
    return res.success(savedProducts, `${savedProducts.length} products bulk created successfully`, 201);
  } catch (error) {
    if (error.code === 11000) {
      return res.error('Duplicate serial number detected in bulk upload.', 400);
    }
    console.error('Bulk create error:', error);
    return res.error(error.message, 500);
  }
};
