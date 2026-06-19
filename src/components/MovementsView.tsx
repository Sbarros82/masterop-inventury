import React, { useState } from 'react';
import { 
  ArrowRightLeft, 
  Plus, 
  Search, 
  Calendar, 
  Building2, 
  User, 
  FileText, 
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react';
import { Asset, Location, Responsible, AssetMovement, User as UserType } from '../types';

interface MovementsViewProps {
  movements: AssetMovement[];
  assets: Asset[];
  locations: Location[];
  responsibles: Responsible[];
  currentUser: UserType;
  onRegisterMovement: (data: { assetId: string, toLocationId: string, toResponsibleId: string, reason: string }) => Promise<void>;
}

export function MovementsView({ 
  movements, 
  assets, 
  locations, 
  responsibles, 
  currentUser,
  onRegisterMovement 
}: MovementsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorText, setErrorText] = useState('');

  // Form states
  const [assetId, setAssetId] = useState('');
  const [toLocationId, setToLocationId] = useState('');
  const [toResponsibleId, setToResponsibleId] = useState('');
  const [reason, setReason] = useState('');

  const canModify = currentUser.role === 'admin' || currentUser.role === 'operator';

  const getAssetName = (id: string) => {
    const asset = assets.find(a => a.id === id);
    return asset ? `${asset.tag} - ${asset.name}` : 'Ativo Removido';
  };

  const getLocationName = (id: string) => {
    const loc = locations.find(l => l.id === id);
    return loc ? loc.name : 'N/A';
  };

  const getResponsibleName = (id: string) => {
    const resp = responsibles.find(r => r.id === id);
    return resp ? resp.name : 'N/A';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!assetId) {
      setErrorText('Por favor, selecione o ativo a ser transferido.');
      return;
    }
    if (!toLocationId) {
      setErrorText('Por favor, defina a localização de destino.');
      return;
    }
    if (!toResponsibleId) {
      setErrorText('Por favor, defina o novo responsável pelo ativo.');
      return;
    }
    if (!reason.trim()) {
      setErrorText('Por favor, descreva o motivo oficial do deslocamento.');
      return;
    }

    // Verify if trying to move to the exact same spot
    const activeAsset = assets.find(a => a.id === assetId);
    if (activeAsset) {
      if (activeAsset.locationId === toLocationId && activeAsset.responsibleId === toResponsibleId) {
        setErrorText('Este ativo já se encontra nesta exata localização e sob guarda desse responsável.');
        return;
      }
    }

    try {
      await onRegisterMovement({ assetId, toLocationId, toResponsibleId, reason });
      setIsModalOpen(false);
      setAssetId('');
      setToLocationId('');
      setToResponsibleId('');
      setReason('');
    } catch (err: any) {
      setErrorText(err.message || 'Falha ao registrar transferência de patrimônio.');
    }
  };

  const filteredMovements = movements.filter(mov => {
    const assetName = getAssetName(mov.assetId).toLowerCase();
    const reasonLower = (mov.reason || '').toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    return assetName.includes(searchLower) || reasonLower.includes(searchLower);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="movements-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Movimentações de Ativos</h1>
          <p className="text-sm text-slate-500">Histórico de transferências físicas e alteração de custodiantes responsáveis.</p>
        </div>
        {canModify && (
          <button
            id="new-transfer-btn"
            onClick={() => {
              setErrorText('');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transferir Ativo</span>
          </button>
        )}
      </div>

      {/* Tooling filter bar */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="movements-search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar histórico de transferência..."
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
          />
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Registros consolidados: {filteredMovements.length}
        </div>
      </div>

      {/* Timeline view or list */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        {filteredMovements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredMovements.map((mov) => {
              const activeAssetObj = assets.find(a => a.id === mov.assetId);

              return (
                <div key={mov.id} className="p-5 hover:bg-slate-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2.5">
                    {/* Upper Tag */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100/30">
                        {activeAssetObj?.tag || 'PAT-XXXX'}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {activeAssetObj?.name || 'Ativo Patrimonial'}
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1 ml-auto md:ml-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {mov.date}
                      </span>
                    </div>

                    {/* Flow details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      {/* Origin */}
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Origem Anterior</p>
                        <p className="font-semibold text-slate-700 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {getLocationName(mov.fromLocationId)}
                        </p>
                        <p className="font-medium text-slate-500 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {getResponsibleName(mov.fromResponsibleId)}
                        </p>
                      </div>

                      {/* Destination */}
                      <div className="p-3 bg-indigo-50/20 border border-indigo-100/30 rounded-xl space-y-1">
                        <p className="text-[10px] uppercase font-bold text-indigo-500">Destino Recebedor</p>
                        <p className="font-bold text-indigo-900 flex items-center gap-1.5 mt-1">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                          {getLocationName(mov.toLocationId)}
                        </p>
                        <p className="font-semibold text-indigo-700 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-400" />
                          {getResponsibleName(mov.toResponsibleId)}
                        </p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="flex items-start gap-2 text-xs text-slate-500 leading-normal bg-slate-50/50 p-2.5 rounded-lg border border-slate-100/50">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span><strong>Justificativa da Transferência:</strong> {mov.reason}</span>
                    </div>
                  </div>

                  {/* Flow status decorator link */}
                  <div className="hidden lg:flex flex-col items-center justify-center shrink-0 w-24">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 border border-slate-200">
                      <ArrowRight className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="text-[10px] text-indigo-500 font-bold mt-1.5 uppercase tracking-wide">Efetuada</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <ArrowRightLeft className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhuma movimentação registrada</p>
            <p className="text-slate-400 text-xs mt-1">Os deslocamentos aparecem aqui conforme novos Ativos forem realocados de setor.</p>
          </div>
        )}
      </div>

      {/* Realocate Asset Modal pop-up */}
      {isModalOpen && (
        <div id="transfer-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nova Transferência Patrimonial</h3>
                <p className="text-xs text-slate-400 mt-0.5">Mova um ativo para outra sub-sede ou designe novo tutor.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Choose Asset */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Selecione o Ativo Patrimonial *</label>
                <select
                  value={assetId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setAssetId(id);
                    // Autofill current details as defaults for easy editing
                    const selected = assets.find(a => a.id === id);
                    if (selected) {
                      setToLocationId(selected.locationId);
                      setToResponsibleId(selected.responsibleId);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                >
                  <option value="">Escolha um Ativo do Estoque...</option>
                  {assets
                    .filter(a => a.status === 'active' || a.status === 'transferred')
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.tag} - {a.name} ({a.brand || 'Sem marca'})</option>
                    ))
                  }
                </select>
                <p className="text-[10px] text-slate-400">Somente ativos com status "Ativo" ou "Transferido" estão liberados para movimentação.</p>
              </div>

              {/* Destination Area */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Localização Destinatária *</label>
                <select
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                >
                  <option value="">Escolha a nova unidade / departamento...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Destination custodian */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Novo Colaborador Responsável (Guarda do Bem) *</label>
                <select
                  value={toResponsibleId}
                  onChange={(e) => setToResponsibleId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                >
                  <option value="">Selecione o novo tutor legal...</option>
                  {responsibles.map((resp) => (
                    <option key={resp.id} value={resp.id}>{resp.name} - {resp.department}</option>
                  ))}
                </select>
              </div>

              {/* Official description/reason */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-medium">Motivo Formal do Deslocamento *</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Realocação de posto de trabalho devido a reestruturação da gerência financeira."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none"
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  Confirmar Transferência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
