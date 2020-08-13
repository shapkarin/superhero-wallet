import { mnemonicToSeed } from '@aeternity/bip39';
import { TxBuilder } from '@aeternity/aepp-sdk/es';
import { testAccount, txParams } from './config';

export const formatDate = time =>
  new Date(+time)
    .toLocaleString(navigator.language, {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h11',
    })
    .replace(/\//g, '.');
// MM/DD/YY
export const mockLogin = async (options = {}) => {
  await browser.storage.local.clear();
  const { mnemonic, publicKey } = testAccount;
  const seed = mnemonicToSeed(mnemonic).toString('hex');
  const keypair = {
    publicKey,
    privateKey: seed,
  };
  await browser.storage.local.set({ userAccount: keypair });
  const sub = [
    {
      name: 'Main Account',
      publicKey: keypair.publicKey,
      balance: 10,
      root: true,
    },
  ];
  if (options.tx) await browser.storage.local.set({ transactions: { pending: [options.tx] } });
  if (options.balance) await browser.storage.local.set({ balance: options.balance });
  if (options.lastRoute) await localStorage.setItem('lsroute', options.lastRoute);
  if (options.backupSeed) await browser.storage.local.set({ backed_up_Seed: true });
  if (options.name) {
    await browser.storage.local.set({
      state: { names: { defaults: { [`${keypair.publicKey}-ae_uat`]: options.name } } },
    });
  }
  await browser.storage.local.set({ subaccounts: sub, mnemonic });
};

export const mockLogout = async () => {
  await browser.storage.local.clear();
  localStorage.clear();
};

export const buildTx = txtype => TxBuilder.buildTx({ ...txParams[txtype] }, txtype);
