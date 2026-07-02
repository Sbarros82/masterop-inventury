import React, { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  MapPin, 
  FolderPlus, 
  Users, 
  CheckCircle,
  Hash,
  AtSign,
  Briefcase,
  Layers,
  X,
  AlertCircle,
  Pencil,
  Trash2,
  Database,
  UploadCloud
} from 'lucide-react';
import { Location, Responsible, User as UserType } from '../types';
import { getLocalDb } from '../utils/localDb';

interface LocationsAndResponsiblesViewProps {
  locations: Location[];
  responsibles: Responsible[];
  currentUser: UserType;
  onAddLocation: (data: Omit<Location, 'id'>) => Promise<void>;
  onUpdateLocation: (id: string, data: Partial<Location>) => Promise<void>;
  onDeleteLocation: (id: string) => Promise<void>;
  onAddResponsible: (data: Omit<Responsible, 'id'>) => Promise<void>;
  onSyncLocalToCloud?: () => Promise<void>;
  isLocalMode?: boolean;
}

export function LocationsAndResponsiblesView({
  locations,
  responsibles,
  currentUser,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  onAddResponsible,
  onSyncLocalToCloud,
  isLocalMode = false
}: LocationsAndResponsiblesViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'responsibles'>('locations');
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Location Form
  const [editingLocId, setEditingLocId] = useState<string | null>(null);
  const [locName, setLocName] = useState('');
  const [locBuilding, setLocBuilding] = useState('');
  const [locFloor, setLocFloor] = useState('');
  const [locDesc, setLocDesc] = useState('');
  const [locBranch, setLocBranch] = useState('');

  // Responsible Form
  const [respName, setRespName] = useState('');
  const [respEmail, setRespEmail] = useState('');
  const [respDept, setRespDept] = useState('');

  const canModify = currentUser.role === 'admin' || currentUser.role === 'operator';

  const handleStartEditLoc = (loc: Location) => {
    setErrorText('');
    setEditingLocId(loc.id);
    setLocName(loc.name);
    setLocBranch(loc.branch || 'Matriz');
    setLocBuilding(loc.building);
    setLocFloor(loc.floor);
    setLocDesc(loc.description || '');
    setIsLocModalOpen(true);
  };

  const handleCloseLocModal = () => {
    setIsLocModalOpen(false);
    setEditingLocId(null);
    setLocName('');
    setLocBranch('');
    setLocBuilding('');
    setLocFloor('');
    setLocDesc('');
  };

  const handleDeleteLocClick = async (locId: string) => {
    const confirmDel = window.confirm("⚠️ ATENÇÃO: Tem certeza de que realmente deseja excluir esta localização? Essa ação não pode ser desfeita.");
    if (!confirmDel) return;
    try {
      await onDeleteLocation(locId);
    } catch (err: any) {
      alert(err.message || "Erro ao excluir localização.");
    }
  };

  const handleLocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!locName.trim()) {
      setErrorText('Por favor, informe a descrição ou nome da área física.');
      return;
    }
    if (!locBuilding.trim()) {
      setErrorText('Por favor, informe o edifício ou galpão.');
      return;
    }

    try {
      if (editingLocId) {
        await onUpdateLocation(editingLocId, {
          name: locName,
          building: locBuilding,
          floor: locFloor,
          description: locDesc,
          branch: locBranch || 'Matriz'
        });
      } else {
        await onAddLocation({
          name: locName,
          building: locBuilding,
          floor: locFloor,
          description: locDesc,
          branch: locBranch || 'Matriz'
        });
      }
      handleCloseLocModal();
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao salvar a localização.');
    }
  };

  const handleRespSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!respName.trim()) {
      setErrorText('Por favor, informe o nome do responsável.');
      return;
    }
    if (!respEmail.trim()) {
      setErrorText('Por favor, cadastre um email para envio de notificações patrimoniais.');
      return;
    }
    if (!respDept.trim()) {
      setErrorText('Por favor, informe o departamento corporativo.');
      return;
    }

    try {
      await onAddResponsible({
        name: respName,
        email: respEmail,
        department: respDept
      });
      setIsRespModalOpen(false);
      setRespName('');
      setRespEmail('');
      setRespDept('');
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao registrar responsável.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="locations-responsibles-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configurações de Estrutura</h1>
          <p className="text-sm text-slate-500">Mapeamento de edifícios operacionais e gestores designados para a custódia de bens.</p>
        </div>

        {/* Sub-tab pilot toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/50">
          <button
            onClick={() => setActiveSubTab('locations')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'locations' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Localizações ({locations.length})</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('responsibles')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'responsibles' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Responsáveis ({responsibles.length})</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'locations' ? (
        <div className="space-y-4" id="locations-segment">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Lista Geral de Prédios e Unidades</h3>
            {canModify && (
              <button
                onClick={() => {
                  handleCloseLocModal();
                  setIsLocModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Nova Unidade</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((loc) => (
              <div key={loc.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-150 transition-all flex flex-col justify-between shadow-xs">
                <div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 text-indigo-600 border border-slate-100 rounded-md py-0.5 px-2 max-w-fit font-bold">
                        <Hash className="w-3 h-3" />
                        <span>{loc.id}</span>
                      </div>
                      <span className="text-[10px] bg-indigo-50/60 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100/40">
                        Filial: {loc.branch || 'Matriz'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm leading-tight">{loc.name}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{loc.description || 'Sem descrição física declarada.'}</p>
                  </div>

                  <div className="border-t border-slate-50/80 mt-4 pt-3 grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400">
                    <div>
                      <span className="uppercase block font-bold text-[9px] text-slate-300">Edifício</span>
                      <span className="text-slate-650 font-bold truncate block mt-0.5">{loc.building}</span>
                    </div>
                    <div>
                      <span className="uppercase block font-bold text-[9px] text-slate-300">Andar / Pavimento</span>
                      <span className="text-slate-650 font-bold truncate block mt-0.5">{loc.floor || 'Térreo'}</span>
                    </div>
                  </div>
                </div>

                {canModify && (
                  <div className="border-t border-slate-100 mt-4 pt-3 flex items-center justify-end gap-3 text-[11px]">
                    <button
                      onClick={() => handleStartEditLoc(loc)}
                      className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                      title="Editar localização"
                    >
                      <Pencil className="w-3 h-3 text-indigo-500" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => handleDeleteLocClick(loc.id)}
                      className="flex items-center gap-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold"
                      title="Excluir localização"
                    >
                      <Trash2 className="w-3 h-3 text-rose-500" />
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4" id="responsibles-segment">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Custodiantes e Gestores Responsáveis</h3>
            {canModify && (
              <button
                onClick={() => {
                  setErrorText('');
                  setIsRespModalOpen(true);
                }}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Registrar Responsável</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {responsibles.map((resp) => (
              <div key={resp.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-150 transition-all flex flex-col justify-between shadow-xs">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-mono bg-slate-50 text-slate-500 border border-slate-100 rounded-md py-0.5 px-2 font-bold">
                      <Hash className="w-3 h-3" />
                      <span>{resp.id}</span>
                    </div>
                    <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md border border-indigo-100/30">
                      Gestor Ativo
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-950 text-sm">{resp.name}</h4>
                </div>

                <div className="border-t border-slate-50 mt-4 pt-3 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500">
                    <AtSign className="w-3.5 h-3.5 text-slate-300" />
                    <span className="truncate">{resp.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                    <span>Depto: <strong>{resp.department}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEÇÃO DE SINCRONIZAÇÃO E DIAGNÓSTICO */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mt-6 shadow-xs" id="data-sync-diagnostic-panel">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-600">
                <Database className="w-4 h-4 text-indigo-500" />
              </span>
              <h3 className="text-sm font-bold text-slate-800">Sincronização entre Dispositivos (Celular & Notebook)</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              O sistema suporta dois modos de operação. Se você cadastrou dados no Notebook mas eles não aparecem no Celular, 
              provavelmente você estava utilizando o modo <strong>Banco Local (Offline)</strong> do navegador no Notebook. 
              Use o botão ao lado para migrar os dados salvos localmente neste computador diretamente para a <strong>Nuvem Cloud Firestore</strong>.
            </p>
            {(() => {
              const localDb = typeof window !== 'undefined' ? getLocalDb() : { assets: [], locations: [], responsibles: [] };
              const hasLocalData = (localDb.assets && localDb.assets.length > 0) || 
                                   (localDb.locations && localDb.locations.length > 0) || 
                                   (localDb.responsibles && localDb.responsibles.length > 0);
              if (hasLocalData) {
                return (
                  <div className="inline-flex items-center gap-2 mt-2 bg-amber-50 border border-amber-250 text-amber-800 text-[11px] px-3 py-1 rounded-lg font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span>Encontramos dados locais salvos neste navegador: <strong>{localDb.assets?.length || 0} Ativos, {localDb.locations?.length || 0} Unidades, {localDb.responsibles?.length || 0} Responsáveis</strong>.</span>
                  </div>
                );
              } else {
                return (
                  <div className="inline-flex items-center gap-2 mt-2 bg-slate-100 border border-slate-255 text-slate-600 text-[11px] px-3 py-1 rounded-lg font-semibold">
                    <span>Nenhum dado local pendente detectado neste navegador. Todos os dados recém-cadastrados irão diretamente para a Nuvem.</span>
                  </div>
                );
              }
            })()}
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto">
            {(() => {
              const localDb = typeof window !== 'undefined' ? getLocalDb() : { assets: [], locations: [], responsibles: [] };
              const hasLocalData = (localDb.assets && localDb.assets.length > 0) || 
                                   (localDb.locations && localDb.locations.length > 0) || 
                                   (localDb.responsibles && localDb.responsibles.length > 0);
              if (onSyncLocalToCloud && hasLocalData) {
                return (
                  <button
                    onClick={onSyncLocalToCloud}
                    className="flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>Migrar para Nuvem</span>
                  </button>
                );
              }
              return null;
            })()}
            
            <div className="p-3 bg-white border border-slate-200 rounded-xl text-left">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Estado Conexão</span>
              <span className={`text-xs font-bold mt-0.5 block ${isLocalMode ? 'text-amber-600' : 'text-emerald-600'}`}>
                {isLocalMode ? 'Banco Local Offline' : 'Nuvem Sincronizada'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT LOCATION MODAL */}
      {isLocModalOpen && (
        <div id="loc-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingLocId ? 'Editar Localização / Unidade' : 'Cadastrar Nova Localização'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingLocId ? 'Altere as informações cadastrais do local selecionado.' : 'Defina salas, galpões ou escritórios para acomodar ativos.'}
                </p>
              </div>
              <button 
                onClick={handleCloseLocModal}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLocSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Area/Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nome / Identificação da Área *</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="Ex: Almoxarifado Central - Prateleira D"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Branch / Filial */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Filial / Unidade Corporativa *</label>
                <input
                  type="text"
                  required
                  value={locBranch}
                  onChange={(e) => setLocBranch(e.target.value)}
                  placeholder="Ex: Filial São Paulo, Filial Recife, Matriz"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Building */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Edifício / Unidade de Origem *</label>
                <input
                  type="text"
                  required
                  value={locBuilding}
                  onChange={(e) => setLocBuilding(e.target.value)}
                  placeholder="Ex: Galpão de Distribuição 02"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Floor */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Pavimento / Andar</label>
                <input
                  type="text"
                  value={locFloor}
                  onChange={(e) => setLocFloor(e.target.value)}
                  placeholder="Ex: 2º Andar, Térreo, Mezanino"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Observações de Descrição</label>
                <textarea
                  rows={2}
                  value={locDesc}
                  onChange={(e) => setLocDesc(e.target.value)}
                  placeholder="Detalhes de acesso físico, chaves ou finalidade da sala..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 resize-none"
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseLocModal}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  {editingLocId ? 'Salvar Alterações' : 'Cadastrar Unidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE RESPONSIBLE MODAL */}
      {isRespModalOpen && (
        <div id="resp-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Novo Colaborador Custodiante</h3>
                <p className="text-xs text-slate-400 mt-0.5">Registre o guardião formal que assume a responsabilidade civil do ativo.</p>
              </div>
              <button 
                onClick={() => setIsRespModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRespSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Custodian Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={respName}
                  onChange={(e) => setRespName(e.target.value)}
                  placeholder="Ex: Sergio MasterOp"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Custodian Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Email Corporativo *</label>
                <input
                  type="email"
                  required
                  value={respEmail}
                  onChange={(e) => setRespEmail(e.target.value)}
                  placeholder="EX: sergio@masterop.com.br"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              {/* Department */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Departamento / Setor *</label>
                <input
                  type="text"
                  required
                  value={respDept}
                  onChange={(e) => setRespDept(e.target.value)}
                  placeholder="Ex: Controladoria, Engenharia, Supply Chain"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRespModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  Registrar Responsável
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
