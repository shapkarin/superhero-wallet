import { mnemonicToSeed } from '@aeternity/bip39';
import { TxBuilder } from '@aeternity/aepp-sdk/es';
import { testAccount, txParams } from './config';
import runMigrations from '../../store/migrations';

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

export const getLoginState = async ({ backedUpSeed, balance, name, pendingTransaction }) => {
  const { mnemonic, publicKey } = testAccount;
  const account = {
    publicKey,
    privateKey: mnemonicToSeed(mnemonic).toString('hex'),
  };
  return {
    ...(await runMigrations()),
    account,
    subaccounts: [
      {
        name: 'Main Account',
        publicKey: account.publicKey,
        balance: 10,
        root: true,
      },
    ],
    mnemonic,
    backedUpSeed,
    balance,
    ...(name && { names: { defaults: { [`${account.publicKey}-ae_uat`]: name } } }),
    ...(pendingTransaction && { transactions: { latest: [], pending: [pendingTransaction] } }),
  };
};

export const buildTx = txtype => TxBuilder.buildTx({ ...txParams[txtype] }, txtype);
