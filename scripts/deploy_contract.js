const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const StellarSdk = require('../backend/node_modules/@stellar/stellar-sdk');

const backendEnvPath = path.join(__dirname, '../backend/.env');
const frontendEnvPath = path.join(__dirname, '../frontend/.env');
const contractsDir = path.join(__dirname, '../blockchain');

// Helper to update or append to .env
function updateEnvFile(envPath, key, value) {
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  const regex = new RegExp(`^${key}=.*$`, 'm');
  if (regex.test(envContent)) {
    envContent = envContent.replace(regex, `${key}=${value}`);
  } else {
    envContent += `\n${key}=${value}\n`;
  }
  
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log(`Updated ${key} in ${envPath}`);
}

async function getMasterKey() {
  require('../backend/node_modules/dotenv').config({ path: backendEnvPath });
  let secret = process.env.STELLAR_SECRET_KEY;
  if (!secret) {
    console.log('No STELLAR_SECRET_KEY found. Generating a new one for deployment...');
    const keypair = StellarSdk.Keypair.random();
    secret = keypair.secret();
    updateEnvFile(backendEnvPath, 'STELLAR_SECRET_KEY', secret);
    
    // Fund it
    console.log('Funding new account on Testnet...');
    const res = await fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(keypair.publicKey())}`);
    if (res.ok) {
      console.log('Account funded successfully.');
    } else {
      console.error('Failed to fund account.');
      process.exit(1);
    }
  }
  return secret;
}

async function main() {
  console.log('Building Soroban Smart Contracts...');
  try {
    execSync('cargo build -j 1 --target wasm32-unknown-unknown --release', { 
      cwd: contractsDir, 
      stdio: 'inherit',
      env: { ...process.env, CARGO_TARGET_DIR: 'C:\\temp\\truetrace_target' }
    });
  } catch(e) {
    console.log("Cargo build failed, exiting...");
    process.exit(1);
  }

  // Get the strict secret key
  const secret = await getMasterKey();
  
  console.log('Deploying Metrics Contract to Testnet...');
  const metricsWasmPath = 'C:\\temp\\truetrace_target\\wasm32-unknown-unknown\\release\\metrics_contract.wasm';
  let metricsContractId = '';
  try {
    // Optimize metrics contract
    execSync(`.\\stellar.exe contract optimize --wasm ${metricsWasmPath}`, { cwd: contractsDir, stdio: 'inherit' });
    const output = execSync(
      `.\\stellar.exe contract deploy --wasm C:\\temp\\truetrace_target\\wasm32-unknown-unknown\\release\\metrics_contract.optimized.wasm --source ${secret} --network testnet`,
      { cwd: contractsDir, encoding: 'utf-8' }
    );
    metricsContractId = output.trim();
    console.log(`\nMetrics Contract deployed successfully! ID: ${metricsContractId}\n`);
  } catch (error) {
    console.error('Metrics Deployment failed:', error.message);
    process.exit(1);
  }

  console.log('Deploying TrueTrace Contract to Testnet...');
  const trueTraceWasmPath = 'C:\\temp\\truetrace_target\\wasm32-unknown-unknown\\release\\truetrace_contract.wasm';
  let trueTraceContractId = '';
  try {
    // Optimize truetrace contract
    execSync(`.\\stellar.exe contract optimize --wasm ${trueTraceWasmPath}`, { cwd: contractsDir, stdio: 'inherit' });
    const output = execSync(
      `.\\stellar.exe contract deploy --wasm C:\\temp\\truetrace_target\\wasm32-unknown-unknown\\release\\truetrace_contract.optimized.wasm --source ${secret} --network testnet`,
      { cwd: contractsDir, encoding: 'utf-8' }
    );
    trueTraceContractId = output.trim();
    console.log(`\nTrueTrace Contract deployed successfully! ID: ${trueTraceContractId}\n`);
  } catch (error) {
    console.error('TrueTrace Deployment failed:', error.message);
    process.exit(1);
  }

  console.log(`Linking TrueTrace to Metrics Contract...`);
  try {
    execSync(
      `.\\stellar.exe contract invoke --id ${trueTraceContractId} --source ${secret} --network testnet -- init --metrics_contract ${metricsContractId}`,
      { cwd: contractsDir, stdio: 'inherit' }
    );
    console.log(`\nContracts Linked Successfully!\n`);
  } catch (error) {
    console.error('Contract linking failed:', error.message);
    process.exit(1);
  }
    
  updateEnvFile(backendEnvPath, 'SOROBAN_CONTRACT_ID', trueTraceContractId);
  updateEnvFile(frontendEnvPath, 'VITE_SOROBAN_CONTRACT_ID', trueTraceContractId);
  updateEnvFile(backendEnvPath, 'METRICS_CONTRACT_ID', metricsContractId);
}

main().catch(console.error);
