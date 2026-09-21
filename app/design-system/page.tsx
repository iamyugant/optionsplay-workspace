import type { Metadata } from 'next';
import { DesignSystemPage } from '@/components/design-system/DesignSystemPage';

export const metadata: Metadata = {
  title: 'Design System',
  description: 'Tokens, components, usage guidelines, accessibility record and MCP handoff for OptionsPlay.',
};

export default function DesignSystemRoute() {
  return <DesignSystemPage />;
}
