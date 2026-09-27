'use client';

import React, { useState } from 'react';
import { StoreProvider } from '@/lib/store';
import { Navbar } from '@/components/Navbar';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { PosModule } from '@/components/pos/PosModule';
import { AiCameraModule } from '@/components/camera/AiCameraModule';
import { CashClosureModule } from '@/components/closure/CashClosureModule';
import { TankModule } from '@/components/tanks/TankModule';
import { FinanceModule } from '@/components/finance/FinanceModule';

function H2OLifeApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 w-full">
        {activeTab === 'pos' && (
          <PosModule
            isCartDrawerOpen={isCartDrawerOpen}
            setIsCartDrawerOpen={setIsCartDrawerOpen}
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
      <H2OLifeApp />
    </StoreProvider>
  );
}
