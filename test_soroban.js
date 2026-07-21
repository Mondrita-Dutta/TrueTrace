require('./backend/node_modules/dotenv').config({ path: './backend/.env' });
const stellarService = require('./backend/services/stellarService');

async function test() {
  console.log("Initializing account...");
  await stellarService.initializeStellarAccount();
  
  console.log("Publishing to blockchain...");
  try {
    const res = await stellarService.publishProductToBlockchain('TT-TEST-003', {
      productName: "Test Product",
      batchNumber: "B123",
      timestamp: new Date().toISOString()
    });
    console.log("Publish Result:", res);
    
    console.log("Verifying on Soroban...");
    const isValid = await stellarService.verifyProductSoroban('TT-TEST-003', res.localHash);
    console.log("Is Valid?", isValid);
  } catch(e) {
    console.error("Test Error:", e);
  }
}
test();
