import React, { useState } from 'react';
import { 
  Wrench, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Hourglass,
  DollarSign, 
  Calendar,
  Building2,
  FileText,
  AlertCircle,
  X,
  Edit2
} from 'lucide-react';
import { Maintenance, Asset, User as UserType } from '../types';

interface MaintenanceViewProps {
  maintenances: Maintenance[];
  assets: Asset[];
  currentUser: UserType;
  onAddMaintenance: (data: any) => Promise<void>;
  onUpdateMaintenance: (id: string, data: { status: 'completed' | 'canceled'; endDate?: string; cost?: number }) => Promise<void>;
}

export function MaintenanceView({
  maintenances,
  assets,
  currentUser,
  onAddMaintenance,
  onUpdateMaintenance
}: MaintenanceViewProps) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMaint, setSelectedMaint] = useState<Maintenance | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorText, setErrorText] = useState('');

  // New Maintenance Form
  const [assetId, setAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [provider, setProvider] = useState('');
  const [cost, setCost] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Update Maintenance Form
  const [updateStatus, setUpdateStatus] = useState<'completed' | 'canceled'>('completed');
  const [updateEndDate, setUpdateEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [updateCost, setUpdateCost] = useState(0);

  const canModify = currentUser.role === 'admin' || currentUser.role === 'operator';

  const getAssetName = (id: string) => {
    const asset = assets.find(a => a.id === id);
    return asset ? `${asset.tag} - ${asset.name}` : 'Ativo Removido';
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!assetId) {
      setErrorText('Por favor, escolha o ativo patrimonial necessitando de reparo.');
      return;
    }
    if (!description.trim()) {
      setErrorText('Por favor, descreva o defeito verificado ou a revisão necessária.');
      return;
    }
    if (!provider.trim()) {
      setErrorText('Por favor, especifique o prestador de serviços ou assistência técnica autorizada.');
      return;
    }

    try {
      await onAddMaintenance({
        assetId,
        description,
        provider,
        cost: Number(cost),
        startDate,
        status: 'in_progress'
      });
      setIsNewModalOpen(false);
      
      // Cleanup
      setAssetId('');
      setDescription('');
      setProvider('');
      setCost(0);
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao criar ordens de manutenção.');
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!selectedMaint) return;

    try {
      await onUpdateMaintenance(selectedMaint.id, {
        status: updateStatus,
        endDate: updateEndDate,
        cost: Number(updateCost)
      });
      setIsUpdateModalOpen(false);
      setSelectedMaint(null);
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao atualizar ordem de manutenção.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Agendado', style: 'bg-indigo-50 border-indigo-100 text-indigo-700' };
      case 'in_progress':
        return { label: 'Em Conserto', style: 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse' };
      case 'completed':
        return { label: 'Concluído', style: 'bg-emerald-50 border-emerald-100 text-emerald-700' };
      case 'canceled':
        return { label: 'Cancelado', style: 'bg-rose-50 border-rose-100 text-rose-700' };
      default:
        return { label: status, style: 'bg-slate-50 border-slate-100 text-slate-500' };
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const filteredMaintenances = maintenances.filter(m => {
    const assetStr = getAssetName(m.assetId).toLowerCase();
    const descStr = m.description.toLowerCase();
    const providerStr = m.provider.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return assetStr.includes(searchLower) || descStr.includes(searchLower) || providerStr.includes(searchLower);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="maintenance-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manutenção & Reparos</h1>
          <p className="text-sm text-slate-500">Ordens de serviço de assistência técnica, calibração periódica e consertos gerais.</p>
        </div>
        {canModify && (
          <button
            id="register-maint-btn"
            onClick={() => {
              setErrorText('');
              setIsNewModalOpen(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Abrir Ordem de Serviço</span>
          </button>
        )}
      </div>

      {/* Filter and stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-xs">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="maint-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Procurar por ativo, prestador ou defeito..."
              className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
            />
          </div>
        </div>

        {/* Quick analytics card */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total de Custos</span>
            <p className="text-lg font-extrabold text-slate-900">
              {formatBRL(maintenances.reduce((acc, current) => acc + (current.cost || 0), 0))}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>

        {/* Total jobs count in progress */}
        <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Em andamento</span>
            <p className="text-lg font-extrabold text-amber-600">
              {maintenances.filter(m => m.status === 'in_progress').length} OS ativa(s)
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500 border border-amber-100">
            <Hourglass className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main List Grid */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden" id="maintenance-table-container">
        {filteredMaintenances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="maintenance-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4">Ativo Afetado</th>
                  <th className="p-4">Assistência / Prestador</th>
                  <th className="p-4">Problema / Descrição</th>
                  <th className="p-4 text-center">Datas</th>
                  <th className="p-4 text-right">Valor / Custo</th>
                  <th className="p-4 text-center">Status</th>
                  {canModify && <th className="p-4 text-center w-24">Ação</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredMaintenances.map((m) => {
                  const badge = getStatusBadge(m.status);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <span className="font-bold text-slate-900">{getAssetName(m.assetId)}</span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {m.provider}
                      </td>
                      <td className="p-4 max-w-xs">
                        <p className="text-xs text-slate-500 truncate" title={m.description}>{m.description}</p>
                      </td>
                      <td className="p-4 text-center text-xs text-slate-500">
                        <div className="flex flex-col items-center">
                          <span>Ínicio: {m.startDate}</span>
                          {m.endDate && <span className="font-bold text-emerald-600">Término: {m.endDate}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {formatBRL(m.cost)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badge.style}`}>
                          {badge.label}
                        </span>
                      </td>
                      {canModify && (
                        <td className="p-4 text-center">
                          {m.status === 'in_progress' ? (
                            <button
                              onClick={() => {
                                setErrorText('');
                                setSelectedMaint(m);
                                setUpdateEndDate(new Date().toISOString().split('T')[0]);
                                setUpdateCost(m.cost || 0);
                                setIsUpdateModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 hover:bg-amber-50 text-slate-600 hover:text-amber-700 text-xs font-bold border border-slate-200 hover:border-amber-200 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Encerrar OS</span>
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium italic">OS Baixada</span>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center" id="maintenance-empty">
            <Wrench className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhuma ordem de serviço cadastrada</p>
            <p className="text-slate-400 text-xs mt-1">Todos os reparos de bens patrimoniais são salvos e calculados aqui.</p>
          </div>
        )}
      </div>

      {/* New Maintenance Modal */}
      {isNewModalOpen && (
        <div id="new-maint-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-105 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Nova Ordem de Serviço</h3>
                <p className="text-xs text-slate-400 mt-0.5">Isso irá readequar o status do ativo para "Em Manutenção" de forma automática.</p>
              </div>
              <button 
                onClick={() => setIsNewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Asset choice */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Selecione o Ativo Danificado *</label>
                <select
                  required
                  value={assetId}
                  onChange={(e) => setAssetId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                >
                  <option value="">Escolha...</option>
                  {assets
                    .filter(a => a.status === 'active' || a.status === 'transferred')
                    .map((a) => (
                      <option key={a.id} value={a.id}>{a.tag} - {a.name}</option>
                    ))
                  }
                </select>
                <p className="text-[10px] text-slate-400">Ativos em conserto ou baixados não constam nesta lista para evitar duplicidade de chamados.</p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Motivo / Defeito Constatado *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Relatório minucioso dos danos físicos detectados ou tipo de revisão anual."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none"
                />
              </div>

              {/* Care center / provider */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Laboratório / Prestador Responsável *</label>
                <input
                  type="text"
                  required
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  placeholder="Ex: LG Assistência Autorizada, Técnico Mecânico Interno"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                />
              </div>

              {/* Estimated cost & Start Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Orçamento Previsto (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cost || ''}
                      onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
                      placeholder="0,00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Data de Entrada *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  Iniciar Manutenção
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completion/Update Maintenance Modal */}
      {isUpdateModalOpen && selectedMaint && (
        <div id="update-maint-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Encerramento de Ordem de Serviço</h3>
                <p className="text-xs text-slate-400 mt-0.5">Altere o estado final da manutenção realizada.</p>
              </div>
              <button 
                onClick={() => {
                  setIsUpdateModalOpen(false);
                  setSelectedMaint(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              {/* Informative text */}
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[10px] uppercase font-bold text-slate-400">Ativo Comercial</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{getAssetName(selectedMaint.assetId)}</p>
                <p className="text-xs mt-1.5 text-slate-500"><strong>Prestador contratado:</strong> {selectedMaint.provider}</p>
              </div>

              {/* Choose Status resolution */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 font-medium font-bold">Estado de Resolução *</label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as 'completed' | 'canceled')}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer animate-in fade-in"
                >
                  <option value="completed">Concluída (Ativo restaurado ao estoque operacional)</option>
                  <option value="canceled">Sem sucesso / Cancelada (Ativo mantido no estado crítico)</option>
                </select>
              </div>

              {/* Cost of repair */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Valor Efetivo Cobrado (R$) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={updateCost || ''}
                    onChange={(e) => setUpdateCost(parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Data de Encerramento *</label>
                <input
                  type="date"
                  required
                  value={updateEndDate}
                  onChange={(e) => setUpdateEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                />
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedMaint(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  Confirmar Encerramento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
