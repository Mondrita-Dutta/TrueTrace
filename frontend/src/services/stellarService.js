import * as StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server("https://horizon-testnet.stellar.org");

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
