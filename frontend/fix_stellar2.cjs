const fs = require("fs");
let content = fs.readFileSync("src/services/stellarService.js", "utf8");

content = content.replace(
  /const account = await server\.loadAccount\(sourcePublicKey\);\s+const contract = new StellarSdk\.Contract\(CONTRACT_ID\);/,
  `let account;
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
  const contract = new StellarSdk.Contract(CONTRACT_ID);`
);

fs.writeFileSync("src/services/stellarService.js", content);