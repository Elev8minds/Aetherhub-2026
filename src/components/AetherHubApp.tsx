import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { VRProvider } from '@/contexts/VRContext';

export function AetherHubApp() {
  return (
    <AppProvider>
      <VRProvider>
        <AppLayout />
      </VRProvider>
    </AppProvider>
  );
}
