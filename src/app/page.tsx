import { redirect } from 'next/navigation';
import dapps from '@/config/dapps';

export default function Page() {
  redirect(`/${dapps[0].blockchainRid}`);
}
