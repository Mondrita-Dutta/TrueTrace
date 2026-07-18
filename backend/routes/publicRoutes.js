const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const crypto = require('crypto');
const stellarService = require('../services/stellarService');

// @desc    Verify product via Product ID
// @route   GET /api/public/products/:productId/verify
// @access  Public
router.get('/products/:productId/verify', async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Find the product (include only necessary public data)
    const product = await Product.findOne({ productId }).select(
      'productId productName brandName category description batchNumber serialNumber manufacturingDate expiryDate countryOfOrigin warrantyPeriod additionalNotes productImage qrImageUrl blockchainStatus blockchainTxHash blockchainLedger createdAt'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found. This product may be counterfeit.' });
    }

    if (product.blockchainStatus !== 'Verified' || !product.blockchainTxHash) {
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
      productId: product.productId,
      manufacturerId: (await Product.findOne({ productId }).select('manufacturerId')).manufacturerId.toString(),
      batchNumber: product.batchNumber,
      serialNumber: product.serialNumber
    };
    
    const sortedData = JSON.stringify(productDataPayload, Object.keys(productDataPayload).sort());
    const localHash = crypto.createHash('sha256').update(sortedData).digest('hex');

    // 2. Fetch the transaction memo from Stellar Horizon
    const horizonResponse = await fetch(`https://horizon-testnet.stellar.org/transactions/${product.blockchainTxHash}`);
    
    if (!horizonResponse.ok) {
      return res.status(500).json({ success: false, message: 'Failed to verify transaction on Stellar network.' });
    }

    const txData = await horizonResponse.json();
    const memoBase64 = txData.memo; // Memo hash is base64 encoded by default in Horizon response
    let memoHex = '';
    
    if (memoBase64) {
      memoHex = Buffer.from(memoBase64, 'base64').toString('hex');
    }

    const isAuthentic = (localHash === memoHex);

    return res.json({
      success: true,
      message: isAuthentic ? 'Product is mathematically proven to be authentic.' : 'Hash mismatch! Product may be counterfeit or tampered.',
      data: {
        product,
        isAuthentic,
        blockchain: {
          txHash: product.blockchainTxHash,
          ledger: product.blockchainLedger,
          timestamp: txData.created_at,
          localHash,
          stellarHash: memoHex
        }
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

module.exports = router;
