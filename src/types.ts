export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'auditor';
}

export type AssetStatus = 'active' | 'maintenance' | 'transferred' | 'retired';
export type AssetCategory = 'furniture' | 'it' | 'machinery' | 'vehicles' | 'other';

export interface Asset {
  id: string;
  tag: string; // Heritage Tag (e.g., PAT-0001)
  name: string;
  description: string;
  category: AssetCategory;
  value: number;
  acquisitionDate: string;
  locationId: string;
  responsibleId: string;
  status: AssetStatus;
  serialNumber?: string;
  brand?: string;
  model?: string;
}

export interface Location {
  id: string;
  name: string;
  building: string;
  floor: string;
  description: string;
}

export interface Responsible {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface AssetMovement {
  id: string;
  assetId: string;
  fromLocationId: string;
  toLocationId: string;
  fromResponsibleId: string;
  toResponsibleId: string;
  date: string;
  reason: string;
}

export interface Maintenance {
  id: string;
  assetId: string;
  description: string;
  provider: string;
  cost: number;
  startDate: string;
  endDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'canceled';
}

export interface InventoryItem {
  assetId: string;
  assetTag: string;
  assetName: string;
  locationName: string;
  scanned: boolean;
  scanDate?: string;
  observations?: string;
}

export interface Inventory {
  id: string;
  title: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'finished';
  items: InventoryItem[];
}

export interface DashboardStats {
  totalAssets: number;
  totalValue: number;
  maintenanceCount: number;
  pendingMovementsCount: number;
  categoryDistribution: Record<AssetCategory, number>;
  statusDistribution: Record<AssetStatus, number>;
  monthlyAcquisitions: Array<{ month: string; value: number }>;
}
