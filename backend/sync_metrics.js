const mongoose = require('mongoose');
const dotenv = require('dotenv');
const StellarSdk = require('@stellar/stellar-sdk');

dotenv.config();

const Product = require('./models/Product');

async function sync() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Product.countDocuments();
  console.log(`Database has ${count} products.`);
  
  const METRICS_CONTRACT_ID = process.env.METRICS_CONTRACT_ID;
  const SECRET_KEY = process.env.STELLAR_SECRET_KEY;
  
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
  const masterKeypair = StellarSdk.Keypair.fromSecret(SECRET_KEY);
  const contract = new StellarSdk.Contract(METRICS_CONTRACT_ID);
  
  // Get current count
  const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"); 
  const txSim = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: StellarSdk.Networks.TESTNET })
    .addOperation(contract.call("get_count"))
    .setTimeout(30)
    .build();
  
  const sim = await rpcServer.simulateTransaction(txSim);
  let currentCount = 0;
  if (sim.result && sim.result.retval) {
    currentCount = Number(StellarSdk.scValToNative(sim.result.retval));
  }
  console.log(`Blockchain contract count is currently ${currentCount}.`);
  
  const needed = count - currentCount;
  if (needed <= 0) {
    console.log("No sync needed.");
    process.exit(0);
  }
  
  console.log(`Need to increment the contract ${needed} times to catch up...`);
  
  let sourceAccount = await server.loadAccount(masterKeypair.publicKey());
  
  for (let i = 0; i < needed; i++) {
    console.log(`Incrementing ${i+1} of ${needed}...`);
    const tx = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET
    })
    .addOperation(contract.call('increment'))
    .setTimeout(180)
    .build();
    
    const preparedTx = await rpcServer.prepareTransaction(tx);
    preparedTx.sign(masterKeypair);
    
    const sendResponse = await rpcServer.sendTransaction(preparedTx);
    if (sendResponse.status === "PENDING") {
      let statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      while (statusResponse.status === "NOT_FOUND") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      }
      if (statusResponse.status !== "SUCCESS") {
         console.error("Transaction failed!", statusResponse);
         process.exit(1);
      }
    }
    // Reload account for next sequence number
    sourceAccount = await server.loadAccount(masterKeypair.publicKey());
  }
  
  console.log("Synchronization complete!");
  process.exit(0);
}

sync().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
