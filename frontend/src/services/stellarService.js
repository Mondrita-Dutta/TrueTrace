import * as StellarSdk from '@stellar/stellar-sdk';
import { Address, nativeToScVal, scValToNative } from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");
const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");

const CONTRACT_ID = import.meta.env.VITE_SOROBAN_CONTRACT_ID || '';

export const fetchBalance = async (publicKey) => {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find((b) => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : "0.0000000";
  } catch (error) {
    if (error.response?.status === 404) {
      return "0.0000000 (Unfunded)";
    }
    console.error("Error fetching balance:", error);
    return "Error";
  }
};

export const buildPaymentTransaction = async (sourcePublicKey, destinationPublicKey, amount) => {
  try {
    // 1. Validate destination
    if (!StellarSdk.StrKey.isValidEd25519PublicKey(destinationPublicKey)) {
      throw new Error("Invalid destination public key");
    }

    // 2. Load account to get sequence number
    const account = await server.loadAccount(sourcePublicKey);

    // 3. Build the transaction
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        })
      )
      .setTimeout(180) // 3 minutes timeout
      .build();

    // 4. Return the XDR (base64 string) representation
    return transaction.toXDR();
  } catch (error) {
    console.error("Error building transaction:", error);
    throw error;
  }
};

export const submitTransaction = async (signedXdr) => {
  try {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(
      signedXdr,
      StellarSdk.Networks.TESTNET
    );
    const response = await server.submitTransaction(transaction);
    return { success: true, hash: response.hash };
  } catch (error) {
    console.error("Error submitting transaction:", error);
    let errorDetails = "Unknown error";
    if (error.response && error.response.data && error.response.data.extras) {
      errorDetails = JSON.stringify(error.response.data.extras.result_codes);
    }
    return { success: false, error: errorDetails };
  }
};

// --- Soroban Contract Interactions ---

export const buildSorobanTransaction = async (sourcePublicKey, method, args) => {
  if (!CONTRACT_ID) throw new Error("Contract ID not found in .env. Please deploy the contract first.");

  const account = await server.loadAccount(sourcePublicKey);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(180)
    .build();

  // For Soroban, we must prepare the transaction to get resources and fees.
  const preparedTx = await rpcServer.prepareTransaction(tx);
  return preparedTx.toXDR();
};

export const buildRegisterProductTx = async (sourcePublicKey, productId, hash) => {
  const args = [
    nativeToScVal(productId, { type: 'string' }),
    new Address(sourcePublicKey).toScVal(),
    nativeToScVal(hash, { type: 'string' })
  ];
  return await buildSorobanTransaction(sourcePublicKey, "register_product", args);
};

export const buildUpdateProductTx = async (sourcePublicKey, productId, hash) => {
  const args = [
    nativeToScVal(productId, { type: 'string' }),
    new Address(sourcePublicKey).toScVal(),
    nativeToScVal(hash, { type: 'string' })
  ];
  return await buildSorobanTransaction(sourcePublicKey, "update_product", args);
};

export const buildReportCounterfeitTx = async (sourcePublicKey, productId) => {
  const args = [
    nativeToScVal(productId, { type: 'string' }),
    new Address(sourcePublicKey).toScVal()
  ];
  return await buildSorobanTransaction(sourcePublicKey, "report_counterfeit", args);
};

export const submitSorobanTransaction = async (signedXdr) => {
  try {
    const transaction = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);
    const sendResponse = await rpcServer.sendTransaction(transaction);
    
    if (sendResponse.status === "PENDING") {
      let statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      // Poll for completion
      while (statusResponse.status === "NOT_FOUND") {
        await new Promise(resolve => setTimeout(resolve, 2000));
        statusResponse = await rpcServer.getTransaction(sendResponse.hash);
      }
      
      if (statusResponse.status === "SUCCESS") {
        return { success: true, hash: sendResponse.hash, result: statusResponse };
      }
      return { success: false, error: statusResponse.resultXdr || "Transaction Failed" };
    }
    
    return { success: false, error: sendResponse.errorResultXdr || 'Unknown error' };
  } catch (error) {
    console.error("Soroban submit error:", error);
    return { success: false, error: error.message };
  }
};

export const queryProductFromContract = async (productId) => {
  if (!CONTRACT_ID) return null;
  try {
    const contract = new StellarSdk.Contract(CONTRACT_ID);
    const args = [nativeToScVal(productId, { type: 'string' })];
    
    // Simulate transaction to read state
    const account = new StellarSdk.Account("GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF", "0"); 
    const tx = new StellarSdk.TransactionBuilder(account, { fee: "100", networkPassphrase: StellarSdk.Networks.TESTNET })
      .addOperation(contract.call("get_product", ...args))
      .setTimeout(30)
      .build();
      
    const sim = await rpcServer.simulateTransaction(tx);
    if (sim.resultError) return null;
    
    if (sim.result && sim.result.retval) {
      return scValToNative(sim.result.retval);
    }
    return null;
  } catch (e) {
    console.error("Soroban query error:", e);
    return null;
  }
};
