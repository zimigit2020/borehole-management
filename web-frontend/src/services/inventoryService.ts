import api from './api.service';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantityInStock: number;
  reservedQuantity: number;
  availableQuantity: number;
  minimumStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  totalValue: number;
  supplier?: string;
  supplierContact?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  shelfNumber?: string;
  lastRestockDate?: string;
  expiryDate?: string;
  isActive: boolean;
  images?: string[];
  specifications?: Record<string, any>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  item?: InventoryItem;
  type: 'stock_in' | 'stock_out' | 'transfer' | 'adjustment' | 'reserved' | 'released' | 'damaged' | 'returned';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  userId?: string;
  user?: any;
  jobId?: string;
  job?: any;
  fromLocation?: string;
  toLocation?: string;
  reference?: string;
  supplier?: string;
  reason?: string;
  notes?: string;
  previousStock?: number;
  newStock?: number;
  isReversed: boolean;
  reversedBy?: string;
  reversedAt?: string;
  reversalReason?: string;
  createdAt: string;
}

export interface CreateInventoryItemDto {
  sku: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  quantityInStock: number;
  minimumStock: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  unitCost: number;
  supplier?: string;
  supplierContact?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  location?: string;
  shelfNumber?: string;
  expiryDate?: string;
  images?: string[];
  specifications?: Record<string, any>;
  notes?: string;
}

export interface StockInDto {
  itemId: string;
  quantity: number;
  unitCost: number;
  supplier?: string;
  reference?: string;
  notes?: string;
}

export interface StockOutDto {
  itemId: string;
  quantity: number;
  jobId: string;
  reason?: string;
  notes?: string;
}

export interface ReserveStockDto {
  itemId: string;
  quantity: number;
  jobId: string;
  notes?: string;
}

export interface AdjustStockDto {
  itemId: string;
  newQuantity: number;
  reason: string;
  notes?: string;
}

class InventoryService {
  // Items
  async getItems(filters?: {
    category?: string;
    lowStock?: boolean;
    search?: string;
  }): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.lowStock) params.append('lowStock', 'true');
    if (filters?.search) params.append('search', filters.search);
    
    return api.get<InventoryItem[]>(`/inventory/items?${params.toString()}`);
  }

  async getItem(id: string): Promise<InventoryItem> {
    return api.get<InventoryItem>(`/inventory/items/${id}`);
  }

  async createItem(data: CreateInventoryItemDto): Promise<InventoryItem> {
    return api.post<InventoryItem>('/inventory/items', data);
  }

  async updateItem(id: string, data: Partial<CreateInventoryItemDto>): Promise<InventoryItem> {
    return api.put<InventoryItem>(`/inventory/items/${id}`, data);
  }

  async deleteItem(id: string): Promise<void> {
    await api.delete(`/inventory/items/${id}`);
  }

  // Stock Movements
  async stockIn(data: StockInDto): Promise<InventoryMovement> {
    return api.post<InventoryMovement>('/inventory/stock-in', data);
  }

  async stockOut(data: StockOutDto): Promise<InventoryMovement> {
    return api.post<InventoryMovement>('/inventory/stock-out', data);
  }

  async reserveStock(data: ReserveStockDto): Promise<InventoryMovement> {
    return api.post<InventoryMovement>('/inventory/reserve', data);
  }

  async releaseReservation(itemId: string, quantity: number, jobId: string): Promise<InventoryMovement> {
    return api.post<InventoryMovement>(`/inventory/release/${itemId}`, { quantity, jobId });
  }

  async adjustStock(data: AdjustStockDto): Promise<InventoryMovement> {
    return api.post<InventoryMovement>('/inventory/adjust', data);
  }

  // Movements & Reports
  async getMovements(filters?: {
    itemId?: string;
    jobId?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<InventoryMovement[]> {
    const params = new URLSearchParams();
    if (filters?.itemId) params.append('itemId', filters.itemId);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get<InventoryMovement[]>(`/inventory/movements?${params.toString()}`);
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return api.get<InventoryItem[]>('/inventory/reports/low-stock');
  }

  async getInventoryValue(): Promise<{
    totalItems: number;
    totalValue: number;
    byCategory: Record<string, number>;
  }> {
    return api.get<{
      totalItems: number;
      totalValue: number;
      byCategory: Record<string, number>;
    }>('/inventory/reports/value');
  }

  async getJobInventoryUsage(jobId: string): Promise<{
    items: any[];
    totalCost: number;
  }> {
    return api.get<{
      items: any[];
      totalCost: number;
    }>(`/inventory/reports/job-usage/${jobId}`);
  }
}

export default new InventoryService();