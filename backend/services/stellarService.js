const StellarSdk = require('@stellar/stellar-sdk');
const crypto = require('crypto');
const { nativeToScVal, Address, scValToNative } = StellarSdk;

// Use Testnet
const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
const networkPassphrase = StellarSdk.Networks.TESTNET;

let masterKeypair = null;
let CONTRACT_ID = null;
let METRICS_CONTRACT_ID = null;


// Initialize the master account (called on server start)
const initializeStellarAccount = async () => {
  try {
    CONTRACT_ID = process.env.SOROBAN_CONTRACT_ID;
    METRICS_CONTRACT_ID = process.env.METRICS_CONTRACT_ID;
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
  if (!CONTRACT_ID) {
    throw new Error('Soroban contract ID is not configured.');
  }

  try {
    const sortedData = JSON.stringify(productData, Object.keys(productData).sort());
    const hashHex = crypto.createHash('sha256').update(sortedData).digest('hex');
    
    const sourceAccount = await server.loadAccount(masterKeypair.publicKey());
    const contract = new StellarSdk.Contract(CONTRACT_ID);

    const args = [
      nativeToScVal(productId, { type: 'string' }),
      new Address(masterKeypair.publicKey()).toScVal(),
      nativeToScVal(hashHex, { type: 'string' })
    ];

    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: networkPassphrase
    })
    .addOperation(contract.call('register_product', ...args))
    .setTimeout(180)
    .build();

    const preparedTx = await rpcServer.prepareTransaction(tx);
    preparedTx.sign(masterKeypair);
    
    console.log(`[Stellar] Submitting Soroban transaction for product ${productId}...`);
    const sendResponse = await rpcServer.sendTransaction(preparedTx);
    
    if (sendResponse.status === "PENDING") {
      let statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      while (statusResponse.status === "NOT_FOUND") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      }
      
      if (statusResponse.status === "SUCCESS") {
        console.log(`[Stellar] Success! Tx Hash: ${sendResponse.hash}`);
        return {
          hash: sendResponse.hash,
          ledger: statusResponse.latestLedger,
          stellarUrl: `https://stellar.expert/explorer/testnet/tx/${sendResponse.hash}`,
          timestamp: new Date().toISOString(),
          localHash: hashHex
        };
      }
      throw new Error(statusResponse.resultXdr || "Transaction Failed");
    }
    
    throw new Error(sendResponse.errorResultXdr || 'Unknown error');
  } catch (error) {
    console.error('[Stellar] Publish error:', error);
    throw new Error('Failed to publish to Soroban Smart Contract');
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

const verifyTransaction = async (txHash, expectedHashHex) => {
  // We keep this for backward compatibility or simple tx checks
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

const verifyProductSoroban = async (productId, expectedHashHex) => {
  if (!CONTRACT_ID) return false;
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const args = [nativeToScVal(productId, { type: 'string' })];
    
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"); 
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: StellarSdk.Networks.TESTNET })
      .addOperation(contract.call("get_product", ...args))
      .setTimeout(30)
      .build();
      
    const sim = await rpcServer.simulateTransaction(tx);
    if (sim.resultError) return false;
    
    if (sim.result && sim.result.retval) {
      const productState = scValToNative(sim.result.retval);
      // productState is a JS object representing the rust Struct Product
      // productState.hash should be a string buffer or string
      const onChainHash = productState.hash?.toString();
      return onChainHash === expectedHashHex;
    }
    return false;
  } catch (error) {
    console.error(`[Stellar] Soroban Verify error for product ${productId}:`, error);
    return false;
  }
};

const getMetricsCount = async () => {
  if (!METRICS_CONTRACT_ID) return 0;
  try {
    const contract = new StellarSdk.Contract(METRICS_CONTRACT_ID);
    
    // Simulate transaction with dummy account
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"); 
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: StellarSdk.Networks.TESTNET })
      .addOperation(contract.call("get_count"))
      .setTimeout(30)
      .build();
      
    const sim = await rpcServer.simulateTransaction(tx);
    if (sim.resultError) return 0;
    
    if (sim.result && sim.result.retval) {
      const count = scValToNative(sim.result.retval);
      return Number(count);
    }
    return 0;
  } catch (error) {
    console.error(`[Stellar] Failed to fetch metrics count:`, error);
    return 0;
  }
};

module.exports = {
  initializeStellarAccount,
  publishProductToBlockchain,
  registerProduct,
  verifyTransaction,
  verifyProductSoroban,
  getTransaction,
  getLedger,
  getMetricsCount
};
