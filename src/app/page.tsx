'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { StoreProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { PosModule } from '@/components/pos/PosModule';
import { ClientsModule } from '@/components/clients/ClientsModule';
import { AiCameraModule } from '@/components/camera/AiCameraModule';
import { CashClosureModule } from '@/components/closure/CashClosureModule';
import { TankModule } from '@/components/tanks/TankModule';
import { FinanceModule } from '@/components/finance/FinanceModule';
import { Client } from '@/types';
import { SettingsModule } from '@/components/settings/SettingsModule';

function H2OLifeAppContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'pos';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedClientForSale, setSelectedClientForSale] = useState<Client | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab;
    if (tabParam && ['pos', 'clients', 'camera', 'closure', 'tanks', 'finance', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar onNavigate={setActiveTab} activeTab={activeTab} />

      <main className="flex-1 w-full pb-36 sm:pb-40">
        {activeTab === 'pos' && (
          <PosModule
            isCartDrawerOpen={isCartDrawerOpen}
            setIsCartDrawerOpen={setIsCartDrawerOpen}
            preselectedClient={selectedClientForSale}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsModule
            onSelectClientForSale={(client) => {
              setSelectedClientForSale(client);
              setActiveTab('pos');
            }}
          />
        )}

        {activeTab === 'camera' && (
          <AiCameraModule
            onProductAddedToCart={() => {
              setActiveTab('pos');
              setIsCartDrawerOpen(true);
            }}
          />
        )}

        {activeTab === 'closure' && <CashClosureModule />}

        {activeTab === 'tanks' && <TankModule />}

        {activeTab === 'finance' && <FinanceModule />}

        {activeTab === 'settings' && <SettingsModule />}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />
    </div>
  );
}

export default function Page() {
  return (
    <StoreProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-700 font-bold text-xs">
            Cargando H2O Life POS...
          </div>
        }
      >
        <H2OLifeAppContent />
      </Suspense>
    </StoreProvider>
  );
}

