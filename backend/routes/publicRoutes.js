const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const crypto = require('crypto');
const stellarService = require('../services/stellarService');
const ScanHistory = require('../models/ScanHistory');
const Report = require('../models/Report');
const User = require('../models/User');
const upload = require('../config/multerConfig');
const emailService = require('../services/emailService');
const ContactMessage = require('../models/ContactMessage');

// @desc    Verify product via Product ID
// @route   GET /api/public/verify/:productId
// @access  Public
router.get('/verify/:productId', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product (include only necessary public data)
    const product = await Product.findOne({ 
      $or: [{ productId }, { serialNumber: productId }] 
    }).select(
      'productId productName brandName category description batchNumber serialNumber manufacturingDate expiryDate countryOfOrigin warrantyPeriod additionalNotes productImage qrImageUrl blockchainStatus transactionHash ledgerNumber network blockchainTimestamp createdAt manufacturerName manufacturerCompany manufacturerId status'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found. This product may be counterfeit.' });
    }

    if (product.blockchainStatus !== 'Verified' || !product.transactionHash) {
      return res.json({ 
        success: true, 
        message: 'Product found, but it has not been verified on the blockchain yet.',
        data: {
          product,
          isAuthentic: false
        }
      });
    }

    // Cryptographic Verification:
    // 1. Re-hash the product data exactly as the manufacturer did
    const productDataPayload = {
      manufacturerName: product.manufacturerCompany || product.manufacturerName,
      brandName: product.brandName,
      productName: product.productName,
      serialNumber: product.serialNumber,
      batchNumber: product.batchNumber,
      manufacturingDate: product.manufacturingDate ? new Date(product.manufacturingDate).toISOString().split('T')[0] : '',
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : '',
      timestamp: product.blockchainTimestamp ? new Date(product.blockchainTimestamp).toISOString() : new Date(product.createdAt).toISOString()
    };
    
    const sortedData = JSON.stringify(productDataPayload, Object.keys(productDataPayload).sort());
    const localHash = crypto.createHash('sha256').update(sortedData).digest('hex');

    // 2. Fetch the transaction memo from Stellar Horizon
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    let txData;
    
    try {
      const horizonResponse = await fetch(`https://horizon-testnet.stellar.org/transactions/${product.transactionHash}`, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!horizonResponse.ok) {
        return res.status(500).json({ success: false, message: 'Failed to verify transaction on Stellar network.' });
      }
      
      txData = await horizonResponse.json();
    } catch (fetchError) {
      clearTimeout(timeoutId);
      return res.status(503).json({ success: false, message: 'Blockchain network timeout or unavailable.' });
    }

    const memoBase64 = txData.memo; // Memo hash is base64 encoded by default in Horizon response
    let memoHex = '';
    
    if (memoBase64) {
      memoHex = Buffer.from(memoBase64, 'base64').toString('hex');
    }

    const isAuthentic = (localHash === memoHex);

    // Log the scan asynchronously
    try {
      await ScanHistory.create({
        productId: product.productId,
        manufacturerId: product.manufacturerId,
        isAuthentic,
        ipAddress: req.ip || req.connection?.remoteAddress,
        location: 'Unknown',
      });
    } catch (scanErr) {
      console.error('Failed to log scan history:', scanErr);
    }

    return res.json({
      success: true,
      message: isAuthentic ? 'Product is mathematically proven to be authentic.' : 'Hash mismatch! Product may be counterfeit or tampered.',
      data: {
        product,
        isAuthentic,
        blockchain: {
          txHash: product.transactionHash,
          ledger: product.ledgerNumber,
          timestamp: txData.created_at,
          localHash,
          stellarHash: memoHex,
          network: product.network
        }
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// @desc    Report suspicious product
// @route   POST /api/public/report
// @access  Public
router.post('/report', upload.single('reportImage'), async (req, res) => {
  try {
    const { productId, reason, description, location, email } = req.body;
    let imageUrl = '';
    
    if (req.file) {
      imageUrl = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const newReport = await Report.create({
      productId,
      manufacturerId: product.manufacturerId,
      reason,
      description,
      location,
      email,
      imageUrl,
      status: 'Open'
    });

    // Send email notification to manufacturer
    try {
      const manufacturer = await User.findById(product.manufacturerId);
      if (manufacturer && manufacturer.email) {
        await emailService.sendCounterfeitReportEmail(manufacturer.email, newReport, product);
      }
    } catch (emailErr) {
      console.error('Failed to send email notification:', emailErr);
    }

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. The manufacturer has been notified.',
      data: newReport
    });
  } catch (error) {
    console.error('Report submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit report.' });
  }
});

// @desc    Submit contact form
// @route   POST /api/public/contact
// @access  Public
router.post('/contact', async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    
    if (!email || !subject || !message) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const newMessage = await ContactMessage.create({
      email,
      subject,
      message
    });

    // Send email notification
    await emailService.sendContactEmail({ email, subject, message });

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!',
      data: newMessage
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
});

module.exports = router;
