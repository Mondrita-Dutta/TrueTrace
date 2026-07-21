#!/bin/bash
set -e

echo "Building the smart contract..."
cd blockchain
cargo build --target wasm32-unknown-unknown --release --locked

echo "Deploying the smart contract to Testnet..."
# Ensure stellar-cli is available (should be installed by GitHub Actions step)
CONTRACT_ID=$(stellar contract deploy --wasm target/wasm32-unknown-unknown/release/truetrace_contract.wasm --network testnet --source-account "$STELLAR_SECRET_KEY")

echo "Deployed Contract ID: $CONTRACT_ID"

cd ..

# Save to a shared config file that can be committed
mkdir -p shared
cat <<EOF > shared/contract.json
{
  "contractId": "$CONTRACT_ID",
  "network": "testnet",
  "deployedAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo "Contract ID updated in shared/contract.json."
