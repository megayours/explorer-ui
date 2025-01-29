import { IClient } from "postchain-client";

export const getAccountId = async (client: IClient, evmAddress: string) => {
  const accounts = await client.query<{ data: { id: Buffer }[] }>('ft4.get_accounts_by_signer', {
    id: Buffer.from(evmAddress.slice(2), 'hex'), // Remove '0x' prefix
    page_size: 1,
    page_cursor: null
  });

  if (accounts.data.length === 0) return null;
  return accounts.data[0].id;
} 