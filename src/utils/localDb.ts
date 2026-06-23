import { Asset, Location, Responsible, AssetMovement, Maintenance, Inventory, DashboardStats, AssetCategory, AssetStatus } from '../types';

interface DatabaseSchema {
  assets: Asset[];
  locations: Location[];
  responsibles: Responsible[];
  movements: AssetMovement[];
  maintenances: Maintenance[];
  inventories: Inventory[];
}

const STORAGE_KEY = 'patrimonium_masterop_db';

export function getLocalDb(): DatabaseSchema {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    const defaultData: DatabaseSchema = {
      assets: [],
      locations: [],
      responsibles: [],
      movements: [],
      maintenances: [],
      inventories: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
  try {
    const parsed = JSON.parse(data);
    // Ensure all arrays exist
    return {
      assets: parsed.assets || [],
      locations: parsed.locations || [],
      responsibles: parsed.responsibles || [],
      movements: parsed.movements || [],
      maintenances: parsed.maintenances || [],
      inventories: parsed.inventories || []
    };
  } catch (e) {
    const defaultData: DatabaseSchema = {
      assets: [],
      locations: [],
      responsibles: [],
      movements: [],
      maintenances: [],
      inventories: []
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
    return defaultData;
  }
}

export function saveLocalDb(db: DatabaseSchema) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function localGetAssets(): Asset[] {
  return getLocalDb().assets;
}

export function localAddAsset(assetData: Omit<Asset, 'id'>): Asset {
  const db = getLocalDb();
  const newAsset: Asset = {
    id: 'ast-' + Date.now(),
    ...assetData
  };
  db.assets.push(newAsset);
  saveLocalDb(db);
  return newAsset;
}

export function localUpdateAsset(id: string, updatedFields: Partial<Asset>): Asset {
  const db = getLocalDb();
  const index = db.assets.findIndex(a => a.id === id);
  if (index === -1) throw new Error('Patrimônio não encontrado no banco local.');
  db.assets[index] = { ...db.assets[index], ...updatedFields };
  saveLocalDb(db);
  return db.assets[index];
}

export function localDeleteAsset(id: string) {
  const db = getLocalDb();
  db.assets = db.assets.filter(a => a.id !== id);
  db.maintenances = db.maintenances.filter(m => m.assetId !== id);
  db.movements = db.movements.filter(m => m.assetId !== id);
  saveLocalDb(db);
}

export function localGetLocations(): Location[] {
  return getLocalDb().locations;
}

export function localAddLocation(locData: Omit<Location, 'id'>): Location {
  const db = getLocalDb();
  const newLoc: Location = {
    id: 'loc-' + Date.now(),
    ...locData
  };
  db.locations.push(newLoc);
  saveLocalDb(db);
  return newLoc;
}

export function localUpdateLocation(id: string, locData: Partial<Location>): void {
  const db = getLocalDb();
  const index = db.locations.findIndex(l => l.id === id);
  if (index !== -1) {
    db.locations[index] = { ...db.locations[index], ...locData };
    saveLocalDb(db);
  }
}

export function localDeleteLocation(id: string): void {
  const db = getLocalDb();
  const hasAssets = db.assets.some(a => a.locationId === id);
  if (hasAssets) {
    throw new Error("Não é possível excluir esta localização pois existem ativos vinculados a ela. Transfira os ativos para outro local antes de excluir.");
  }
  db.locations = db.locations.filter(l => l.id !== id);
  saveLocalDb(db);
}

export function localGetResponsibles(): Responsible[] {
  return getLocalDb().responsibles;
}

export function localAddResponsible(respData: Omit<Responsible, 'id'>): Responsible {
  const db = getLocalDb();
  const newResp: Responsible = {
    id: 'resp-' + Date.now(),
    ...respData
  };
  db.responsibles.push(newResp);
  saveLocalDb(db);
  return newResp;
}

export function localGetMovements(): AssetMovement[] {
  return getLocalDb().movements;
}

export function localAddMovement(movementData: { assetId: string; toLocationId: string; toResponsibleId: string; reason: string }): AssetMovement {
  const db = getLocalDb();
  const assetIndex = db.assets.findIndex(a => a.id === movementData.assetId);
  if (assetIndex === -1) throw new Error('Patrimônio não encontrado.');

  const asset = db.assets[assetIndex];
  const newMovement: AssetMovement = {
    id: 'mov-' + Date.now(),
    assetId: movementData.assetId,
    fromLocationId: asset.locationId,
    toLocationId: movementData.toLocationId,
    fromResponsibleId: asset.responsibleId,
    toResponsibleId: movementData.toResponsibleId,
    date: new Date().toISOString().split('T')[0],
    reason: movementData.reason || 'Transferência de Rotina'
  };

  asset.locationId = movementData.toLocationId;
  asset.responsibleId = movementData.toResponsibleId;

  db.movements.push(newMovement);
  saveLocalDb(db);
  return newMovement;
}

export function localGetMaintenances(): Maintenance[] {
  return getLocalDb().maintenances;
}

export function localAddMaintenance(maintData: any): Maintenance {
  const db = getLocalDb();
  const newMaint: Maintenance = {
    id: 'maint-' + Date.now(),
    assetId: maintData.assetId,
    description: maintData.description,
    provider: maintData.provider,
    cost: Number(maintData.cost || 0),
    startDate: maintData.startDate || new Date().toISOString().split('T')[0],
    status: maintData.status || 'pending'
  };

  if (newMaint.status === 'in_progress' || newMaint.status === 'pending') {
    const assetIdx = db.assets.findIndex(a => a.id === maintData.assetId);
    if (assetIdx !== -1) {
      db.assets[assetIdx].status = 'maintenance';
    }
  }

  db.maintenances.push(newMaint);
  saveLocalDb(db);
  return newMaint;
}

export function localUpdateMaintenance(id: string, updateFields: { status: 'completed' | 'canceled'; endDate?: string; cost?: number }): Maintenance {
  const db = getLocalDb();
  const index = db.maintenances.findIndex(m => m.id === id);
  if (index === -1) throw new Error('Serviço de manutenção não encontrado.');

  const record = db.maintenances[index];
  record.status = updateFields.status;
  if (updateFields.endDate) record.endDate = updateFields.endDate;
  if (updateFields.cost !== undefined) record.cost = Number(updateFields.cost);

  if (updateFields.status === 'completed' || updateFields.status === 'canceled') {
    const assetIdx = db.assets.findIndex(a => a.id === record.assetId);
    if (assetIdx !== -1) {
      db.assets[assetIdx].status = 'active';
    }
  }

  saveLocalDb(db);
  return record;
}

export function localGetInventories(): Inventory[] {
  return getLocalDb().inventories;
}

export function localStartInventory(title: string): Inventory {
  const db = getLocalDb();
  const activeInv = db.inventories.find(i => i.status === 'active');
  if (activeInv) throw new Error('Já existe um inventário ativo em andamento.');

  const items = db.assets.map(asset => {
    const loc = db.locations.find(l => l.id === asset.locationId);
    return {
      assetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      locationName: loc ? loc.name : 'N/A',
      scanned: false
    };
  });

  const newInv: Inventory = {
    id: 'inv-' + Date.now(),
    title: title || 'Novo Inventário Geral ' + new Date().getFullYear(),
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    items
  };

  db.inventories.push(newInv);
  saveLocalDb(db);
  return newInv;
}

export function localScanAsset(tag: string, observations?: string): Inventory {
  const db = getLocalDb();
  const index = db.inventories.findIndex(i => i.status === 'active');
  if (index === -1) throw new Error('Nenhum inventário ativo em andamento.');

  const inventory = db.inventories[index];
  const item = inventory.items.find(it => it.assetTag.toUpperCase() === tag.trim().toUpperCase());
  if (!item) throw new Error(`Ativo com a etiqueta ${tag} não está cadastrado neste inventário.`);

  item.scanned = true;
  item.scanDate = new Date().toISOString();
  if (observations) item.observations = observations;

  saveLocalDb(db);
  return inventory;
}

export function localFinishInventory(inventoryId: string): Inventory {
  const db = getLocalDb();
  const index = db.inventories.findIndex(i => i.id === inventoryId);
  if (index === -1) throw new Error('Inventário não encontrado.');

  db.inventories[index].status = 'finished';
  db.inventories[index].endDate = new Date().toISOString().split('T')[0];

  saveLocalDb(db);
  return db.inventories[index];
}

export function localGetStats(): DashboardStats {
  const db = getLocalDb();
  const assets = db.assets;
  const distributions_cat: Record<AssetCategory, number> = { furniture: 0, it: 0, machinery: 0, vehicles: 0, electronics: 0, other: 0 };
  const distributions_status: Record<AssetStatus, number> = { active: 0, maintenance: 0, transferred: 0, retired: 0 };

  let totalValue = 0;
  assets.forEach(a => {
    distributions_cat[a.category] = (distributions_cat[a.category] || 0) + 1;
    distributions_status[a.status] = (distributions_status[a.status] || 0) + 1;
    totalValue += Number(a.value || 0);
  });

  const activeMaintenances = db.maintenances.filter(m => m.status === 'in_progress' || m.status === 'pending').length;

  const monthlyAccsMap: Record<string, number> = {};
  assets.forEach(a => {
    if (a.acquisitionDate) {
      try {
        const parts = a.acquisitionDate.split('-');
        if (parts.length >= 2) {
          const yearShort = parts[0].slice(2);
          const month = parts[1];
          const key = `${month}/${yearShort}`;
          monthlyAccsMap[key] = (monthlyAccsMap[key] || 0) + Number(a.value || 0);
        }
      } catch (e) {}
    }
  });

  const monthsNameMap: Record<string, string> = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', '05': 'Mai', '06': 'Jun',
    '07': 'Jul', '08': 'Ago', '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };

  const monthlyAcquisitions = Object.entries(monthlyAccsMap).map(([key, val]) => {
    const parts = key.split('/');
    const mLabel = monthsNameMap[parts[0]] || parts[0];
    return {
      month: `${mLabel}/${parts[1]}`,
      value: val,
      raw_key: `${parts[1]}-${parts[0]}`
    };
  }).sort((a, b) => a.raw_key.localeCompare(b.raw_key));

  return {
    totalAssets: assets.length,
    totalValue,
    maintenanceCount: activeMaintenances,
    pendingMovementsCount: 0,
    categoryDistribution: distributions_cat,
    statusDistribution: distributions_status,
    monthlyAcquisitions
  };
}
