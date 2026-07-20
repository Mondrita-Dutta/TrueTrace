import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { AlbedoModule } from '@creit.tech/stellar-wallets-kit/modules/albedo';
import { BitgetModule } from '@creit.tech/stellar-wallets-kit/modules/bitget';
import { CactusLinkModule } from '@creit.tech/stellar-wallets-kit/modules/cactuslink';
import { DcentModule } from '@creit.tech/stellar-wallets-kit/modules/dcent';
import { FordefiModule } from '@creit.tech/stellar-wallets-kit/modules/fordefi';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { HanaModule } from '@creit.tech/stellar-wallets-kit/modules/hana';
import { KleverModule } from '@creit.tech/stellar-wallets-kit/modules/klever';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';
import { OneKeyModule } from '@creit.tech/stellar-wallets-kit/modules/onekey';
import { RabetModule } from '@creit.tech/stellar-wallets-kit/modules/rabet';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';

StellarWalletsKit.init({
  network: Networks.TESTNET,
  selectedWalletId: "freighter",
  modules: [
    new AlbedoModule(),
    new xBullModule(),
    new FreighterModule(),
    new FordefiModule(),
    new RabetModule(),
    new LobstrModule(),
    new HanaModule(),
    new KleverModule(),
    new OneKeyModule(),
    new BitgetModule(),
    new CactusLinkModule(),
    new DcentModule()
  ]
});

export const getFriendlyErrorMessage = (error) => {
  const msg = (error?.message || error || "").toString().toLowerCase();
  if (msg.includes("user declined") || msg.includes("rejected") || msg.includes("cancelled")) {
    return "Action was cancelled in your wallet.";
  }
  if (msg.includes("not set up") || msg.includes("locked")) {
    return "Your wallet is locked. Please open the extension and unlock it.";
  }
  return error?.message || error || "An unexpected error occurred. Please try again.";
};

export const connectFreighter = async () => {
  try {
    const { address } = await StellarWalletsKit.authModal();
    return address;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const signXLMTransaction = async (xdrBase64) => {
  try {
    const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdrBase64);
    return signedTxXdr;
  } catch (error) {
    throw new Error(getFriendlyErrorMessage(error));
  }
};

