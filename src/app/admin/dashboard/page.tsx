'use client';

import dynamic from 'next/dynamic';

const SRGGMarketplaceUI = dynamic(
  () => import('@/components/SRGGMarketplaceUI'),
  { ssr: false }
);

export default function AdminDashboardPage() {
  return <SRGGMarketplaceUI />;
}
