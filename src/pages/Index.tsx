
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { VRProvider } from '@/contexts/VRContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <VRProvider>
        <AppLayout />
      </VRProvider>
    </AppProvider>
  );
};

export default Index;
