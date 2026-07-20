const StellarSdk = require('@stellar/stellar-sdk');
const crypto = require('crypto');

// Use Testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

let masterKeypair = null;

// Initialize the master account (called on server start)
const initializeStellarAccount = async () => {
  try {
    if (process.env.STELLAR_SECRET_KEY) {
      masterKeypair = StellarSdk.Keypair.fromSecret(process.env.STELLAR_SECRET_KEY);
      console.log(`[Stellar] Loaded Master Account: ${masterKeypair.publicKey()}`);
    } else {
      console.log('[Stellar] No secret key found in .env. Generating new Testnet account...');
      masterKeypair = StellarSdk.Keypair.random();
      console.log(`[Stellar] New Public Key: ${masterKeypair.publicKey()}`);
      console.log(`[Stellar] New Secret Key: ${masterKeypair.secret()}`);
      console.log('[Stellar] Funding new account via Friendbot... (This takes a few seconds)');

      const response = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(masterKeypair.publicKey())}`);
      const responseJSON = await response.json();
      if (response.ok) {
        console.log('[Stellar] Master account successfully funded on Testnet!');
      } else {
        console.error('[Stellar] ERROR: Failed to fund account:', responseJSON);
        throw new Error('Failed to fund testnet account');
      }
    }
  } catch (error) {
    console.error('[Stellar] Initialization error:', error);
  }
};

/**
 * Publishes a product's hash to the Stellar blockchain.
 * Returns the transaction hash and ledger sequence.
 */
const publishProductToBlockchain = async (productId, productData) => {
  if (!masterKeypair) {
    throw new Error('Stellar master account is not initialized.');
  }

  try {
    // 1. Create a SHA-256 hash of the product data
    // We strictly order the JSON keys to ensure consistent hashing
    const sortedData = JSON.stringify(productData, Object.keys(productData).sort());
    const hash = crypto.createHash('sha256').update(sortedData).digest();
    
    // 2. Load the master account
    const sourceAccount = await server.loadAccount(masterKeypair.publicKey());

    // 3. Build the transaction
    // We use a Payment of 0.0000001 XLM to ourselves just to carry the Memo.Hash
    // Memo.Hash exactly fits a 32-byte SHA256 hash!
    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase
    })
    .addOperation(StellarSdk.Operation.payment({
      destination: masterKeypair.publicKey(),
      asset: StellarSdk.Asset.native(),
      amount: "0.0000001" // Minimum valid amount
    }))
    .addMemo(StellarSdk.Memo.hash(hash.toString('hex')))
    .setTimeout(0) // 0 means infinite timeout, ignoring local system clock differences
    .build();

    // 4. Sign and submit
    transaction.sign(masterKeypair);
    
    console.log(`[Stellar] Submitting transaction for product ${productId}...`);
    const transactionResult = await server.submitTransaction(transaction);
    
    console.log(`[Stellar] Success! Tx Hash: ${transactionResult.hash}`);
    
    return {
      hash: transactionResult.hash,
      ledger: transactionResult.ledger,
      stellarUrl: `https://stellar.expert/explorer/testnet/tx/${transactionResult.hash}`,
      timestamp: new Date().toISOString(),
      localHash: hash.toString('hex')
    };
  } catch (error) {
    console.error('[Stellar] Publish error:', error.response ? error.response.data : error);
    throw new Error('Failed to publish to Stellar Blockchain');
  }
};

const registerProduct = publishProductToBlockchain;

/**
 * Gets transaction details from Stellar Horizon.
 */
const getTransaction = async (txHash) => {
  try {
    const response = await server.transactions().transaction(txHash).call();
    return response;
  } catch (error) {
    console.error(`[Stellar] Error fetching transaction ${txHash}:`, error);
    throw new Error('Failed to fetch transaction from Stellar');
  }
};

/**
 * Gets ledger details from Stellar Horizon.
 */
const getLedger = async (ledgerSequence) => {
  try {
    const response = await server.ledgers().ledger(ledgerSequence).call();
    return response;
  } catch (error) {
    console.error(`[Stellar] Error fetching ledger ${ledgerSequence}:`, error);
    throw new Error('Failed to fetch ledger from Stellar');
  }
};

/**
 * Verifies a transaction by comparing its hash/memo to the expected local hash.
 */
const verifyTransaction = async (txHash, expectedHashHex) => {
  try {
    const tx = await getTransaction(txHash);
    let memoHex = '';
    if (tx.memo) {
      memoHex = Buffer.from(tx.memo, 'base64').toString('hex');
    }
    return memoHex === expectedHashHex;
  } catch (error) {
    console.error(`[Stellar] Verify error for tx ${txHash}:`, error);
    return false;
  }
};

module.exports = {
  initializeStellarAccount,
  publishProductToBlockchain,
  registerProduct,
  verifyTransaction,
  getTransaction,
  getLedger
};
