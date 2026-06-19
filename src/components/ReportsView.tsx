import React, { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Building2, 
  DollarSign, 
  Tag, 
  Printer, 
  BarChart4, 
  ChevronRight, 
  Eye, 
  ArrowDownWideNarrow, 
  Info,
  SlidersHorizontal,
  FolderTree
} from 'lucide-react';
import { Asset, Location, Responsible, AssetCategory, AssetStatus } from '../types';

interface ReportsViewProps {
  assets: Asset[];
  locations: Location[];
  responsibles: Responsible[];
}

export function ReportsView({ assets, locations, responsibles }: ReportsViewProps) {
  // Config state
  const [reportType, setReportType] = useState<'analytical' | 'synthetic'>('analytical');
  const [groupBy, setGroupBy] = useState<'category' | 'location'>('category');
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Apply filters to assets
  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || asset.locationId === selectedLocation;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    return matchesCategory && matchesLocation && matchesStatus;
  });

  const totalFilteredCount = filteredAssets.length;
  const totalFilteredValue = filteredAssets.reduce((sum, asset) => sum + asset.value, 0);
  const averageFilteredValue = totalFilteredCount > 0 ? totalFilteredValue / totalFilteredCount : 0;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const getCategoryLabel = (cat: AssetCategory) => {
    switch (cat) {
      case 'furniture': return 'Móveis e Utensílios';
      case 'it': return 'Equipamentos TI';
      case 'machinery': return 'Máquinas e Ferramentas';
      case 'vehicles': return 'Veículos';
      default: return 'Outros';
    }
  };

  const getStatusLabel = (status: AssetStatus) => {
    switch (status) {
      case 'active': return 'Ativo e Operando';
      case 'maintenance': return 'Em Manutenção';
      case 'transferred': return 'Transferido';
      case 'retired': return 'Baixado';
    }
  };

  // Printable screen trigger
  const handlePrint = () => {
    window.print();
  };

  // Grouped computation for state elements
  const getSyntheticGroups = () => {
    if (groupBy === 'category') {
      const categories: AssetCategory[] = ['furniture', 'it', 'machinery', 'vehicles', 'other'];
      return categories.map(cat => {
        const items = filteredAssets.filter(a => a.category === cat);
        const count = items.length;
        const totalVal = items.reduce((sum, i) => sum + i.value, 0);
        return {
          id: cat,
          title: getCategoryLabel(cat),
          count,
          value: totalVal,
          percentage: totalFilteredValue > 0 ? (totalVal / totalFilteredValue) * 100 : 0,
          items: items
        };
      }).filter(group => group.count > 0);
    } else {
      return locations.map(loc => {
        const items = filteredAssets.filter(a => a.locationId === loc.id);
        const count = items.length;
        const totalVal = items.reduce((sum, i) => sum + i.value, 0);
        return {
          id: loc.id,
          title: `${loc.name} - ${loc.building} (${loc.floor}º andar)`,
          count,
          value: totalVal,
          percentage: totalFilteredValue > 0 ? (totalVal / totalFilteredValue) * 100 : 0,
          items: items
        };
      }).filter(group => group.count > 0);
    }
  };

  const syntheticGroups = getSyntheticGroups();

  return (
    <div className="space-y-6" id="reports-view-module">
      
      {/* Printable CSS Hook Injection */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            font-size: 10px !important;
          }
          #sidebar-navigation, 
          header, 
          #reports-controller-card, 
          #wipe-all-btn, 
          button, 
          hr {
            display: none !important;
          }
          #main-frame {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-header {
            display: block !important;
            margin-bottom: 2rem;
            border-bottom: 2px solid #1e293b;
            padding-bottom: 1rem;
          }
          .print-avoid-break {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Header section (Non-printable outside print preview) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 block print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            <span>Relatórios Consolidados</span>
          </h1>
          <p className="text-sm text-slate-500">Gere demonstrativos detalhados ou estruturados da sua base de ativos patrimoniais.</p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-indigo-700 bg-indigo-50 border border-indigo-200 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-xs cursor-pointer select-none shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Salvar em PDF</span>
        </button>
      </div>

      {/* System Brand Header Visible Only On Printouts */}
      <div className="hidden print-header print:flex items-center justify-between w-full">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">PATRIMONIUM ERP</h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Relatório Oficial de Bens de Ativo Fixo</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold text-slate-700">Data de Emissão: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
          <p className="text-[10px] text-slate-400">Responsável Tributário: Auditoria Geral SOX</p>
        </div>
      </div>

      {/* Control panel for filters and configuration (Non-printable) */}
      <div className="bg-white border border-slate-150/80 rounded-2xl p-5 shadow-xs space-y-4 print:hidden" id="reports-controller-card">
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          
          {/* Toggle Type */}
          <div className="space-y-1.5 shrink-0">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Formato do Relatório</label>
            <div className="flex bg-slate-100 rounded-xl p-1 max-w-fit border border-slate-205">
              <button
                onClick={() => setReportType('analytical')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportType === 'analytical' 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Analítico (Completo)
              </button>
              <button
                onClick={() => setReportType('synthetic')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  reportType === 'synthetic' 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sintético (Resumido)
              </button>
            </div>
          </div>

          {/* Groupings Choice for Synthetic Layout only */}
          {reportType === 'synthetic' && (
            <div className="space-y-1.5 shrink-0">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agrupamento Principal</label>
              <div className="flex bg-slate-100 rounded-xl p-1 max-w-fit border border-slate-205">
                <button
                  onClick={() => setGroupBy('category')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groupBy === 'category' 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Categoria</span>
                </button>
                <button
                  onClick={() => setGroupBy('location')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    groupBy === 'location' 
                      ? 'bg-white text-indigo-600 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Localização</span>
                </button>
              </div>
            </div>
          )}

          {/* Detailed filters */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Filtrar Categoria</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
                >
                  <option value="all">Todas as Categorias</option>
                  <option value="furniture">Móveis e Utensílios</option>
                  <option value="it">Equipamentos TI</option>
                  <option value="machinery">Máquinas e Ferramentas</option>
                  <option value="vehicles">Veículos</option>
                  <option value="other">Outros</option>
                </select>
              </div>
            </div>

            {/* Location Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Filtrar Unidades</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Building2 className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
                >
                  <option value="all">Todas as Localizações</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name} - {loc.building}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Filtrar Estado</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Ativo e Operando</option>
                  <option value="maintenance">Em Manutenção</option>
                  <option value="transferred">Transferido</option>
                  <option value="retired">Baixado</option>
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Aggregate Overview Metrics (Printable & Viewable) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="reports-metrics-dashboard">
        {/* Count of items */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-xs print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Itens Sindicados</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{totalFilteredCount}</span>
            <span className="text-[10px] text-slate-400 block print:hidden">Bens na amostragem filtrada</span>
          </div>
          <div className="w-11 h-11 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-center text-indigo-500 print:hidden shrink-0">
            <Tag className="w-5 h-5" />
          </div>
        </div>

        {/* Total equity valuation */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-xs print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Avaliação Patrimonial</span>
            <span className="text-2xl font-extrabold text-indigo-650 text-slate-900 block">{formatBRL(totalFilteredValue)}</span>
            <span className="text-[10px] text-slate-400 block print:hidden">Soma total dos valores líquidos</span>
          </div>
          <div className="w-11 h-11 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 print:hidden shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Average unit cost */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-xs print:border-slate-300">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Custo Médio do Ativo</span>
            <span className="text-2xl font-extrabold text-slate-900 block">{formatBRL(averageFilteredValue)}</span>
            <span className="text-[10px] text-slate-400 block print:hidden">Valor médio por peça de patrimônio</span>
          </div>
          <div className="w-11 h-11 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-500 print:hidden shrink-0">
            <BarChart4 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* RENDER REPORT SHEETS */}
      {reportType === 'analytical' ? (
        
        /* ------------------ SHEET A: ANALYTICAL REPORT ------------------ */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs print:border-none print:shadow-none print-full-width">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:bg-white print:border-b-2 print:border-slate-800 print:px-0">
            <div>
              <h3 className="text-sm font-bold text-slate-850">Lote Analítico de Bens Cadastrados</h3>
              <p className="text-[11px] text-slate-400">Exibição exaustiva detalhada registro a registro dos bens do inventário.</p>
            </div>
            <span className="text-xs font-bold text-slate-500 print:text-black">
              Mostrando {totalFilteredCount} Ativos Filtrados
            </span>
          </div>

          {filteredAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse divide-y divide-slate-100 print:divide-slate-300">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-bold text-slate-400 uppercase tracking-wider print:bg-white print:text-black print:border-b-2 print:border-slate-800">
                    <th className="p-4 w-24">Etiqueta</th>
                    <th className="p-4">Foto / Nome do Ativo</th>
                    <th className="p-4">Especificação</th>
                    <th className="p-4">Alocação</th>
                    <th className="p-4">Custodiante</th>
                    <th className="p-4 text-right">Valor Líquido</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700 print:divide-slate-200">
                  {filteredAssets.map((asset) => {
                    const loc = locations.find((l) => l.id === asset.locationId);
                    const resp = responsibles.find((r) => r.id === asset.responsibleId);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                        
                        {/* Heritage Tag */}
                        <td className="p-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          {asset.tag}
                        </td>

                        {/* Name and Image Thumbnail */}
                        <td className="p-4 max-w-xs">
                          <div className="flex items-center gap-2.5">
                            {asset.photo ? (
                              <img 
                                src={asset.photo} 
                                alt="" 
                                className="w-8 h-8 object-cover rounded-md border border-slate-250 shrink-0 select-none print:w-10 print:h-10"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-slate-50 border border-slate-150 text-slate-300 rounded-md flex items-center justify-center shrink-0 text-[9px] print:hidden">
                                N/D
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="font-extrabold text-slate-900 truncate" title={asset.name}>{asset.name}</h5>
                              <p className="text-[10px] text-slate-400 truncate" title={asset.description}>{asset.description || 'Sem descrição'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Custom Spec (Brand, Model, Serial Number) */}
                        <td className="p-4">
                          <div className="space-y-0.5">
                            {(asset.brand || asset.model) && (
                              <p className="text-slate-800 font-medium">
                                {asset.brand || '-'} {asset.model && `(${asset.model})`}
                              </p>
                            )}
                            {asset.serialNumber ? (
                              <p className="text-[10px] text-slate-400 font-mono">S/N: {asset.serialNumber}</p>
                            ) : (
                              <p className="text-[10px] text-slate-400">S/N: Não informado</p>
                            )}
                          </div>
                        </td>

                        {/* Unit / Location */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{loc?.name || 'Não alocado'}</span>
                            <span className="text-[10px] text-slate-400">{loc?.building} - Fl. {loc?.floor}º</span>
                          </div>
                        </td>

                        {/* Responsible guardian */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{resp?.name || 'Sem titular'}</span>
                            <span className="text-[10px] text-slate-450">{resp?.department || 'N/D'}</span>
                          </div>
                        </td>

                        {/* Value */}
                        <td className="p-4 text-right font-mono font-bold text-slate-900">
                          {formatBRL(asset.value)}
                        </td>

                        {/* Status */}
                        <td className="p-4 text-center">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border 
                            ${asset.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' : ''}
                            ${asset.status === 'maintenance' ? 'bg-amber-50 text-amber-700 border-amber-150' : ''}
                            ${asset.status === 'transferred' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' : ''}
                            ${asset.status === 'retired' ? 'bg-rose-50 text-rose-700 border-rose-150' : ''}
                          `}>
                            {getStatusLabel(asset.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Eye className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Nenhum ativo corresponde aos filtros informados.</p>
              <p className="text-xs mt-1">Modifique as opções de categoria ou unidade para recarregar o demonstrativo.</p>
            </div>
          )}
        </div>

      ) : (

        /* ------------------ SHEET B: SYNTHETIC REPORT ------------------ */
        <div className="space-y-6 print-full-width">
          {syntheticGroups.length > 0 ? (
            syntheticGroups.map(group => (
              <div 
                key={group.id} 
                className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs print-avoid-break print:border-slate-300 print:shadow-none"
              >
                {/* Accordion header panel */}
                <div className="p-5 bg-slate-50 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-white print:border-b-2 print:border-slate-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-indigo-50 text-indigo-650 hover:bg-indigo-100 rounded-xl flex items-center justify-center shrink-0 print:hidden">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{group.title}</h4>
                      <p className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                        Grupo • {groupBy === 'category' ? 'Categoria Fiscal' : 'Endereço Operativo'}
                      </p>
                    </div>
                  </div>

                  {/* Group aggregates summaries */}
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div className="text-right border-r border-slate-200 pr-4 print:border-slate-300">
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">Volume</span>
                      <span className="font-bold text-slate-800">{group.count} {group.count === 1 ? 'ativo' : 'ativos'}</span>
                    </div>
                    <div className="text-right border-r border-slate-200 pr-4 print:border-slate-350">
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">Custo Médio</span>
                      <span className="font-bold text-slate-800">{formatBRL(group.value / group.count)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-sans text-slate-400 block font-bold">Avaliação do Grupo</span>
                      <span className="font-black text-indigo-700 text-slate-900">{formatBRL(group.value)}</span>
                    </div>
                  </div>
                </div>

                {/* Summarized/Synthetic individual details in the grouped envelope */}
                <div className="p-4 space-y-4">
                  {/* Performance percentage rail indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase">
                      <span>Representação do Acervo Patrimonial</span>
                      <span>{group.percentage.toFixed(2)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden print:border print:border-slate-300">
                      <div 
                        className="bg-indigo-600 h-full rounded-full" 
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Sliced breakdown showing main files in synthetic display */}
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Resumo analítico associado ao grupo:
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {group.items.map(item => (
                      <div 
                        key={item.id} 
                        className="p-3 bg-slate-50 rounded-xl border border-slate-150 flex items-center justify-between text-xs hover:border-slate-300 print:bg-white print:border-slate-200"
                      >
                        <div className="min-w-0 space-y-0.5">
                          <span className="font-mono text-[9px] font-bold text-slate-400">{item.tag}</span>
                          <p className="font-bold text-slate-800 truncate" title={item.name}>{item.name}</p>
                          <p className="text-[10px] text-slate-450">{item.brand || 'Fabricante N/D'}</p>
                        </div>
                        <span className="font-bold text-slate-900 shrink-0 font-mono ml-2">
                          {formatBRL(item.value)}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-slate-150 rounded-2xl p-12 text-center text-slate-400 print:border-none">
              <Eye className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="font-semibold text-slate-500">Nenhum grupo de ativos corresponde aos filtros.</p>
              <p className="text-xs mt-1">Certifique-se de que existem bens ativos que correspondam às categorias e estados selecionados.</p>
            </div>
          )}
        </div>

      )}

      {/* Manual print helper callout (Non-printable) */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-750 print:hidden" id="reports-info-dialog">
        <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <h4 className="font-bold text-indigo-900">Dica de Exportação Comercial:</h4>
          <p className="text-slate-650 leading-relaxed">
            Ao clicar no botão de **Imprimir / Salvar em PDF** no topo direito, o sistema ocultará barras de ferramentas, rodapés, menu lateral de navegação e formatará as tabelas para aproveitar as dimensões de folhas padrão (A4/Carta), permitindo salvar como arquivo PDF oficial do seu computador com perfeição.
          </p>
        </div>
      </div>

    </div>
  );
}
