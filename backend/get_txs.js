const StellarSdk = require('@stellar/stellar-sdk');

async function findInitTx() {
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const masterKeypair = StellarSdk.Keypair.fromSecret('SBTD52X45MMCFXG26C2BFNTGZTMTSGJUCDIFKQM5BFHUCMCCUSS3OWBB');
  
  const txs = await server.transactions().forAccount(masterKeypair.publicKey()).order('desc').limit(200).call();
  
  for (let tx of txs.records) {
    const ops = await tx.operations();
    for (let op of ops.records) {
      if (op.type === 'invoke_host_function') {
        const hf = op.parameters;
        // Check if this was a call to TrueTrace contract's init function
        // StellarSdk doesn't parse it easily in horizon but we can check if it has parameters
        // Actually, let's just log the hash of any transaction that has an invoke_host_function that isn't the recent 123 increments
      }
    }
    console.log(`Tx: ${tx.hash}, created_at: ${tx.created_at}, signatures: ${tx.signatures.length}`);
  }
}
findInitTx().catch(console.error);
