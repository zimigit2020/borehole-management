import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Invoice, InvoiceItem, Payment, InvoiceStatus } from './entities/invoice.entity';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateExchangeRateDto, UpdateExchangeRateDto, ConvertCurrencyDto, SupportedCurrency } from './dto/exchange-rate.dto';
import { ExchangeRate } from './entities/exchange-rate.entity';
import { User } from '../users/user.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Invoice)
    private invoicesRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemsRepository: Repository<InvoiceItem>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(ExchangeRate)
    private exchangeRatesRepository: Repository<ExchangeRate>,
  ) {}

  // Invoice Management
  async createInvoice(dto: CreateInvoiceDto, user: User): Promise<Invoice> {
    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const items = dto.items.map(item => ({
      ...item,
      totalPrice: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const taxRate = dto.taxRate || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const discountAmount = dto.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = this.invoicesRepository.create({
      ...dto,
      invoiceNumber,
      createdById: user.id,
      subtotal,
      taxRate,
      taxAmount,
      discountAmount,
      totalAmount,
      balanceDue: totalAmount,
      currency: dto.currency || 'USD',
      items: items as InvoiceItem[],
    });

    return this.invoicesRepository.save(invoice);
  }

  async findAllInvoices(filters?: {
    status?: InvoiceStatus;
    jobId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Invoice[]> {
    const query = this.invoicesRepository.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.job', 'job')
      .leftJoinAndSelect('invoice.items', 'items')
      .leftJoinAndSelect('invoice.payments', 'payments');

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.jobId) {
      query.andWhere('invoice.jobId = :jobId', { jobId: filters.jobId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('invoice.issueDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('invoice.createdAt', 'DESC').getMany();
  }

  async findOneInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: ['job', 'items', 'payments', 'createdBy'],
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async updateInvoice(id: string, dto: UpdateInvoiceDto): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot update paid invoice');
    }

    // Recalculate if items changed
    if (dto.items) {
      // Delete existing items
      await this.invoiceItemsRepository.delete({ invoiceId: id });

      // Calculate new totals
      const items = dto.items.map(item => ({
        ...item,
        totalPrice: item.quantity * item.unitPrice,
      }));

      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const taxRate = dto.taxRate || invoice.taxRate;
      const taxAmount = (subtotal * taxRate) / 100;
      const discountAmount = dto.discountAmount || invoice.discountAmount;
      const totalAmount = subtotal + taxAmount - discountAmount;

      Object.assign(invoice, {
        ...dto,
        subtotal,
        taxAmount,
        totalAmount,
        balanceDue: totalAmount - invoice.paidAmount,
        items: items as InvoiceItem[],
      });
    } else {
      Object.assign(invoice, dto);
    }

    return this.invoicesRepository.save(invoice);
  }

  async deleteInvoice(id: string): Promise<void> {
    const invoice = await this.findOneInvoice(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only delete draft invoices');
    }

    await this.invoicesRepository.delete(id);
  }

  async sendInvoice(id: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Can only send draft invoices');
    }

    invoice.status = InvoiceStatus.SENT;
    invoice.sentAt = new Date();

    // Check if overdue
    if (new Date() > new Date(invoice.dueDate)) {
      invoice.status = InvoiceStatus.OVERDUE;
    }

    return this.invoicesRepository.save(invoice);
  }

  async cancelInvoice(id: string, reason: string): Promise<Invoice> {
    const invoice = await this.findOneInvoice(id);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot cancel paid invoice');
    }

    invoice.status = InvoiceStatus.CANCELLED;
    invoice.cancelledAt = new Date();
    invoice.cancellationReason = reason;

    return this.invoicesRepository.save(invoice);
  }

  // Payment Management
  async recordPayment(dto: CreatePaymentDto, user: User): Promise<Payment> {
    const invoice = await this.findOneInvoice(dto.invoiceId);

    if (invoice.status === InvoiceStatus.CANCELLED) {
      throw new BadRequestException('Cannot record payment for cancelled invoice');
    }

    if (dto.amount > invoice.balanceDue) {
      throw new BadRequestException(`Payment amount exceeds balance due (${invoice.balanceDue})`);
    }

    // Generate payment number
    const paymentNumber = await this.generatePaymentNumber();

    const payment = this.paymentsRepository.create({
      ...dto,
      paymentNumber,
      recordedById: user.id,
    });

    await this.paymentsRepository.save(payment);

    // Update invoice
    invoice.paidAmount += dto.amount;
    invoice.balanceDue = invoice.totalAmount - invoice.paidAmount;

    if (invoice.balanceDue === 0) {
      invoice.status = InvoiceStatus.PAID;
      invoice.paidAt = new Date();
    } else if (invoice.paidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoicesRepository.save(invoice);

    return payment;
  }

  async verifyPayment(paymentId: string, user: User): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.isVerified) {
      throw new BadRequestException('Payment already verified');
    }

    payment.isVerified = true;
    payment.verifiedAt = new Date();
    payment.verifiedById = user.id;

    return this.paymentsRepository.save(payment);
  }

  async getPayments(filters?: {
    invoiceId?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Payment[]> {
    const query = this.paymentsRepository.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.invoice', 'invoice')
      .leftJoinAndSelect('payment.recordedBy', 'recordedBy');

    if (filters?.invoiceId) {
      query.andWhere('payment.invoiceId = :invoiceId', { invoiceId: filters.invoiceId });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('payment.paymentDate BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    return query.orderBy('payment.createdAt', 'DESC').getMany();
  }

  // Reports
  async getFinancialSummary(startDate: Date, endDate: Date): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalOutstanding: number;
    invoiceCount: number;
    paidInvoices: number;
    overdueInvoices: number;
  }> {
    const invoices = await this.invoicesRepository.find({
      where: {
        issueDate: Between(startDate, endDate),
      },
    });

    const overdueInvoices = await this.invoicesRepository.count({
      where: {
        dueDate: LessThan(new Date()),
        status: InvoiceStatus.SENT,
      },
    });

    const totalInvoiced = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + Number(inv.paidAmount), 0);
    const totalOutstanding = totalInvoiced - totalPaid;
    const paidInvoices = invoices.filter(inv => inv.status === InvoiceStatus.PAID).length;

    return {
      totalInvoiced,
      totalPaid,
      totalOutstanding,
      invoiceCount: invoices.length,
      paidInvoices,
      overdueInvoices,
    };
  }

  async getRevenueByMonth(year: number): Promise<Record<string, number>> {
    const payments = await this.paymentsRepository
      .createQueryBuilder('payment')
      .where('EXTRACT(YEAR FROM payment.paymentDate) = :year', { year })
      .getMany();

    const revenueByMonth = {};
    for (let month = 1; month <= 12; month++) {
      const monthPayments = payments.filter(p => {
        const paymentMonth = new Date(p.paymentDate).getMonth() + 1;
        return paymentMonth === month;
      });
      
      const monthRevenue = monthPayments.reduce((sum, p) => sum + Number(p.amount), 0);
      revenueByMonth[month.toString().padStart(2, '0')] = monthRevenue;
    }

    return revenueByMonth;
  }

  async getOverdueInvoices(): Promise<Invoice[]> {
    return this.invoicesRepository.find({
      where: {
        dueDate: LessThan(new Date()),
        status: InvoiceStatus.SENT,
      },
      relations: ['job'],
      order: { dueDate: 'ASC' },
    });
  }

  async updateOverdueStatuses(): Promise<void> {
    const overdueInvoices = await this.invoicesRepository.find({
      where: {
        dueDate: LessThan(new Date()),
        status: InvoiceStatus.SENT,
      },
    });

    for (const invoice of overdueInvoices) {
      invoice.status = InvoiceStatus.OVERDUE;
      await this.invoicesRepository.save(invoice);
    }
  }

  // Exchange Rate Management
  async createExchangeRate(dto: CreateExchangeRateDto, user: User): Promise<ExchangeRate> {
    // Check if rate already exists for this currency pair
    const existing = await this.exchangeRatesRepository.findOne({
      where: {
        fromCurrency: dto.fromCurrency,
        toCurrency: dto.toCurrency,
        isActive: true,
      },
    });

    if (existing) {
      // Deactivate the old rate
      existing.isActive = false;
      await this.exchangeRatesRepository.save(existing);
    }

    const exchangeRate = this.exchangeRatesRepository.create({
      ...dto,
      updatedById: user.id,
      isActive: true,
    });

    return this.exchangeRatesRepository.save(exchangeRate);
  }

  async updateExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    dto: UpdateExchangeRateDto,
    user: User,
  ): Promise<ExchangeRate> {
    const exchangeRate = await this.exchangeRatesRepository.findOne({
      where: {
        fromCurrency,
        toCurrency,
        isActive: true,
      },
    });

    if (!exchangeRate) {
      throw new NotFoundException('Exchange rate not found');
    }

    // Create new rate entry (keeping history)
    const newRate = this.exchangeRatesRepository.create({
      fromCurrency,
      toCurrency,
      rate: dto.rate,
      notes: dto.notes,
      effectiveDate: new Date(),
      updatedById: user.id,
      isActive: true,
    });

    // Deactivate old rate
    exchangeRate.isActive = false;
    await this.exchangeRatesRepository.save(exchangeRate);

    return this.exchangeRatesRepository.save(newRate);
  }

  async getExchangeRates(activeOnly = true): Promise<ExchangeRate[]> {
    const query = this.exchangeRatesRepository.createQueryBuilder('rate')
      .leftJoinAndSelect('rate.updatedBy', 'updatedBy');

    if (activeOnly) {
      query.andWhere('rate.isActive = :isActive', { isActive: true });
    }

    return query.orderBy('rate.effectiveDate', 'DESC').getMany();
  }

  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate> {
    const rate = await this.exchangeRatesRepository.findOne({
      where: {
        fromCurrency,
        toCurrency,
        isActive: true,
      },
    });

    if (!rate) {
      // Check for inverse rate
      const inverseRate = await this.exchangeRatesRepository.findOne({
        where: {
          fromCurrency: toCurrency,
          toCurrency: fromCurrency,
          isActive: true,
        },
      });

      if (inverseRate) {
        // Return a calculated inverse rate
        return {
          ...inverseRate,
          fromCurrency: fromCurrency,
          toCurrency: toCurrency,
          rate: 1 / inverseRate.rate,
        } as ExchangeRate;
      }

      throw new NotFoundException(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
    }

    return rate;
  }

  async convertCurrency(dto: ConvertCurrencyDto): Promise<{
    originalAmount: number;
    convertedAmount: number;
    rate: number;
    fromCurrency: string;
    toCurrency: string;
  }> {
    if (dto.fromCurrency === dto.toCurrency) {
      return {
        originalAmount: dto.amount,
        convertedAmount: dto.amount,
        rate: 1,
        fromCurrency: dto.fromCurrency,
        toCurrency: dto.toCurrency,
      };
    }

    const exchangeRate = await this.getExchangeRate(dto.fromCurrency, dto.toCurrency);
    const convertedAmount = dto.amount * exchangeRate.rate;

    return {
      originalAmount: dto.amount,
      convertedAmount,
      rate: exchangeRate.rate,
      fromCurrency: dto.fromCurrency,
      toCurrency: dto.toCurrency,
    };
  }

  // Helper methods
  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastInvoice = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .where('invoice.invoiceNumber LIKE :pattern', { pattern: `INV-${year}-%` })
      .orderBy('invoice.createdAt', 'DESC')
      .getOne();

    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop());
      return `INV-${year}-${(lastNumber + 1).toString().padStart(5, '0')}`;
    }

    return `INV-${year}-00001`;
  }

  private async generatePaymentNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const lastPayment = await this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.paymentNumber LIKE :pattern', { pattern: `PAY-${year}-%` })
      .orderBy('payment.createdAt', 'DESC')
      .getOne();

    if (lastPayment) {
      const lastNumber = parseInt(lastPayment.paymentNumber.split('-').pop());
      return `PAY-${year}-${(lastNumber + 1).toString().padStart(5, '0')}`;
    }

    return `PAY-${year}-00001`;
  }
}