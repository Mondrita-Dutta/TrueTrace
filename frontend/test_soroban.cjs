const StellarSdk = require('@stellar/stellar-sdk');

async function main() {
  const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
  const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
  const CONTRACT_ID = 'CBI5GWR2SV2LYLM2COSMLY7NGCLIJGFAS3J65XMQW67MBPKD3MRTW4MN';
  
  const keypair = StellarSdk.Keypair.random();
  console.log('Using public key:', keypair.publicKey());
  
  try {
    await fetch('https://friendbot.stellar.org?addr=' + keypair.publicKey());
    console.log('Funded');
  } catch (e) {
    console.log('Failed to fund account', e);
  }

  const account = await server.loadAccount(keypair.publicKey());
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const args = [
    StellarSdk.nativeToScVal('test_prod_1', { type: 'string' }),
    new StellarSdk.Address(keypair.publicKey()).toScVal(),
    StellarSdk.nativeToScVal('hash123', { type: 'string' })
  ];

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call('register_product', ...args))
    .setTimeout(180)
    .build();

  try {
    const preparedTx = await rpcServer.prepareTransaction(tx);
    console.log('Prepared successfully!', typeof preparedTx.toXDR);
  } catch (error) {
    console.error('Prepare failed:', error);
  }
}
main();
