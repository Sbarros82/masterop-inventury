import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  ListTodo, 
  CheckCircle2, 
  Clock, 
  X,
  AlertTriangle,
  Play,
  Barcode,
  Sparkles,
  Award,
  HelpCircle,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { Inventory, InventoryItem, User as UserType } from '../types';

interface InventoryViewProps {
  inventories: Inventory[];
  currentUser: UserType;
  onStartInventory: (title: string) => Promise<void>;
  onScanAsset: (tag: string, observations?: string) => Promise<void>;
  onFinishInventory: (id: string) => Promise<void>;
}

export function InventoryView({
  inventories,
  currentUser,
  onStartInventory,
  onScanAsset,
  onFinishInventory
}: InventoryViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [scanTag, setScanTag] = useState('');
  const [observations, setObservations] = useState('');
  const [errorText, setErrorText] = useState('');
  const [successText, setSuccessText] = useState('');
  const [showStartForm, setShowStartForm] = useState(false);

  const canModify = currentUser.role === 'admin' || currentUser.role === 'operator' || currentUser.role === 'auditor';

  const activeInventory = inventories.find(i => i.status === 'active');
  const pastInventories = inventories.filter(i => i.status === 'finished');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!newTitle.trim()) {
      setErrorText('Por favor, informe uma descrição título para este inventário.');
      return;
    }

    try {
      await onStartInventory(newTitle);
      setNewTitle('');
      setShowStartForm(false);
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao iniciar inventário.');
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    setSuccessText('');

    if (!scanTag.trim()) {
      setErrorText('Por favor, insira o código da etiqueta patrimonial.');
      return;
    }

    try {
      await onScanAsset(scanTag, observations);
      setSuccessText(`Etiqueta ${scanTag.toUpperCase()} escaneada e validada com sucesso!`);
      setScanTag('');
      setObservations('');
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao escanear etiqueta de patrimônio.');
    }
  };

  const handleFinish = async (id: string, title: string) => {
    const unverified = activeInventory?.items.filter(item => !item.scanned).length || 0;
    
    let confirmMsg = `Tem certeza de que deseja finalizar o "${title}"?`;
    if (unverified > 0) {
      confirmMsg += ` Restam ${unverified} ativos ainda PENDENTES de validação física.`;
    }

    if (window.confirm(confirmMsg)) {
      try {
        await onFinishInventory(id);
        setSuccessText('Inventário patrimonial finalizado e arquivado para auditorias fiscais!');
      } catch (err: any) {
        setErrorText(err.message || 'Erro ao finalizar o inventário.');
      }
    }
  };

  const calculateProgress = (items: InventoryItem[]) => {
    if (!items || items.length === 0) return 0;
    const scanned = items.filter(i => i.scanned).length;
    return Math.round((scanned / items.length) * 100);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" id="inventory-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leitor e Auditoria de Inventários</h1>
          <p className="text-sm text-slate-500 font-medium">Controle físico analítico de conformidades, plaquetas e localização de bens materiais.</p>
        </div>
        {!activeInventory && canModify && (
          <button
            id="start-inventory-btn"
            onClick={() => {
              setErrorText('');
              setSuccessText('');
              setShowStartForm(!showStartForm);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Novo Inventário Geral</span>
          </button>
        )}
      </div>

      {/* Start Checklist Creation box */}
      {showStartForm && !activeInventory && (
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4 animate-in slide-in-from-top-1">
          <div className="flex items-center justify-between border-b border-slate-1 py-1">
            <h3 className="text-sm font-bold text-slate-800">Definir Escopo de Novo Inventário</h3>
            <button onClick={() => setShowStartForm(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
          </div>
          <form onSubmit={handleStart} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-xs font-semibold text-slate-500">Nome Oficial do Ciclo de Auditoria</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Auditoria Rotativa - Junho de 2026"
                className="w-full px-3,5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm cursor-pointer whitespace-nowrap self-stretch sm:self-auto flex items-center justify-center"
            >
              Iniciar Trabalho de Campo
            </button>
          </form>
          {errorText && <span className="text-xs text-rose-500 block">{errorText}</span>}
        </div>
      )}

      {/* Messages */}
      {errorText && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorText}</span>
        </div>
      )}

      {successText && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2.5 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 animate-bounce" />
          <span>{successText}</span>
        </div>
      )}

      {/* ACTIVE INVENTORY SECTION */}
      {activeInventory ? (
        <div className="space-y-6" id="active-inventory-container">
          <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                  <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider">Inventário de Campo Ativo</span>
                </div>
                <h2 className="text-lg font-extrabold text-slate-900">{activeInventory.title}</h2>
                <p className="text-xs text-slate-400">Iniciado em {activeInventory.startDate} por auditores certificados.</p>
              </div>

              {/* Progress visualizer */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className="text-xs text-slate-500 font-medium">Progresso de Campo</p>
                  <p className="text-sm font-black text-slate-900">
                    {activeInventory.items.filter(i => i.scanned).length} de {activeInventory.items.length} verificados ({calculateProgress(activeInventory.items)}%)
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 flex items-center justify-center font-bold text-xs text-indigo-700">
                  {calculateProgress(activeInventory.items)}%
                </div>
              </div>
            </div>

            {/* Simulative Optical Barcode scan panel */}
            <div className="p-5 bg-indigo-50/20 border border-indigo-100/30 rounded-2xl space-y-4">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-500" />
                <h4 className="text-sm font-bold text-slate-900">Simulador de Coletor / Leitor Óptico (Plaqueta de Alumínio)</h4>
              </div>
              <p className="text-xs text-slate-500">
                Aponte o coletor digitando o número gravado no ativo (Ex: <strong>PAT-0001</strong> até <strong>PAT-0007</strong>).
              </p>

              <form onSubmit={handleScan} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Código de Origem Patrimonial (Etiqueta)</label>
                  <input
                    type="text"
                    required
                    value={scanTag}
                    onChange={(e) => setScanTag(e.target.value)}
                    placeholder="PAT-XXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden text-slate-800 placeholder-slate-300"
                  />
                </div>

                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Anotações da Auditória (Opcional)</label>
                  <input
                    type="text"
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    placeholder="Ex: Em perfeito estado, com leves ricos..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl h-[38px] cursor-pointer"
                >
                  Confirmar e Registrar Leitura
                </button>
              </form>
            </div>

            {/* Action panel to Archive current verify */}
            {canModify && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Finalizar Conciliação Física</h5>
                  <p className="text-[10px] text-slate-400">Isso fechará o inventário, calculando taxas de perda e ativos extraviados permanentes.</p>
                </div>
                <button
                  onClick={() => handleFinish(activeInventory.id, activeInventory.title)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Concluir e Autenticar Auditoria
                </button>
              </div>
            )}
          </div>

          {/* Table list to confirm items state */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/20">
              <h3 className="text-sm font-bold text-slate-800">Checklist Analítico do Lote de Ativos</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visão unificada das unidades para a auditoria contábil.</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4">Etiqueta</th>
                    <th className="p-4">Descrição do Ativo</th>
                    <th className="p-4">Sede / Local Esperado</th>
                    <th className="p-4 text-center">Estado Físico</th>
                    <th className="p-4">Data Leitura</th>
                    <th className="p-4">Observações Auditadas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {activeInventory.items.map((item) => (
                    <tr key={item.assetId} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs">{item.assetTag}</td>
                      <td className="p-4 font-bold text-slate-900">{item.assetName}</td>
                      <td className="p-4 text-slate-500 font-semibold">{item.locationName}</td>
                      <td className="p-4 text-center">
                        {item.scanned ? (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wider">
                            Escaneado
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-wider">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {item.scanDate ? new Date(item.scanDate).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="p-4 text-xs text-slate-500 italic max-w-xs truncate">
                        {item.observations || <span className="text-slate-300">-</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-slate-100 rounded-2xl shadow-xs" id="no-active-inventory">
          <ClipboardCheck className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">Nenhum inventário rotativo ou fiscal ativo no momento</p>
          <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
            Abra um novo ciclo de inventário para rodar o leitor de campo e aferir a integridade dos itens nas prateleiras físicas.
          </p>
          {canModify && (
            <button
              onClick={() => setShowStartForm(true)}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer"
            >
              Iniciar Ciclo Agora
            </button>
          )}
        </div>
      )}

      {/* PAST ARCHIVES SECTION */}
      {pastInventories.length > 0 && (
        <div className="space-y-4" id="past-inventories-history">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Histórico de Arquivos e Laudos de Inventário</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pastInventories.map((past) => (
              <div key={past.id} className="p-5 bg-white border border-slate-150 rounded-2xl shadow-xs flex justify-between items-start gap-4">
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-800 text-sm truncate">{past.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
                    <span>Sessão: {past.startDate}</span>
                    <span>•</span>
                    <span>Encerramento: {past.endDate}</span>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs bg-emerald-500/10 text-emerald-600 border border-emerald-500/10 px-2 py-0.5 rounded-sm font-bold uppercase">
                      100% Homologado
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {past.items.filter(i => i.scanned).length} / {past.items.length} Conferidos
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500">
                  <FileCheck2 className="w-5 h-5 text-indigo-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
