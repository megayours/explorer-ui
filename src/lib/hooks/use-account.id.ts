import { useAccount } from 'wagmi';
import { useChain } from '../chain-switcher/chain-context';

export function useAccountId() {
  const { address } = useAccount();
  const { chainClient } = useChain();

  const getAccountId = async () => {
    if (!chainClient || !address) return null;

    const accounts = await chainClient.query<{ data: { id: Buffer }[] }>('ft4.get_accounts_by_signer', {
      id: Buffer.from(address.slice(2), 'hex'),  // Remove '0x' prefix
      page_size: 1,
      page_cursor: null
    });

    if (accounts.data.length === 0) return null;

    return accounts.data[0].id;
  }

  return {
    getAccountId
  }
}