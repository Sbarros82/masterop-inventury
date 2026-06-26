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
  Trash2,
  X,
  FileText
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
import { ReportsView } from './components/ReportsView';

// Local Storage Driver for Offline/Vercel support
import {
  localGetAssets,
  localAddAsset,
  localUpdateAsset,
  localDeleteAsset,
  localGetLocations,
  localAddLocation,
  localUpdateLocation,
  localDeleteLocation,
  localGetResponsibles,
  localAddResponsible,
  localGetMovements,
  localAddMovement,
  localGetMaintenances,
  localAddMaintenance,
  localUpdateMaintenance,
  localGetInventories,
  localStartInventory,
  localScanAsset,
  localFinishInventory,
  localGetStats
} from './utils/localDb';

// Cloud Firebase Firestore integration
import {
  fbGetAssets,
  fbGetLocations,
  fbGetResponsibles,
  fbGetMovements,
  fbGetMaintenances,
  fbGetInventories,
  fbAddAsset,
  fbAddLocation,
  fbUpdateLocation,
  fbDeleteLocation,
  fbAddResponsible,
  fbUpdateAsset,
  fbDeleteAsset,
  fbAddMovement,
  fbAddMaintenance,
  fbUpdateMaintenance,
  fbStartInventory,
  fbScanAsset,
  fbFinishInventory,
  fbGetStats,
  fbWipeAllData
} from './utils/firebaseDb';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('search') || params.has('tag')) {
      return 'assets';
    }
    return 'dashboard';
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connection mode (Defaults to Cloud Firebase Firestore. Toggleable to Local Browser offline storage)
  const [localMode, setLocalMode] = useState<boolean>(false);

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
    categoryDistribution: { furniture: 0, it: 0, machinery: 0, vehicles: 0, electronics: 0, other: 0 },
    statusDistribution: { active: 0, maintenance: 0, transferred: 0, retired: 0 },
    monthlyAcquisitions: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');

  // Fetch full dataset from Cloud DB / Local DB
  async function refreshAllData() {
    setIsLoading(true);
    setErrorBanner('');

    if (localMode) {
      try {
        setAssets(localGetAssets());
        setLocations(localGetLocations());
        setResponsibles(localGetResponsibles());
        setMovements(localGetMovements());
        setMaintenances(localGetMaintenances());
        setInventories(localGetInventories());
        setStats(localGetStats());
      } catch (err) {
        console.error("Local data load fail:", err);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const [
        resAssets, 
        resLocations, 
        resResponsibles, 
        resMovements, 
        resMaintenances, 
        resInventories
      ] = await Promise.all([
        fbGetAssets(),
        fbGetLocations(),
        fbGetResponsibles(),
        fbGetMovements(),
        fbGetMaintenances(),
        fbGetInventories()
      ]);

      // Calculate stats instantly on the client using the pre-loaded data
      const resStats = await fbGetStats(resAssets, resMaintenances);

      setAssets(resAssets || []);
      setLocations(resLocations || []);
      setResponsibles(resResponsibles || []);
      setMovements(resMovements || []);
      setMaintenances(resMaintenances || []);
      setInventories(resInventories || []);
      setStats(resStats);
    } catch (err: any) {
      console.error("Error retrieving Cloud Firestore dataset: ", err);
      setErrorBanner(`Falha ao carregar banco em tempo real: ${err.message || err}. Alterando modo para offline local temporário.`);
      setLocalMode(true);
      try {
        setAssets(localGetAssets());
        setLocations(localGetLocations());
        setResponsibles(localGetResponsibles());
        setMovements(localGetMovements());
        setMaintenances(localGetMaintenances());
        setInventories(localGetInventories());
        setStats(localGetStats());
      } catch (localErr) {
        console.error("Local fallback failed:", localErr);
      }
    } finally {
      setIsLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [localMode]);

  // Post Asset
  const handleAddAsset = async (newAssetData: Omit<Asset, 'id'>) => {
    try {
      if (localMode) {
        localAddAsset(newAssetData);
      } else {
        await fbAddAsset(newAssetData);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Update Asset
  const handleUpdateAsset = async (id: string, updatedFields: Partial<Asset>) => {
    try {
      if (localMode) {
        localUpdateAsset(id, updatedFields);
      } else {
        await fbUpdateAsset(id, updatedFields);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (id: string) => {
    try {
      if (localMode) {
        localDeleteAsset(id);
      } else {
        await fbDeleteAsset(id);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Register movement
  const handleRegisterMovement = async (movementData: { assetId: string, toLocationId: string, toResponsibleId: string, reason: string }) => {
    try {
      if (localMode) {
        localAddMovement(movementData);
      } else {
        await fbAddMovement(movementData);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add Maintenance
  const handleAddMaintenance = async (maintData: any) => {
    try {
      if (localMode) {
        localAddMaintenance(maintData);
      } else {
        await fbAddMaintenance(maintData);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Finish/Update Maintenance
  const handleUpdateMaintenance = async (id: string, updateFields: { status: 'completed' | 'canceled'; endDate?: string; cost?: number }) => {
    try {
      if (localMode) {
        localUpdateMaintenance(id, updateFields);
      } else {
        await fbUpdateMaintenance(id, updateFields);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Start Inventory
  const handleStartInventory = async (title: string) => {
    try {
      if (localMode) {
        localStartInventory(title);
      } else {
        await fbStartInventory(title);
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
      if (localMode) {
        localScanAsset(tag, observations);
      } else {
        await fbScanAsset(tag, observations);
      }
      await refreshAllData();
    } catch (err: any) {
      throw err;
    }
  };

  // Stop / Finish current inventory
  const handleFinishInventory = async (inventoryId: string) => {
    try {
      if (localMode) {
        localFinishInventory(inventoryId);
      } else {
        await fbFinishInventory(inventoryId);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add custom physical Location
  const handleAddLocation = async (locData: Omit<Location, 'id'>) => {
    try {
      if (localMode) {
        localAddLocation(locData);
      } else {
        await fbAddLocation(locData);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Update physical Location
  const handleUpdateLocation = async (id: string, locData: Partial<Location>) => {
    try {
      if (localMode) {
        localUpdateLocation(id, locData);
      } else {
        await fbUpdateLocation(id, locData);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Delete physical Location
  const handleDeleteLocation = async (id: string) => {
    try {
      if (localMode) {
        localDeleteLocation(id);
      } else {
        await fbDeleteLocation(id);
      }
      await refreshAllData();
    } catch (err: any) {
      alert(err.message);
      throw err;
    }
  };

  // Add custom Responsible guardian
  const handleAddResponsible = async (respData: Omit<Responsible, 'id'>) => {
    try {
      if (localMode) {
        localAddResponsible(respData);
      } else {
        await fbAddResponsible(respData);
      }
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
    { id: 'reports', label: 'Relatórios', icon: FileText },
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
              M
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block">Masterop Patrimonial</span>
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
            <button 
              onClick={() => {
                const choice = confirm(
                  localMode 
                    ? "Deseja alternar para o BANCO DE DADOS CLOUD FIREBASE? Seus dados serão gravados na nuvem em tempo real e sincronizados com outros PCs."
                    : "Deseja alternar para o MODO LOCAL OFFLINE? Seus dados ficarão armazenados apenas neste navegador de forma provisória."
                );
                if (choice) {
                  setLocalMode(!localMode);
                }
              }}
              title="Clique para alternar entre Banco de Dados Cloud (Sincronizado) e Banco Local (Offline)"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-all duration-200 ${
                localMode 
                  ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{localMode ? 'Banco Local (Offline)' : 'Banco Cloud Firestore (Sincronizado)'}</span>
            </button>



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
        <div id="scrollable-content-wrapper" className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl mx-auto w-full">
          
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

              {activeTab === 'reports' && (
                <ReportsView
                  assets={assets}
                  locations={locations}
                  responsibles={responsibles}
                />
              )}

              {activeTab === 'structures' && (
                <LocationsAndResponsiblesView
                  locations={locations}
                  responsibles={responsibles}
                  currentUser={currentUser}
                  onAddLocation={handleAddLocation}
                  onUpdateLocation={handleUpdateLocation}
                  onDeleteLocation={handleDeleteLocation}
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
