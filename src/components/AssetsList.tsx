import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Filter, 
  Layers, 
  Building2, 
  User, 
  ChevronRight,
  Sliders,
  DollarSign,
  Barcode,
  X,
  AlertCircle,
  Camera,
  Maximize2
} from 'lucide-react';
import { Asset, AssetCategory, AssetStatus, Location, Responsible, User as UserType } from '../types';

interface AssetsListProps {
  assets: Asset[];
  locations: Location[];
  responsibles: Responsible[];
  currentUser: UserType;
  onAddAsset: (asset: Omit<Asset, 'id'>) => Promise<void>;
  onUpdateAsset: (id: string, asset: Partial<Asset>) => Promise<void>;
  onDeleteAsset: (id: string) => Promise<void>;
}

export function AssetsList({ 
  assets, 
  locations, 
  responsibles, 
  currentUser,
  onAddAsset, 
  onUpdateAsset, 
  onDeleteAsset 
}: AssetsListProps) {
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'it' as AssetCategory,
    value: 0,
    acquisitionDate: new Date().toISOString().split('T')[0],
    locationId: '',
    responsibleId: '',
    status: 'active' as AssetStatus,
    serialNumber: '',
    brand: '',
    model: '',
    photo: ''
  });

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Stop camera media tracks
  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCameraError('');
  };

  // Start active camera feed
  const startCameraStream = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setCameraStream(stream);
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 150);
    } catch (err: any) {
      setCameraError('Não foi possível acessar a câmera do dispositivo. Verifique as permissões de acesso.');
      console.error(err);
    }
  };

  // Click handler to snapshot frame from stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setFormData((prev) => ({ ...prev, photo: dataUrl }));
      stopCameraStream();
    }
  };

  // Convert uploaded image file path to Base64 data url
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData((prev) => ({ ...prev, photo: event.target!.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Make sure we stop the streams on unmount
  React.useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const closeModal = () => {
    stopCameraStream();
    setIsFormOpen(false);
  };

  const canModify = currentUser.role === 'admin' || currentUser.role === 'operator';

  // Apply filters
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asset.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesLocation = selectedLocation === 'all' || asset.locationId === selectedLocation;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesLocation && matchesStatus;
  });

  const getCategoryBadge = (category: AssetCategory) => {
    switch (category) {
      case 'furniture':
        return { label: 'Móveis', bg: 'bg-blue-50 text-blue-600 border-blue-100' };
      case 'it':
        return { label: 'TI / Informática', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'machinery':
        return { label: 'Máquinas', bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'vehicles':
        return { label: 'Veículos', bg: 'bg-teal-50 text-teal-600 border-teal-100' };
      default:
        return { label: 'Outro', bg: 'bg-slate-50 text-slate-600 border-slate-100' };
    }
  };

  const getStatusBadge = (status: AssetStatus) => {
    switch (status) {
      case 'active':
        return { label: 'Ativo', bg: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'maintenance':
        return { label: 'Manutenção', bg: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'transferred':
        return { label: 'Transferido', bg: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'retired':
        return { label: 'Baixado', bg: 'bg-rose-50 text-rose-600 border-rose-100' };
    }
  };

  const openAddForm = () => {
    setErrorText('');
    setEditingAsset(null);
    stopCameraStream();
    setFormData({
      name: '',
      description: '',
      category: 'it',
      value: 0,
      acquisitionDate: new Date().toISOString().split('T')[0],
      locationId: locations[0]?.id || '',
      responsibleId: responsibles[0]?.id || '',
      status: 'active',
      serialNumber: '',
      brand: '',
      model: '',
      photo: ''
    });
    setIsFormOpen(true);
  };

  const openEditForm = (asset: Asset) => {
    setErrorText('');
    setEditingAsset(asset);
    stopCameraStream();
    setFormData({
      name: asset.name,
      description: asset.description || '',
      category: asset.category,
      value: asset.value,
      acquisitionDate: asset.acquisitionDate ? asset.acquisitionDate.split('T')[0] : new Date().toISOString().split('T')[0],
      locationId: asset.locationId,
      responsibleId: asset.responsibleId,
      status: asset.status,
      serialNumber: asset.serialNumber || '',
      brand: asset.brand || '',
      model: asset.model || '',
      photo: asset.photo || ''
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (!formData.name.trim()) {
      setErrorText('Por favor, informe o nome do ativo.');
      return;
    }
    if (!formData.locationId) {
      setErrorText('Escolha uma localização padrão.');
      return;
    }
    if (!formData.responsibleId) {
      setErrorText('Selecione um colaborador responsável.');
      return;
    }

    try {
      if (editingAsset) {
        await onUpdateAsset(editingAsset.id, formData);
      } else {
        await onAddAsset(formData);
      }
      closeModal();
    } catch (err: any) {
      setErrorText(err.message || 'Erro ao registrar ativo patrimonial.');
    }
  };

  const handleDelete = async (id: string, tag: string) => {
    if (window.confirm(`Tem certeza de que deseja remover o Ativo ${tag}? Essa operação é irreversível.`)) {
      try {
        await onDeleteAsset(id);
      } catch (err: any) {
        alert(err.message || 'Erro ao deletar o ativo.');
      }
    }
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6" id="assets-list-module">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patrimônio / Ativos</h1>
          <p className="text-sm text-slate-500">Cadastro de móveis, máquinas e equipamentos da corporação.</p>
        </div>
        {canModify && (
          <button
            id="register-asset-btn"
            onClick={openAddForm}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Ativo</span>
          </button>
        )}
      </div>

      {/* Filters bar */}
      <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-xs space-y-4" id="filters-container">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              id="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar por nome, etiqueta, número de série..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Category Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Layers className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="filter-category"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
              >
                <option value="all">Todas Categorias</option>
                <option value="furniture">Móveis</option>
                <option value="it">TI / Informática</option>
                <option value="machinery">Máquinas</option>
                <option value="vehicles">Veículos</option>
                <option value="other">Outros</option>
              </select>
            </div>

            {/* Location Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="filter-location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
              >
                <option value="all">Todas Localizações</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5">
              <Sliders className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                id="filter-status"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-600 outline-hidden w-full cursor-pointer"
              >
                <option value="all">Todos Estados</option>
                <option value="active">Ativo</option>
                <option value="maintenance">Manutenção</option>
                <option value="transferred">Transferido</option>
                <option value="retired">Baixado</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden" id="assets-table-container">
        {filteredAssets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse" id="assets-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="p-4 w-28">Etiqueta</th>
                  <th className="p-4">Ativo Patrimonial</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Alocação Atual</th>
                  <th className="p-4">Responsável</th>
                  <th className="p-4 text-right">Valor</th>
                  <th className="p-4 text-center">Status</th>
                  {canModify && <th className="p-4 text-center w-24">Ações</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                {filteredAssets.map((asset) => {
                  const loc = locations.find((l) => l.id === asset.locationId);
                  const resp = responsibles.find((r) => r.id === asset.responsibleId);
                  const catInfo = getCategoryBadge(asset.category);
                  const statInfo = getStatusBadge(asset.status);

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Heritage Tag */}
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs font-mono font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 max-w-fit">
                          <Barcode className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{asset.tag}</span>
                        </div>
                      </td>

                      {/* Main asset names */}
                      <td className="p-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          {asset.photo ? (
                            <div className="relative group shrink-0">
                              <img 
                                src={asset.photo} 
                                alt={asset.name} 
                                onClick={() => setSelectedPhoto(asset.photo || null)}
                                className="w-10 h-10 object-cover rounded-lg border border-slate-200 cursor-zoom-in hover:scale-105 transition-all" 
                              />
                              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg pointer-events-none transition-opacity">
                                <Maximize2 className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-lg flex items-center justify-center text-slate-350 shrink-0 select-none">
                              <Camera className="w-4 h-4 text-slate-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate" title={asset.name}>{asset.name}</h4>
                            <p className="text-xs text-slate-405 truncate mt-0.5" title={asset.description}>{asset.description || 'Sem descrição'}</p>
                            {(asset.brand || asset.model) && (
                              <div className="text-[10px] text-slate-400 mt-0.5 flex gap-1">
                                {asset.brand && <span className="bg-slate-100 px-1 py-0.5 rounded-sm">Marca: {asset.brand}</span>}
                                {asset.model && <span className="bg-slate-100 px-1 py-0.5 rounded-sm">Modelo: {asset.model}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-lg border font-medium ${catInfo.bg}`}>
                          {catInfo.label}
                        </span>
                      </td>

                      {/* Physical Location */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[150px]" title={loc ? loc.name : 'Não alocado'}>
                            {loc ? loc.name : 'Não alocado'}
                          </span>
                        </div>
                      </td>

                      {/* Responsible Person */}
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[130px]" title={resp ? resp.name : 'Sem responsável'}>
                            {resp ? resp.name : 'Sem responsável'}
                          </span>
                        </div>
                      </td>

                      {/* Procurement Value */}
                      <td className="p-4 text-right font-mono font-bold text-slate-900">
                        {formatBRL(asset.value)}
                      </td>

                      {/* Condition Status */}
                      <td className="p-4 text-center">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statInfo.bg}`}>
                          {statInfo.label}
                        </span>
                      </td>

                      {/* Commands */}
                      {canModify && (
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditForm(asset)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-600 border border-slate-200/50 transition-colors cursor-pointer"
                              title="Editar Ativo"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(asset.id, asset.tag)}
                              className="p-1.5 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/50 transition-colors cursor-pointer"
                              title="Remover Ativo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center" id="assets-empty">
            <Tag className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Nenhum ativo encontrado</p>
            <p className="text-slate-400 text-xs mt-1">Experimente limpar filtros ou conferir a busca por termo.</p>
          </div>
        )}
      </div>

      {/* Creation & Editing Modal Dialog */}
      {isFormOpen && (
        <div id="asset-form-modal" className="fixed inset-0 bg-slate-900/40 backup-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl border border-slate-105 my-8 transform scale-100 transition-all">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingAsset ? `Editar Ativo: ${editingAsset.tag}` : 'Cadastrar Ativo Patrimonial'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Informe as especificações e a alocação padrão nas unidades.</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {errorText && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-600">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorText}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Nome do Ativo *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Servidor de Aplicação HP ProLiant"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Descrição / Notas de Observação</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mais detalhes como localização secundária ou estado físico..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 resize-none"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as AssetCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="furniture">Móveis e Utensílios</option>
                    <option value="it">Equipamentos TI</option>
                    <option value="machinery">Máquinas e Ferramentas</option>
                    <option value="vehicles">Veículos corporativos</option>
                    <option value="other">Outros</option>
                  </select>
                </div>

                {/* Value */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Valor de Aquisição (R$) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      min="0"
                      value={formData.value || ''}
                      onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                      placeholder="0,00"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Localização Inicial *</label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="" disabled>Escolha...</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Responsible */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Colaborador Responsável *</label>
                  <select
                    value={formData.responsibleId}
                    onChange={(e) => setFormData({ ...formData, responsibleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="" disabled>Selecione...</option>
                    {responsibles.map((resp) => (
                      <option key={resp.id} value={resp.id}>{resp.name} ({resp.department})</option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Estado Inicial</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AssetStatus })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  >
                    <option value="active">Ativo e Operando</option>
                    <option value="maintenance">Em Manutenção</option>
                    <option value="transferred">Transferido temporariamente</option>
                    <option value="retired">Baixado / Fora de uso</option>
                  </select>
                </div>

                {/* Acquisition Date */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Data de Aquisição *</label>
                  <input
                    type="date"
                    required
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800 cursor-pointer"
                  />
                </div>

                {/* Additional Tech specifications */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Marca / Fabricante</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: Lenovo, Epson"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Modelo / Versão</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ex: ThinkPad E14"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Número de Série / Código de Fábrica</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="Ex: SN-9238-XJA9-B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden text-slate-800"
                  />
                </div>

                {/* Photo upload / live capture section */}
                <div className="md:col-span-2 border border-slate-200 bg-slate-50/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Foto do Ativo Patrimonial</span>
                      <span className="text-[10px] text-slate-400 block">Adicione fotos de tomadas de identificação ou do estado do bem.</span>
                    </div>
                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                      >
                        Remover Foto
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Thumbnail / Camera display panel */}
                    <div className="w-28 h-28 bg-white border border-slate-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0 relative">
                      {showCamera ? (
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                      ) : formData.photo ? (
                        <img 
                          src={formData.photo} 
                          alt="Visualização do ativo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-slate-350" />
                      )}
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      {showCamera ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Capturar Foto</span>
                          </button>
                          <button
                            type="button"
                            onClick={stopCameraStream}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-755 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={startCameraStream}
                            className="px-2 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>Tirar Foto</span>
                          </button>
                          
                          <label className="px-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center">
                            <span>Upload Arquivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      )}
                      
                      {cameraError && (
                        <p className="text-[10px] text-rose-500 font-bold">{cameraError}</p>
                      )}
                      <p className="text-[10px] text-slate-450 line-height-tight">Suporta capturas diretas da câmera/webcam ou downloads de arquivos JPEG/PNG.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 my-4 pt-4 flex items-center justify-end gap-3" id="modal-actions-container">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all cursor-pointer"
                >
                  {editingAsset ? 'Salvar Edição' : 'Concluir Cadastro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox photo modal zoomed preview */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 transition-opacity" 
          onClick={() => setSelectedPhoto(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-950 overflow-hidden rounded-2xl border border-slate-800 flex items-center justify-center shadow-2xl p-2" 
            onClick={e => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto} 
              alt="Visualização ampliada do ativo" 
              className="max-w-full max-h-[80vh] object-contain rounded-xl" 
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-9 h-9 bg-slate-900/80 hover:bg-slate-900 rounded-full border border-slate-750 flex items-center justify-center text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
