import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Layers, 
  RotateCw, 
  Wrench, 
  ClipboardCheck, 
  Settings, 
  ShieldCheck,
  AlertCircle,
  Menu,
  ChevronRight,
  Sparkles,
  Award,
  X
} from 'lucide-react';

import { 
  Asset, 
  Location, 
  Responsible, 
  AssetMovement, 
  Maintenance, 
  Inventory, 
  DashboardStats,
  User as UserType 
} from './types';

// Components
import { Dashboard } from './components/Dashboard';
import { AssetsList } from './components/AssetsList';
import { MovementsView } from './components/MovementsView';
import { MaintenanceView } from './components/MaintenanceView';
import { InventoryView } from './components/InventoryView';
import { LocationsAndResponsiblesView } from './components/LocationsAndResponsiblesView';
import { AuthBadge } from './components/AuthBadge';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication simulator
  const [currentUser, setCurrentUser] = useState<UserType>({ 
    id: 'usr-1', 
    name: 'Sergio MasterOp', 
    email: 'sergio@masterop.com.br', 
    role: 'admin' 
  });

  // Server entities state
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [movements, setMovements] = useState<AssetMovement[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [inventories, setInventories] = useState<Inventory[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    totalValue: 0,
    maintenanceCount: 0,
    pendingMovementsCount: 0,
    categoryDistribution: { furniture: 0, it: 0, machinery: 0, vehicles: 0, other: 0 },
    statusDistribution: { active: 0, maintenance: 0, transferred: 0, retired: 0 },
    monthlyAcquisitions: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');

  // Fetch full dataset from API endpoints
  async function refreshAllData() {
    setIsLoading(true);
    setErrorBanner('');
    try {
      const [
        resAssets, 
        resLocations, 
        resResponsibles, 
        resMovements, 
        resMaintenances, 
        resInventories, 
        resStats
      ] = await Promise.all([
        fetch('/api/assets').then(r => r.json()),
        fetch('/api/locations').then(r => r.json()),
        fetch('/api/responsibles').then(r => r.json()),
        fetch('/api/movements').then(r => r.json()),
        fetch('/api/maintenances').then(r => r.json()),
        fetch('/api/inventories').then(r => r.json()),
        fetch('/api/dashboard').then(r => r.json())
      ]);

      setAssets(resAssets);
      setLocations(resLocations);
      setResponsibles(resResponsibles);
      setMovements(resMovements);
      setMaintenances(resMaintenances);
      setInventories(resInventories);
      setStats(resStats);
    } catch (err) {
      console.error("Error retrieving dataset: ", err);
      setErrorBanner('Houve uma falha na comunicação com o servidor de dados patrimoniais.');
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, []);

  // Post Asset
  const handleAddAsset = async (newAssetData: Omit<Asset, 'id'>) => {
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssetData)
      });
      if (!res.ok) throw new Error('Erro ao salvar novo ativo.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Update Asset
  const handleUpdateAsset = async (id: string, updatedFields: Partial<Asset>) => {
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Erro ao editar o ativo.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id: string) => {
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Falha ao remover o ativo patrimonial.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Register movement
  const handleRegisterMovement = async (movementData: { assetId: string, toLocationId: string, toResponsibleId: string, reason: string }) => {
    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementData)
      });
      if (!res.ok) throw new Error('Não foi possível transferir este ativo.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add Maintenance
  const handleAddMaintenance = async (maintData: any) => {
    try {
      const res = await fetch('/api/maintenances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(maintData)
      });
      if (!res.ok) throw new Error('Erro ao criar chamado de manutenção.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Finish/Update Maintenance
  const handleUpdateMaintenance = async (id: string, updateFields: { status: 'completed' | 'canceled'; endDate?: string; cost?: number }) => {
    try {
      const res = await fetch(`/api/maintenances/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateFields)
      });
      if (!res.ok) throw new Error('Erro ao fechar chamado de manutenção.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Start Inventory
  const handleStartInventory = async (title: string) => {
    try {
      const res = await fetch('/api/inventories/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Falha ao iniciar inventário geral.');
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Scan item physically
  const handleScanAsset = async (tag: string, observations?: string) => {
    try {
      const res = await fetch('/api/inventories/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tag, observations })
      });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Esse código de etiqueta não pertence a ativos pendentes desta auditoria.');
      }
      await refreshAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Stop / Finish current inventory
  const handleFinishInventory = async (inventoryId: string) => {
    try {
      const res = await fetch('/api/inventories/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inventoryId })
      });
      if (!res.ok) throw new Error('Erro ao finalizar o inventário.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add custom physical Location
  const handleAddLocation = async (locData: Omit<Location, 'id'>) => {
    try {
      const res = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locData)
      });
      if (!res.ok) throw new Error('Falha ao readequar local.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add custom Responsible guardian
  const handleAddResponsible = async (respData: Omit<Responsible, 'id'>) => {
    try {
      const res = await fetch('/api/responsibles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respData)
      });
      if (!res.ok) throw new Error('Falha ao readequar responsável.');
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Navigation config links matching "Professional Polish"
  const navigationItems = [
    { id: 'dashboard', label: 'Monitor Geral', icon: Building2 },
    { id: 'assets', label: 'Ativos Fixos', icon: Layers },
    { id: 'movements', label: 'Transferências', icon: RotateCw },
    { id: 'maintenance', label: 'Manutenção / OS', icon: Wrench },
    { id: 'inventory', label: 'Inventário Físico', icon: ClipboardCheck },
    { id: 'structures', label: 'Unidades / Pessoas', icon: Settings }
  ];

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden" id="app-root-shell">
      
      {/* SIDEBAR NAVIGATION - MATCHING Professional Polish theme */}
      <nav 
        id="sidebar-navigation"
        className={`w-64 bg-slate-900 flex-shrink-0 flex flex-col z-40 transition-all duration-300 absolute md:relative inset-y-0 left-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white shadow-lg shadow-indigo-600/30 text-base">
              P
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">Patrimonium ERP</span>
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Sistema de Ativos</span>
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu selections */}
        <div className="flex-1 p-4 mb-4 space-y-1.5 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigateToTab(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-indigo-650/20 text-indigo-400 border-l-4 border-indigo-500 font-bold' 
                    : 'text-slate-400 hover:bg-slate-800 rounded-lg text-slate-300 font-medium'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                  <span className="text-xs tracking-medium">{item.label}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isSelected ? 'text-indigo-400' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        {/* User Identity widget inside navigation */}
        <div className="mt-auto p-4 border-t border-slate-800 bg-slate-950/40">
          <AuthBadge currentUser={currentUser} onChangeUser={setCurrentUser} />
          <div className="mt-3 text-center">
            <span className="text-[10px] font-mono text-slate-500">Unidade SP-01 • Versão 2.4.0</span>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col overflow-hidden relative" id="main-frame">
        
        {/* Header bar */}
        <header className="h-16 bg-white border-b border-slate-150 px-6 flex items-center justify-between flex-shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 md:hidden block rounded-lg hover:bg-slate-50"
              id="mobile-nav-toggle"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded px-2 py-0.5">
                ESTADO ATUAL
              </span>
              <p className="text-xs font-medium text-slate-600">
                Auditoria Geral SOX {new Date().getFullYear()} ativa e monitorada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Ambiente Seguro</span>
            </div>

            {/* Quick state reset trigger */}
            <button
              onClick={() => refreshAllData()}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all cursor-pointer"
              title="Forçar Re-sincronia de dados"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center gap-3 text-sm text-rose-700 font-medium">
            <AlertCircle className="w-5 h-5 shrink-0 animate-bounce" />
            <span>{errorBanner}</span>
            <button onClick={() => setErrorBanner('')} className="ml-auto text-rose-500 hover:text-rose-900 font-bold">FECHAR</button>
          </div>
        )}

        {/* Scrollable View Container */}
        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-10 h-10 border-4 border-indigo-250 border-t-indigo-600 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Sincronizando Banco de Dados...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <Dashboard stats={stats} onNavigateToTab={handleNavigateToTab} />
              )}

              {activeTab === 'assets' && (
                <AssetsList
                  assets={assets}
                  locations={locations}
                  responsibles={responsibles}
                  currentUser={currentUser}
                  onAddAsset={handleAddAsset}
                  onUpdateAsset={handleUpdateAsset}
                  onDeleteAsset={handleDeleteAsset}
                />
              )}

              {activeTab === 'movements' && (
                <MovementsView
                  movements={movements}
                  assets={assets}
                  locations={locations}
                  responsibles={responsibles}
                  currentUser={currentUser}
                  onRegisterMovement={handleRegisterMovement}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceView
                  maintenances={maintenances}
                  assets={assets}
                  currentUser={currentUser}
                  onAddMaintenance={handleAddMaintenance}
                  onUpdateMaintenance={handleUpdateMaintenance}
                />
              )}

              {activeTab === 'inventory' && (
                <InventoryView
                  inventories={inventories}
                  currentUser={currentUser}
                  onStartInventory={handleStartInventory}
                  onScanAsset={handleScanAsset}
                  onFinishInventory={handleFinishInventory}
                />
              )}

              {activeTab === 'structures' && (
                <LocationsAndResponsiblesView
                  locations={locations}
                  responsibles={responsibles}
                  currentUser={currentUser}
                  onAddLocation={handleAddLocation}
                  onAddResponsible={handleAddResponsible}
                />
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
