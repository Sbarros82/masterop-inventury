import React from 'react';
import { 
  Building2, 
  DollarSign, 
  Wrench, 
  RotateCw, 
  Layers, 
  CheckCircle, 
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  PackageCheck
} from 'lucide-react';
import { DashboardStats, AssetCategory, AssetStatus } from '../types';

interface DashboardProps {
  stats: DashboardStats;
  onNavigateToTab: (tab: string) => void;
}

export function Dashboard({ stats, onNavigateToTab }: DashboardProps) {
  const getCategoryLabel = (cat: AssetCategory) => {
    switch (cat) {
      case 'furniture': return 'Móveis e Utensílios';
      case 'it': return 'Equipamentos de TI';
      case 'machinery': return 'Máquinas e Ferramentas';
      case 'vehicles': return 'Veículos';
      case 'other': return 'Outros Ativos';
    }
  };

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case 'active': return 'Ativo e Operando';
      case 'maintenance': return 'Em Manutenção';
      case 'transferred': return 'Transferido';
      case 'retired': return 'Baixado / Obsoleto';
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const categoryMax = Math.max(...Object.values(stats.categoryDistribution), 1);
  const statusMax = Math.max(...Object.values(stats.statusDistribution), 1);

  return (
    <div className="space-y-6" id="dashboard-view">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-905">Masterop Dashboard</h1>
          <p className="text-sm text-slate-500">Indicadores gerais, valor patrimonial e integridade da infraestrutura corporativa.</p>
        </div>
        <div className="text-xs font-mono text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 self-start md:self-auto">
          Atualizado em tempo real (UTC)
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="metrics-grid">
        <div className="p-5 bg-white border border-slate-100 hover:border-indigo-100 rounded-2xl shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ativos Cadastrados</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.totalAssets}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold cursor-pointer" onClick={() => onNavigateToTab('assets')}>
            <span>Gerenciar Ativos</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 hover:border-emerald-100 rounded-2xl shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Valor do Patrimônio</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{formatBRL(stats.totalValue)}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="mt-4 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Valor de Aquisição Consolidado</span>
          </p>
        </div>

        <div className="p-5 bg-white border border-slate-100 hover:border-amber-100 rounded-2xl shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Em Manutenção</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.maintenanceCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-semibold cursor-pointer" onClick={() => onNavigateToTab('maintenance')}>
            <span>Ir para Manutenções</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Movimentações</span>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.pendingMovementsCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100 group-hover:scale-110 transition-transform">
              <RotateCw className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-600 font-semibold cursor-pointer" onClick={() => onNavigateToTab('movements')}>
            <span>Histórico de Transferências</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Visualizers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="dashboard-charts">
        {/* Category Breakdown (Crafted Bars) */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">Distribuição por Categoria</h4>
              <p className="text-xs text-slate-400">Classificação dos ativos por tipo e volume de estoque.</p>
            </div>
            <Layers className="w-5 h-5 text-slate-300" />
          </div>
          <div className="space-y-4">
            {Object.entries(stats.categoryDistribution).map(([category, count]) => {
              const perc = (count / categoryMax) * 100;
              const catTyped = category as AssetCategory;
              return (
                <div key={category} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{getCategoryLabel(catTyped)}</span>
                    <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{count} {count === 1 ? 'item' : 'itens'}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        catTyped === 'it' ? 'bg-indigo-500' :
                        catTyped === 'furniture' ? 'bg-blue-400' :
                        catTyped === 'machinery' ? 'bg-amber-500' :
                        catTyped === 'vehicles' ? 'bg-teal-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${Math.max(perc, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown & System Health */}
        <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">Estado de Conservação</h4>
                <p className="text-xs text-slate-400">Operabilidade e ciclos de vida dos ativos atuais.</p>
              </div>
              <CheckCircle className="w-5 h-5 text-slate-300" />
            </div>
            <div className="space-y-4">
              {Object.entries(stats.statusDistribution).map(([status, count]) => {
                const perc = (count / statusMax) * 100;
                const statusTyped = status as AssetStatus;
                return (
                  <div key={status} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">{getStatusLabel(statusTyped)}</span>
                      <span className="font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{count} {count === 1 ? 'item' : 'itens'}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${
                          statusTyped === 'active' ? 'bg-emerald-500' :
                          statusTyped === 'maintenance' ? 'bg-amber-500' :
                          statusTyped === 'transferred' ? 'bg-indigo-400' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.max(perc, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3.5 bg-indigo-50/50 border border-indigo-100/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                {Math.round(((stats.statusDistribution.active || 0) / (stats.totalAssets || 1)) * 100)}%
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Taxa de Operabilidade</p>
                <p className="text-[10px] text-slate-400">Porcentagem de ativos livres e ativos em operação normal.</p>
              </div>
            </div>
            <PackageCheck className="w-5 h-5 text-indigo-400 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Monthly Acquisition Value / Graphic List */}
      <div className="p-6 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-900">Investimento Recente / Aquisições Mensais</h4>
            <p className="text-xs text-slate-400">Fluxo financeiro de novos ativos incorporados ao patrimônio.</p>
          </div>
          <TrendingUp className="w-5 h-5 text-slate-300" />
        </div>

        {stats.monthlyAcquisitions && stats.monthlyAcquisitions.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
            {stats.monthlyAcquisitions.map((acq) => (
              <div key={acq.month} className="p-3.5 bg-slate-50/60 hover:bg-slate-50 border border-slate-100 rounded-xl text-center space-y-1 transition-all">
                <span className="text-[10px] font-mono text-slate-400 uppercase">{acq.month}</span>
                <p className="text-xs font-bold text-slate-800 truncate">{formatBRL(acq.value)}</p>
                <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden mt-1 mx-auto max-w-[40px]">
                  <div className="h-full bg-indigo-500" style={{ width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50/50 rounded-xl">Sem histórico de aquisições recentes.</p>
        )}
      </div>

      {/* Asset Audit Notification box */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
          <div>
            <h5 className="text-xs font-bold text-slate-805">Regulamento de Auditoria Geral (SOX / Comitê Fiscal)</h5>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
              Todos os equipamentos de informática e mobiliários corporativos devem conter plaquetas físicas com o código correspondente.
              Caso detecte alguma inconsistência física, utilize o módulo **Inventário** para escanear e alertar a gerência.
            </p>
          </div>
        </div>
        <button 
          onClick={() => onNavigateToTab('inventory')}
          className="text-xs font-semibold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors cursor-pointer shrink-0"
        >
          Iniciar Verificação
        </button>
      </div>
    </div>
  );
}
