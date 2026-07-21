const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
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
  console.log('Building Soroban Smart Contract...');
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

  const secret = await getMasterKey();
  
  console.log('Deploying to Testnet...');
  const wasmPath = 'C:\\temp\\truetrace_target\\wasm32-unknown-unknown\\release\\truetrace_contract.optimized.wasm';
  
  try {
    const output = execSync(
      `.\\stellar.exe contract deploy --wasm ${wasmPath} --source ${secret} --network testnet`,
      { cwd: contractsDir, encoding: 'utf-8' }
    );
    
    const contractId = output.trim();
    console.log(`\nContract deployed successfully!`);
    console.log(`Contract ID: ${contractId}\n`);
    
    updateEnvFile(backendEnvPath, 'SOROBAN_CONTRACT_ID', contractId);
    updateEnvFile(frontendEnvPath, 'VITE_SOROBAN_CONTRACT_ID', contractId);
    
  } catch (error) {
    console.error('Deployment failed:', error.message);
    if (error.stdout) console.error('stdout:', error.stdout.toString());
    if (error.stderr) console.error('stderr:', error.stderr.toString());
    process.exit(1);
  }
}

main().catch(console.error);
