import ClientPage from './client-page';
import { headers } from 'next/headers';

export default async function Page() {
  const headersList = await headers();
  const whopUserId = headersList.get('x-whop-user-id');
  
  return <ClientPage userId={whopUserId} />;
}