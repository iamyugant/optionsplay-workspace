import type { Metadata } from 'next';
import { DashboardView } from '@/components/dashboard/DashboardView';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Build your own options trading workspace from modular widgets.',
};

export default function DashboardPage() {
  return <DashboardView />;
}
