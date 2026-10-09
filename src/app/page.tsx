'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { BottomNav, ActiveTab } from '@/components/BottomNav';
import { PosModule } from '@/components/pos/PosModule';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { Client } from '@/types';
import { useH2OStore } from '@/lib/store';
import { hasPermission } from '@/lib/auth';
import { LaunchAnimation } from '@/components/common/LaunchAnimation';

// Componente visual de carga suave para transiciones fluidas de pestañas
function TabLoadingSkeleton({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-in fade-in duration-150">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-100 to-cyan-50 flex items-center justify-center border border-sky-200/60 shadow-2xs">
          <div className="w-4 h-4 rounded-full bg-sky-500 animate-pulse" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs text-sky-600 font-semibold">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-white/80 border border-slate-200/70 p-4 shadow-2xs animate-pulse">
            <div className="w-1/2 h-4 bg-slate-200 rounded-lg mb-3" />
            <div className="w-3/4 h-3 bg-slate-100 rounded-md mb-2" />
            <div className="w-1/3 h-5 bg-sky-100/70 rounded-md mt-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Carga Dinámica Optimizada: Reduce drásticamente el bundle JS inicial de 8 módulos a solo el POS principal
const ProductsServicesPanel = dynamic(
  () => import('@/components/products/ProductsServicesPanel').then((m) => m.ProductsServicesPanel),
  {
    loading: () => <TabLoadingSkeleton title="Catálogo de Productos & Servicios" subtitle="Cargando inventario y tarifas..." />,
    ssr: false,
  }
);

const ClientsModule = dynamic(
  () => import('@/components/clients/ClientsModule').then((m) => m.ClientsModule),
  {
    loading: () => <TabLoadingSkeleton title="Directorio de Clientes" subtitle="Cargando rutas y geolocalización..." />,
    ssr: false,
  }
);

const AiCameraModule = dynamic(
  () => import('@/components/camera/AiCameraModule').then((m) => m.AiCameraModule),
  {
    loading: () => <TabLoadingSkeleton title="Cámara Inteligente" subtitle="Inicializando sensor de visión por IA..." />,
    ssr: false,
  }
);

const CashClosureModule = dynamic(
  () => import('@/components/closure/CashClosureModule').then((m) => m.CashClosureModule),
  {
    loading: () => <TabLoadingSkeleton title="Cierre de Caja" subtitle="Calculando balance y arqueo del turno..." />,
    ssr: false,
  }
);

const TankModule = dynamic(
  () => import('@/components/tanks/TankModule').then((m) => m.TankModule),
  {
    loading: () => <TabLoadingSkeleton title="Monitoreo de Tanques" subtitle="Cargando niveles de agua y telemetría..." />,
    ssr: false,
  }
);

const FinanceModule = dynamic(
  () => import('@/components/finance/FinanceModule').then((m) => m.FinanceModule),
  {
    loading: () => <TabLoadingSkeleton title="Métricas Financieras" subtitle="Consolidando ingresos y gastos..." />,
    ssr: false,
  }
);

const SettingsPanel = dynamic(
  () => import('@/components/settings/SettingsPanel').then((m) => m.SettingsPanel),
  {
    loading: () => <TabLoadingSkeleton title="Configuración H2O Life" subtitle="Cargando opciones del sistema..." />,
    ssr: false,
  }
);

const AuditLogModule = dynamic(
  () => import('@/components/admin/AuditLogModule').then((m) => m.AuditLogModule),
  {
    loading: () => <TabLoadingSkeleton title="Bitácora de Seguridad" subtitle="Cargando registros de auditoría..." />,
    ssr: false,
  }
);

function H2OLifeAppContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ActiveTab) || 'pos';
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [selectedClientForSale, setSelectedClientForSale] = useState<Client | null>(null);
  
  const { isAuthenticated, currentUser } = useH2OStore();

  // Redirección de seguridad: Si cambia de perfil a uno sin permisos mientras está en una pestaña restringida
  useEffect(() => {
    if (activeTab === 'audit' && !hasPermission(currentUser, 'audit')) {
      setActiveTab('pos');
    }
    if (activeTab === 'settings' && !hasPermission(currentUser, 'admin')) {
      setActiveTab('pos');
    }
    if (activeTab === 'finance' && !hasPermission(currentUser, 'admin')) {
      setActiveTab('pos');
    }
  }, [activeTab, currentUser]);

  useEffect(() => {
    const tabParam = searchParams.get('tab') as ActiveTab;
    if (tabParam && ['pos', 'products', 'clients', 'camera', 'closure', 'tanks', 'finance', 'settings', 'audit'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Precarga inteligente en segundo plano durante momentos ociosos del navegador (Idle-Time Prefetching)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const prefetchSecondaryChunks = () => {
      import('@/components/products/ProductsServicesPanel');
      import('@/components/clients/ClientsModule');
      import('@/components/closure/CashClosureModule');
      import('@/components/tanks/TankModule');
    };

    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void, opt: { timeout: number }) => number }).requestIdleCallback(
        prefetchSecondaryChunks,
        { timeout: 2500 }
      );
      return () => {
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(handle);
        }
      };
    } else {
      const timer = setTimeout(prefetchSecondaryChunks, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const [showLaunch, setShowLaunch] = useState(true);

  if (!isAuthenticated) {
    return (
      <>
        {showLaunch && <LaunchAnimation onComplete={() => setShowLaunch(false)} />}
        <LoginScreen />
      </>
    );
  }

  return (
    <>
      {showLaunch && <LaunchAnimation onComplete={() => setShowLaunch(false)} />}
      <div
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-slate-50 bg-mesh-water text-slate-900 selection:bg-sky-500 selection:text-white"
      >
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

        {activeTab === 'products' && <ProductsServicesPanel />}

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

        {activeTab === 'settings' && <SettingsPanel />}

        {activeTab === 'audit' && <AuditLogModule />}
      </main>

      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartDrawerOpen(true)}
      />
    </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sky-700 font-bold text-xs">
          Cargando H2O Life POS...
        </div>
      }
    >
      <H2OLifeAppContent />
    </Suspense>
  );
}
