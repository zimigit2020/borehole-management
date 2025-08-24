import api from './api.service';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  jobId: string;
  job?: any;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  clientPhone?: string;
  clientTaxId?: string;
  status: 'draft' | 'sent' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
  items: InvoiceItem[];
  payments?: Payment[];
  createdById: string;
  createdBy?: any;
  sentAt?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice?: number;
  category?: string;
  referenceId?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  paymentNumber: string;
  amount: number;
  method: 'cash' | 'bank_transfer' | 'cheque' | 'mobile_money' | 'card';
  paymentDate: string;
  referenceNumber?: string;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
  recordedById: string;
  recordedBy?: any;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedById?: string;
  verifiedBy?: any;
  createdAt: string;
}

export interface CreateInvoiceDto {
  jobId: string;
  clientName: string;
  clientAddress: string;
  clientEmail?: string;
  clientPhone?: string;
  clientTaxId?: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRate?: number;
  discountAmount?: number;
  currency?: string;
  paymentTerms?: string;
  notes?: string;
  termsAndConditions?: string;
}

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  method: string;
  paymentDate: string;
  referenceNumber?: string;
  bankName?: string;
  accountNumber?: string;
  notes?: string;
}

export interface FinancialSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  invoiceCount: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export enum SupportedCurrency {
  USD = 'USD',
  ZAR = 'ZAR',
  ZWG = 'ZWG',
}

export interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  effectiveDate: string;
  isActive: boolean;
  notes?: string;
  updatedBy?: any;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExchangeRateDto {
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
  rate: number;
  effectiveDate: string;
  notes?: string;
}

export interface UpdateExchangeRateDto {
  rate: number;
  notes?: string;
}

export interface ConvertCurrencyDto {
  amount: number;
  fromCurrency: SupportedCurrency;
  toCurrency: SupportedCurrency;
}

export interface CurrencyConversion {
  originalAmount: number;
  convertedAmount: number;
  rate: number;
  fromCurrency: string;
  toCurrency: string;
}

class FinanceService {
  // Invoices
  async getInvoices(filters?: {
    status?: string;
    jobId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Invoice[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.jobId) params.append('jobId', filters.jobId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get<Invoice[]>(`/finance/invoices?${params.toString()}`);
  }

  async getInvoice(id: string): Promise<Invoice> {
    return api.get<Invoice>(`/finance/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoiceDto): Promise<Invoice> {
    return api.post<Invoice>('/finance/invoices', data);
  }

  async updateInvoice(id: string, data: Partial<CreateInvoiceDto>): Promise<Invoice> {
    return api.put<Invoice>(`/finance/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<void> {
    await api.delete(`/finance/invoices/${id}`);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    return api.post<Invoice>(`/finance/invoices/${id}/send`, {});
  }

  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    return api.post<Invoice>(`/finance/invoices/${id}/cancel`, { reason });
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return api.get<Invoice[]>('/finance/invoices/overdue');
  }

  // Payments
  async recordPayment(data: CreatePaymentDto): Promise<Payment> {
    return api.post<Payment>('/finance/payments', data);
  }

  async verifyPayment(id: string): Promise<Payment> {
    return api.post<Payment>(`/finance/payments/${id}/verify`, {});
  }

  async getPayments(filters?: {
    invoiceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Payment[]> {
    const params = new URLSearchParams();
    if (filters?.invoiceId) params.append('invoiceId', filters.invoiceId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    return api.get<Payment[]>(`/finance/payments?${params.toString()}`);
  }

  // Reports
  async getFinancialSummary(startDate: string, endDate: string): Promise<FinancialSummary> {
    return api.get<FinancialSummary>(`/finance/reports/summary?startDate=${startDate}&endDate=${endDate}`);
  }

  async getRevenueByMonth(year: number): Promise<Record<string, number>> {
    return api.get<Record<string, number>>(`/finance/reports/revenue/${year}`);
  }

  async updateOverdueStatuses(): Promise<void> {
    await api.post('/finance/maintenance/update-overdue', {});
  }

  // Exchange Rates
  async createExchangeRate(data: CreateExchangeRateDto): Promise<ExchangeRate> {
    return api.post<ExchangeRate>('/finance/exchange-rates', data);
  }

  async updateExchangeRate(from: string, to: string, data: UpdateExchangeRateDto): Promise<ExchangeRate> {
    return api.put<ExchangeRate>(`/finance/exchange-rates/${from}/${to}`, data);
  }

  async getExchangeRates(activeOnly = true): Promise<ExchangeRate[]> {
    return api.get<ExchangeRate[]>(`/finance/exchange-rates?activeOnly=${activeOnly}`);
  }

  async getExchangeRate(from: string, to: string): Promise<ExchangeRate> {
    return api.get<ExchangeRate>(`/finance/exchange-rates/${from}/${to}`);
  }

  async convertCurrency(data: ConvertCurrencyDto): Promise<CurrencyConversion> {
    return api.post<CurrencyConversion>('/finance/exchange-rates/convert', data);
  }
}

export default new FinanceService();