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
import { ProductsServicesModule } from '@/components/products/ProductsServicesModule';

import { Droplet } from 'lucide-react';

function H2OLifeAppContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'pos';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedClientForSale, setSelectedClientForSale] = useState<Client | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab;
    if (tabParam && ['pos', 'products', 'clients', 'camera', 'closure', 'tanks', 'finance', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-sky-500/30 mb-3 animate-pulse">
          <Droplet className="w-7 h-7 fill-white text-transparent" />
        </div>
        <p className="text-sm font-black text-slate-900 tracking-tight">H2O LIFE POS</p>
        <p className="text-xs text-sky-600 font-bold mt-1">Iniciando sistema de ventas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-mesh-water text-slate-900 selection:bg-sky-500 selection:text-white">
      <Navbar onNavigate={setActiveTab} activeTab={activeTab} />

      <main className="flex-1 w-full pb-36 sm:pb-40">
        {activeTab === 'pos' && (
          <PosModule
            isCartDrawerOpen={isCartDrawerOpen}
            setIsCartDrawerOpen={setIsCartDrawerOpen}
            preselectedClient={selectedClientForSale}
            onNavigateToProducts={() => setActiveTab('products')}
          />
        )}

        {activeTab === 'products' && <ProductsServicesModule />}

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

