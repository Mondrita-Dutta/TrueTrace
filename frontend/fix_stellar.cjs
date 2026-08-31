const fs = require("fs");
let content = fs.readFileSync("src/services/stellarService.js", "utf8");

const original = `export const buildSorobanTransaction = async (sourcePublicKey, method, args) => {
  if (!CONTRACT_ID) throw new Error("Contract ID not found in .env. Please deploy the contract first.");

  const account = await server.loadAccount(sourcePublicKey);
  const contract = new StellarSdk.Contract(CONTRACT_ID);`;

const replacement = `export const buildSorobanTransaction = async (sourcePublicKey, method, args) => {
  if (!CONTRACT_ID) throw new Error("Contract ID not found in .env. Please deploy the contract first.");

  let account;
  try {
    account = await server.loadAccount(sourcePublicKey);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("Account not found on testnet, attempting to fund via Friendbot...");
      try {
        await fetch(\`https://friendbot.stellar.org?addr=\${sourcePublicKey}\`);
        account = await server.loadAccount(sourcePublicKey);
      } catch (fundError) {
        throw new Error("Your wallet account is not funded on the Stellar Testnet. Please fund it via Friendbot.");
      }
    } else {
      throw error;
    }
  }
  const contract = new StellarSdk.Contract(CONTRACT_ID);`;

content = content.replace(original, replacement);
fs.writeFileSync("src/services/stellarService.js", content);