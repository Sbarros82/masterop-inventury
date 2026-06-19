import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  writeBatch
} from 'firebase/firestore';
import { Asset, Location, Responsible, AssetMovement, Maintenance, Inventory, DashboardStats, AssetCategory, AssetStatus } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initial database seed to populate when Firestore database is brand new
const INITIAL_DATABASE = {
  assets: [
    {
      id: "ast-1",
      tag: "PAT-0001",
      name: "Notebook Dell Latitude 5430",
      description: "Notebook de alta performance para desenvolvimento",
      category: "it",
      value: 5800.00,
      acquisitionDate: "2025-02-15",
      locationId: "loc-2",
      responsibleId: "resp-2",
      status: "active",
      serialNumber: "SNDELL8472",
      brand: "Dell",
      model: "Latitude 5430"
    },
    {
      id: "ast-2",
      tag: "PAT-0002",
      name: "Servidor Dell PowerEdge R750",
      description: "Servidor rack principal de banco de dados e arquivos local",
      category: "it",
      value: 34500.00,
      acquisitionDate: "2024-11-10",
      locationId: "loc-2",
      responsibleId: "resp-2",
      status: "active",
      serialNumber: "SNDELL7749",
      brand: "Dell",
      model: "PowerEdge R750"
    },
    {
      id: "ast-3",
      tag: "PAT-0003",
      name: "Cadeira Ergonômica Herman Miller Aeron",
      description: "Cadeira ergonômica premium em tela de alta resistência",
      category: "furniture",
      value: 9800.00,
      acquisitionDate: "2025-01-20",
      locationId: "loc-4",
      responsibleId: "resp-1",
      status: "active",
      serialNumber: "SNHM-99120",
      brand: "Herman Miller",
      model: "Aeron"
    },
    {
      id: "ast-4",
      tag: "PAT-0004",
      name: "Mesa Diretoria em Madeira Maciça",
      description: "Mesa executiva em L com tomadas embutidas",
      category: "furniture",
      value: 4500.00,
      acquisitionDate: "2025-01-20",
      locationId: "loc-4",
      responsibleId: "resp-1",
      status: "active",
      brand: "OfficeLux",
      model: "Executiva L"
    },
    {
      id: "ast-5",
      tag: "PAT-0005",
      name: "Impressora Industrial Zebra ZT411",
      description: "Impressora térmica de alta velocidade para etiquetas de patrimônio",
      category: "it",
      value: 8200.00,
      acquisitionDate: "2024-05-18",
      locationId: "loc-3",
      responsibleId: "resp-3",
      status: "maintenance",
      serialNumber: "SNZEB9921",
      brand: "Zebra",
      model: "ZT411"
    },
    {
      id: "ast-6",
      tag: "PAT-0006",
      name: "Ar Condicionado Split Carrier 24000 BTUs",
      description: "Equipamento de climatização do galpão principal",
      category: "furniture",
      value: 3900.00,
      acquisitionDate: "2024-08-05",
      locationId: "loc-3",
      responsibleId: "resp-3",
      status: "active",
      serialNumber: "SNCAR-88392",
      brand: "Carrier",
      model: "Split Digital"
    },
    {
      id: "ast-7",
      tag: "PAT-0007",
      name: "Monitor LG UltraWide 34\"",
      description: "Monitor curvo UX de alta resolução para design gráfico",
      category: "it",
      value: 2600.00,
      acquisitionDate: "2025-03-01",
      locationId: "loc-1",
      responsibleId: "resp-4",
      status: "active",
      serialNumber: "SNLG-55422",
      brand: "LG",
      model: "34WP550"
    }
  ] as Asset[],
  locations: [
    {
      id: "loc-1",
      name: "Sede Central - Escritório Administrativo",
      building: "Predio Faria Lima",
      floor: "3º Andar",
      description: "Escritório executivo e departamentos de suporte, Recursos Humanos e Financeiro"
    },
    {
      id: "loc-2",
      name: "Sala de Servidores TI",
      building: "Predio Faria Lima",
      floor: "Térreo",
      description: "Infraestrutura crítica de servidores, switches e central de telecom"
    },
    {
      id: "loc-3",
      name: "Setor A - Linha de Manufatura",
      building: "Galpão Operacional Principal",
      floor: "Térreo",
      description: "Área de esteiras de montagem, etiquetagem e despacho"
    },
    {
      id: "loc-4",
      name: "Gabinete da Diretoria",
      building: "Predio Faria Lima",
      floor: "4º Andar",
      description: "Escritório administrativo da presidência e diretoria executiva"
    }
  ] as Location[],
  responsibles: [
    {
      id: "resp-1",
      name: "Sergio MasterOp",
      email: "sergio@masterop.com.br",
      department: "Diretoria"
    },
    {
      id: "resp-2",
      name: "Maria Rodrigues",
      email: "maria.r@masterop.com.br",
      department: "Tecnologia da Informação"
    },
    {
      id: "resp-3",
      name: "Carlos Andrade",
      email: "carlos.a@masterop.com.br",
      department: "Operações & Logística"
    },
    {
      id: "resp-4",
      name: "Ana Paula",
      email: "ana.p@masterop.com.br",
      department: "Recursos Humanos"
    }
  ] as Responsible[],
  movements: [
    {
      id: "mov-1",
      assetId: "ast-1",
      fromLocationId: "loc-1",
      toLocationId: "loc-2",
      fromResponsibleId: "resp-4",
      toResponsibleId: "resp-2",
      date: "2025-06-10",
      reason: "Alocação definitiva de notebook de desenvolvimento para o time de TI"
    }
  ] as AssetMovement[],
  maintenances: [
    {
      id: "maint-1",
      assetId: "ast-5",
      description: "Troca da cabeça de impressão térmica e limpeza de bicos",
      provider: "Zebra Assistência Oficial",
      cost: 1200.00,
      startDate: "2026-06-15",
      status: "in_progress"
    }
  ] as Maintenance[],
  inventories: [] as Inventory[]
};

// Failsafe timeout utility wrapper to avoid infinite loading screens if Firebase is unreachable or blocked
export function withTimeout<T>(promise: Promise<T>, ms = 4000, errorMsg = 'Tempo limite de conexão excedido. O banco de dados Cloud Firestore não respondeu.'): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMsg));
    }, ms);
  });
  return Promise.race([promise, timeoutPromise]).then(
    (result) => {
      clearTimeout(timeoutId);
      return result;
    },
    (err) => {
      clearTimeout(timeoutId);
      throw err;
    }
  );
}

// Global cached promise to avoid concurrent redundant seeding requests
let seedPromise: Promise<void> | null = null;

// Help seed the database with defaults if it is completely empty
export async function ensureFirebaseSeeded(): Promise<void> {
  if (seedPromise) {
    return seedPromise;
  }

  seedPromise = (async () => {
    try {
      const snapPromise = getDocs(collection(db, 'assets'));
      // Wrap the initial connection check with a timeout
      const assetsSnap = await withTimeout(snapPromise, 3500, 'Sem resposta ao tentar inicializar banco Firestore.');
      
      if (assetsSnap.empty) {
        console.log("Firestore empty! Seeding default MasterOp databases...");
        const batch = writeBatch(db);

        // Seed responsibles
        INITIAL_DATABASE.responsibles.forEach(resp => {
          const dRef = doc(db, 'responsibles', resp.id);
          batch.set(dRef, resp);
        });

        // Seed locations
        INITIAL_DATABASE.locations.forEach(loc => {
          const dRef = doc(db, 'locations', loc.id);
          batch.set(dRef, loc);
        });

        // Seed assets
        INITIAL_DATABASE.assets.forEach(asset => {
          const dRef = doc(db, 'assets', asset.id);
          batch.set(dRef, asset);
        });

        // Seed movements
        INITIAL_DATABASE.movements.forEach(mov => {
          const dRef = doc(db, 'movements', mov.id);
          batch.set(dRef, mov);
        });

        // Seed maintenances
        INITIAL_DATABASE.maintenances.forEach(maint => {
          const dRef = doc(db, 'maintenances', maint.id);
          batch.set(dRef, maint);
        });

        await batch.commit();
        console.log("Seeding complete!");
      }
    } catch (err) {
      // Clear cache on error so a retry can attempt again
      seedPromise = null;
      throw err;
    }
  })();

  return seedPromise;
}

// Read functions wrapped with timeouts
export async function fbGetAssets(): Promise<Asset[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'assets'));
    return snap.docs.map(doc => doc.data() as Asset);
  })(), 4000, 'Erro ao carregar Ativos do Firestore (Timeout)');
}

export async function fbGetLocations(): Promise<Location[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'locations'));
    return snap.docs.map(doc => doc.data() as Location);
  })(), 4000, 'Erro ao carregar Unidades Administrativas do Firestore (Timeout)');
}

export async function fbGetResponsibles(): Promise<Responsible[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'responsibles'));
    return snap.docs.map(doc => doc.data() as Responsible);
  })(), 4000, 'Erro ao carregar Responsáveis do Firestore (Timeout)');
}

export async function fbGetMovements(): Promise<AssetMovement[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'movements'));
    return snap.docs.map(doc => doc.data() as AssetMovement);
  })(), 4000, 'Erro ao carregar Movimentações do Firestore (Timeout)');
}

export async function fbGetMaintenances(): Promise<Maintenance[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'maintenances'));
    return snap.docs.map(doc => doc.data() as Maintenance);
  })(), 4000, 'Erro ao carregar Ordens de Manutenção do Firestore (Timeout)');
}

export async function fbGetInventories(): Promise<Inventory[]> {
  return withTimeout((async () => {
    await ensureFirebaseSeeded();
    const snap = await getDocs(collection(db, 'inventories'));
    return snap.docs.map(doc => doc.data() as Inventory);
  })(), 4000, 'Erro ao carregar Inventários Clínicos do Firestore (Timeout)');
}

// Create & update functions
export async function fbAddAsset(assetData: Omit<Asset, 'id'>): Promise<Asset> {
  const newId = 'ast-' + Date.now();
  const asset: Asset = {
    id: newId,
    ...assetData
  };
  await setDoc(doc(db, 'assets', newId), asset);
  return asset;
}

export async function fbAddLocation(locData: Omit<Location, 'id'>): Promise<Location> {
  const newId = 'loc-' + Date.now();
  const loc: Location = {
    id: newId,
    ...locData
  };
  await setDoc(doc(db, 'locations', newId), loc);
  return loc;
}

export async function fbAddResponsible(respData: Omit<Responsible, 'id'>): Promise<Responsible> {
  const newId = 'resp-' + Date.now();
  const resp: Responsible = {
    id: newId,
    ...respData
  };
  await setDoc(doc(db, 'responsibles', newId), resp);
  return resp;
}

export async function fbUpdateAsset(id: string, updatedFields: Partial<Asset>): Promise<void> {
  const dRef = doc(db, 'assets', id);
  await setDoc(dRef, updatedFields, { merge: true });
}

export async function fbDeleteAsset(id: string): Promise<void> {
  await deleteDoc(doc(db, 'assets', id));
  // Keep movements and maintenances cleaner by not strictly removing for historical trace, 
  // or remove them if desired. Let's keep them so historical log isn't broken.
}

export async function fbAddMovement(movementData: { assetId: string; toLocationId: string; toResponsibleId: string; reason: string }) : Promise<AssetMovement> {
  const assets = await fbGetAssets();
  const asset = assets.find(a => a.id === movementData.assetId);
  if (!asset) throw new Error('Ativo não encontrado');

  const newId = 'mov-' + Date.now();
  const newMovement: AssetMovement = {
    id: newId,
    assetId: movementData.assetId,
    fromLocationId: asset.locationId,
    toLocationId: movementData.toLocationId,
    fromResponsibleId: asset.responsibleId,
    toResponsibleId: movementData.toResponsibleId,
    date: new Date().toISOString().split('T')[0],
    reason: movementData.reason || 'Movimentação via Dashboard'
  };

  // Update asset's current location and responsible in doc
  await fbUpdateAsset(movementData.assetId, {
    locationId: movementData.toLocationId,
    responsibleId: movementData.toResponsibleId
  });

  // Save movement doc
  await setDoc(doc(db, 'movements', newId), newMovement);
  return newMovement;
}

export async function fbAddMaintenance(maintData: any): Promise<Maintenance> {
  const newId = 'maint-' + Date.now();
  const newMaint: Maintenance = {
    id: newId,
    assetId: maintData.assetId,
    description: maintData.description,
    provider: maintData.provider,
    cost: Number(maintData.cost || 0),
    startDate: maintData.startDate || new Date().toISOString().split('T')[0],
    status: maintData.status || 'pending'
  };

  if (newMaint.status === 'in_progress' || newMaint.status === 'pending') {
    await fbUpdateAsset(maintData.assetId, { status: 'maintenance' });
  }

  await setDoc(doc(db, 'maintenances', newId), newMaint);
  return newMaint;
}

export async function fbUpdateMaintenance(id: string, updateFields: { status: 'completed' | 'canceled'; endDate?: string; cost?: number }): Promise<void> {
  const mRef = doc(db, 'maintenances', id);
  await setDoc(mRef, {
    status: updateFields.status,
    ...(updateFields.endDate && { endDate: updateFields.endDate }),
    ...(updateFields.cost !== undefined && { cost: Number(updateFields.cost) })
  }, { merge: true });

  // Get asset id from snapshot to revert its status to active
  const mains = await fbGetMaintenances();
  const mainRecord = mains.find(m => m.id === id);
  if (mainRecord) {
    if (updateFields.status === 'completed' || updateFields.status === 'canceled') {
      await fbUpdateAsset(mainRecord.assetId, { status: 'active' });
    }
  }
}

export async function fbStartInventory(title: string): Promise<Inventory> {
  const inventories = await fbGetInventories();
  const activeInv = inventories.find(i => i.status === 'active');
  if (activeInv) throw new Error('Já existe um inventário ativo em andamento.');

  const assets = await fbGetAssets();
  const locations = await fbGetLocations();

  const items = assets.map(asset => {
    const loc = locations.find(l => l.id === asset.locationId);
    return {
      assetId: asset.id,
      assetTag: asset.tag,
      assetName: asset.name,
      locationName: loc ? loc.name : 'N/A',
      scanned: false
    };
  });

  const newId = 'inv-' + Date.now();
  const newInv: Inventory = {
    id: newId,
    title: title || 'Novo Inventário Geral ' + new Date().getFullYear(),
    startDate: new Date().toISOString().split('T')[0],
    status: 'active',
    items
  };

  await setDoc(doc(db, 'inventories', newId), newInv);
  return newInv;
}

export async function fbScanAsset(tag: string, observations?: string): Promise<Inventory> {
  const inventories = await fbGetInventories();
  const activeInvIdx = inventories.findIndex(i => i.status === 'active');
  if (activeInvIdx === -1) throw new Error('Nenhum inventário ativo em andamento.');

  const inventory = inventories[activeInvIdx];
  const item = inventory.items.find(it => it.assetTag.toUpperCase() === tag.trim().toUpperCase());
  if (!item) throw new Error(`Ativo com a etiqueta ${tag} não está cadastrado neste inventário.`);

  item.scanned = true;
  item.scanDate = new Date().toISOString();
  if (observations) item.observations = observations;

  await setDoc(doc(db, 'inventories', inventory.id), inventory);
  return inventory;
}

export async function fbFinishInventory(inventoryId: string): Promise<Inventory> {
  const inventories = await fbGetInventories();
  const inventory = inventories.find(i => i.id === inventoryId);
  if (!inventory) throw new Error('Inventário não encontrado.');

  inventory.status = 'finished';
  inventory.endDate = new Date().toISOString().split('T')[0];

  await setDoc(doc(db, 'inventories', inventoryId), inventory);
  return inventory;
}

export async function fbGetStats(providedAssets?: Asset[], providedMaintenances?: Maintenance[]): Promise<DashboardStats> {
  const assets = providedAssets || await fbGetAssets();
  const maintenances = providedMaintenances || await fbGetMaintenances();

  const distributions_cat: Record<AssetCategory, number> = { furniture: 0, it: 0, machinery: 0, vehicles: 0, other: 0 };
  const distributions_status: Record<AssetStatus, number> = { active: 0, maintenance: 0, transferred: 0, retired: 0 };

  let totalValue = 0;
  assets.forEach(a => {
    distributions_cat[a.category] = (distributions_cat[a.category] || 0) + 1;
    distributions_status[a.status] = (distributions_status[a.status] || 0) + 1;
    totalValue += Number(a.value || 0);
  });

  const activeMaintenances = maintenances.filter(m => m.status === 'in_progress' || m.status === 'pending').length;

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
