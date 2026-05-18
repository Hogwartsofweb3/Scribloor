import { Connection } from '@solana/web3.js';

const RPC_URL =
  process.env.NEXT_PUBLIC_HELIUS_RPC_URL ??
  'https://api.mainnet-beta.solana.com';

let _connection: Connection | null = null;

export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(RPC_URL, 'confirmed');
  }
  return _connection;
}
