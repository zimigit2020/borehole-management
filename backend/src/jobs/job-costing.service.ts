import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Job } from './job.entity';
import { Invoice, InvoiceItem, Payment } from '../finance/entities/invoice.entity';
import { Expense } from '../finance/entities/expense.entity';
import { InventoryMovement, MovementType } from '../inventory/entities/inventory-movement.entity';
import { PurchaseOrder, PurchaseOrderItem } from '../inventory/entities/purchase-order.entity';
import { JobCostingReport, JobProfitabilityReport, CostTrendReport } from './dto/job-costing.dto';

@Injectable()
export class JobCostingService {
  constructor(
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(InventoryMovement)
    private inventoryMovementRepository: Repository<InventoryMovement>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderItem)
    private purchaseOrderItemRepository: Repository<PurchaseOrderItem>,
  ) {}

  async getJobCostingReport(jobId: string): Promise<JobCostingReport> {
    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['client'],
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    // Get invoices for the job
    const invoices = await this.invoiceRepository.find({
      where: { jobId },
      relations: ['items', 'payments'],
    });

    const invoicedAmount = invoices.reduce((sum, inv) => sum + Number(inv.totalAmount), 0);
    const paidAmount = invoices.reduce((sum, inv) => 
      sum + inv.payments.reduce((pSum, payment) => pSum + Number(payment.amount), 0), 0
    );

    // Get expenses for the job
    const expenses = await this.expenseRepository.find({
      where: { jobId },
    });

    const expensesByCategory = this.groupExpensesByCategory(expenses);

    // Get inventory movements for the job
    const inventoryMovements = await this.inventoryMovementRepository.find({
      where: { jobId },
    });

    const materialsCost = inventoryMovements
      .filter(m => m.type === MovementType.JOB_ALLOCATION || m.type === MovementType.USAGE)
      .reduce((sum, m) => sum + Number(m.totalCost || 0), 0);

    // Get purchase orders for the job
    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: { jobId },
      relations: ['items'],
    });

    const purchaseOrderCost = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);

    // Calculate costs by category
    const laborCost = expensesByCategory['labor'] || 0;
    const equipmentCost = expensesByCategory['equipment'] || 0;
    const transportCost = expensesByCategory['transport'] || 0;
    const overheadCost = this.calculateOverhead(job, expenses);
    const otherCosts = this.calculateOtherCosts(expenses, expensesByCategory);

    const totalCosts = materialsCost + laborCost + equipmentCost + transportCost + overheadCost + otherCosts;
    const grossProfit = invoicedAmount - totalCosts;
    const profitMargin = invoicedAmount > 0 ? (grossProfit / invoicedAmount) * 100 : 0;

    // Create cost breakdown
    const costBreakdown = [
      {
        category: 'Materials',
        amount: materialsCost,
        percentage: totalCosts > 0 ? (materialsCost / totalCosts) * 100 : 0,
        itemCount: inventoryMovements.length,
        details: inventoryMovements.slice(0, 10),
      },
      {
        category: 'Labor',
        amount: laborCost,
        percentage: totalCosts > 0 ? (laborCost / totalCosts) * 100 : 0,
        itemCount: expenses.filter(e => e.category === 'labor').length,
        details: expenses.filter(e => e.category === 'labor').slice(0, 10),
      },
      {
        category: 'Equipment',
        amount: equipmentCost,
        percentage: totalCosts > 0 ? (equipmentCost / totalCosts) * 100 : 0,
        itemCount: expenses.filter(e => e.category === 'equipment').length,
        details: expenses.filter(e => e.category === 'equipment').slice(0, 10),
      },
      {
        category: 'Transport',
        amount: transportCost,
        percentage: totalCosts > 0 ? (transportCost / totalCosts) * 100 : 0,
        itemCount: expenses.filter(e => e.category === 'transport').length,
        details: expenses.filter(e => e.category === 'transport').slice(0, 10),
      },
      {
        category: 'Overhead',
        amount: overheadCost,
        percentage: totalCosts > 0 ? (overheadCost / totalCosts) * 100 : 0,
        itemCount: 0,
        details: [],
      },
      {
        category: 'Other',
        amount: otherCosts,
        percentage: totalCosts > 0 ? (otherCosts / totalCosts) * 100 : 0,
        itemCount: expenses.filter(e => !['labor', 'equipment', 'transport'].includes(e.category)).length,
        details: expenses.filter(e => !['labor', 'equipment', 'transport'].includes(e.category)).slice(0, 10),
      },
    ].filter(item => item.amount > 0);

    // Create timeline of costs
    const timeline = this.createCostTimeline(expenses, inventoryMovements, purchaseOrders);

    return {
      jobId: job.id,
      jobNumber: job.jobNumber,
      clientName: job.client?.name || 'Unknown',
      siteName: job.siteName,
      status: job.status,
      startDate: job.createdAt,
      completedDate: job.completedAt,
      quotedAmount: Number(job.quotedAmount || 0),
      invoicedAmount,
      paidAmount,
      totalCosts,
      grossProfit,
      profitMargin,
      costBreakdown,
      materialsCost,
      laborCost,
      equipmentCost,
      transportCost,
      overheadCost,
      otherCosts,
      inventoryItems: inventoryMovements.slice(0, 20),
      expenses: expenses.slice(0, 20),
      purchaseOrders: purchaseOrders.slice(0, 10),
      timeline,
    };
  }

  async getJobProfitabilityReport(filters?: {
    startDate?: Date;
    endDate?: Date;
    clientId?: string;
    status?: string;
  }): Promise<JobProfitabilityReport> {
    const query = this.jobRepository.createQueryBuilder('job')
      .leftJoinAndSelect('job.client', 'client');

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('job.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.clientId) {
      query.andWhere('job.clientId = :clientId', { clientId: filters.clientId });
    }

    if (filters?.status) {
      query.andWhere('job.status = :status', { status: filters.status });
    }

    const jobs = await query.getMany();
    const jobReports = [];

    let totalRevenue = 0;
    let totalCosts = 0;
    let profitableJobs = 0;
    let lossJobs = 0;
    let breakEvenJobs = 0;
    let bestPerformingJob = null;
    let worstPerformingJob = null;
    let bestProfitMargin = -100;
    let worstProfitMargin = 100;

    for (const job of jobs) {
      try {
        const report = await this.getJobCostingReport(job.id);
        
        totalRevenue += report.invoicedAmount;
        totalCosts += report.totalCosts;

        if (report.grossProfit > 0) {
          profitableJobs++;
        } else if (report.grossProfit < 0) {
          lossJobs++;
        } else {
          breakEvenJobs++;
        }

        if (report.profitMargin > bestProfitMargin) {
          bestProfitMargin = report.profitMargin;
          bestPerformingJob = {
            jobId: job.id,
            jobNumber: job.jobNumber,
            clientName: report.clientName,
            profitMargin: report.profitMargin,
            grossProfit: report.grossProfit,
          };
        }

        if (report.profitMargin < worstProfitMargin) {
          worstProfitMargin = report.profitMargin;
          worstPerformingJob = {
            jobId: job.id,
            jobNumber: job.jobNumber,
            clientName: report.clientName,
            profitMargin: report.profitMargin,
            grossProfit: report.grossProfit,
          };
        }

        jobReports.push({
          jobId: job.id,
          jobNumber: job.jobNumber,
          clientName: report.clientName,
          siteName: job.siteName,
          status: job.status,
          revenue: report.invoicedAmount,
          costs: report.totalCosts,
          profit: report.grossProfit,
          profitMargin: report.profitMargin,
          startDate: job.createdAt,
          completedDate: job.completedAt,
        });
      } catch (error) {
        // Skip jobs that have errors in costing calculation
        console.error(`Error calculating costs for job ${job.id}:`, error);
      }
    }

    const totalProfit = totalRevenue - totalCosts;
    const averageProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      totalJobs: jobs.length,
      profitableJobs,
      lossJobs,
      breakEvenJobs,
      totalRevenue,
      totalCosts,
      totalProfit,
      averageProfitMargin,
      bestPerformingJob,
      worstPerformingJob,
      jobsList: jobReports.sort((a, b) => b.profitMargin - a.profitMargin),
    };
  }

  async getCostTrendReport(
    period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    startDate: Date,
    endDate: Date,
  ): Promise<CostTrendReport[]> {
    const expenses = await this.expenseRepository.find({
      where: {
        expenseDate: Between(startDate, endDate),
      },
    });

    const inventoryMovements = await this.inventoryMovementRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
        type: In([MovementType.JOB_ALLOCATION, MovementType.USAGE]),
      },
    });

    const purchaseOrders = await this.purchaseOrderRepository.find({
      where: {
        orderDate: Between(startDate, endDate),
      },
    });

    // Group data by period
    const trends = new Map<string, CostTrendReport>();

    // Process expenses
    for (const expense of expenses) {
      const periodKey = this.getPeriodKey(expense.expenseDate, period);
      const trend = trends.get(periodKey) || this.createEmptyTrend(periodKey);

      const amount = Number(expense.amountInUSD || expense.amount);
      trend.totalCosts += amount;

      switch (expense.category) {
        case 'labor':
          trend.laborCost += amount;
          break;
        case 'equipment':
          trend.equipmentCost += amount;
          break;
        case 'transport':
          trend.transportCost += amount;
          break;
        case 'utilities':
        case 'office_supplies':
        case 'insurance':
          trend.overheadCost += amount;
          break;
        default:
          trend.materialsCost += amount;
      }

      trends.set(periodKey, trend);
    }

    // Process inventory movements
    for (const movement of inventoryMovements) {
      const periodKey = this.getPeriodKey(movement.createdAt, period);
      const trend = trends.get(periodKey) || this.createEmptyTrend(periodKey);
      
      const amount = Number(movement.totalCost || 0);
      trend.totalCosts += amount;
      trend.materialsCost += amount;
      
      trends.set(periodKey, trend);
    }

    // Count jobs per period
    const jobs = await this.jobRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    for (const job of jobs) {
      const periodKey = this.getPeriodKey(job.createdAt, period);
      const trend = trends.get(periodKey) || this.createEmptyTrend(periodKey);
      trend.jobCount++;
      trends.set(periodKey, trend);
    }

    // Calculate averages
    const result = Array.from(trends.values()).map(trend => ({
      ...trend,
      averageCostPerJob: trend.jobCount > 0 ? trend.totalCosts / trend.jobCount : 0,
    }));

    return result.sort((a, b) => a.period.localeCompare(b.period));
  }

  async getJobCostComparison(jobIds: string[]): Promise<any> {
    const reports = [];

    for (const jobId of jobIds) {
      try {
        const report = await this.getJobCostingReport(jobId);
        reports.push({
          jobId,
          jobNumber: report.jobNumber,
          clientName: report.clientName,
          totalCosts: report.totalCosts,
          revenue: report.invoicedAmount,
          profit: report.grossProfit,
          profitMargin: report.profitMargin,
          materialsCost: report.materialsCost,
          laborCost: report.laborCost,
          equipmentCost: report.equipmentCost,
          transportCost: report.transportCost,
          overheadCost: report.overheadCost,
        });
      } catch (error) {
        console.error(`Error getting report for job ${jobId}:`, error);
      }
    }

    // Calculate averages
    const averages = {
      totalCosts: 0,
      revenue: 0,
      profit: 0,
      profitMargin: 0,
      materialsCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      transportCost: 0,
      overheadCost: 0,
    };

    if (reports.length > 0) {
      for (const report of reports) {
        averages.totalCosts += report.totalCosts;
        averages.revenue += report.revenue;
        averages.profit += report.profit;
        averages.profitMargin += report.profitMargin;
        averages.materialsCost += report.materialsCost;
        averages.laborCost += report.laborCost;
        averages.equipmentCost += report.equipmentCost;
        averages.transportCost += report.transportCost;
        averages.overheadCost += report.overheadCost;
      }

      Object.keys(averages).forEach(key => {
        averages[key] = averages[key] / reports.length;
      });
    }

    return {
      jobs: reports,
      averages,
      comparison: {
        mostProfitable: reports.reduce((a, b) => a.profitMargin > b.profitMargin ? a : b, reports[0]),
        leastProfitable: reports.reduce((a, b) => a.profitMargin < b.profitMargin ? a : b, reports[0]),
        highestCost: reports.reduce((a, b) => a.totalCosts > b.totalCosts ? a : b, reports[0]),
        lowestCost: reports.reduce((a, b) => a.totalCosts < b.totalCosts ? a : b, reports[0]),
      },
    };
  }

  async getClientProfitability(clientId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const query = this.jobRepository.createQueryBuilder('job')
      .where('job.clientId = :clientId', { clientId });

    if (startDate && endDate) {
      query.andWhere('job.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const jobs = await query.getMany();
    const jobReports = [];
    let totalRevenue = 0;
    let totalCosts = 0;
    let totalJobs = jobs.length;
    let completedJobs = 0;

    for (const job of jobs) {
      try {
        const report = await this.getJobCostingReport(job.id);
        jobReports.push(report);
        totalRevenue += report.invoicedAmount;
        totalCosts += report.totalCosts;
        if (job.status === 'completed') {
          completedJobs++;
        }
      } catch (error) {
        console.error(`Error calculating costs for job ${job.id}:`, error);
      }
    }

    const totalProfit = totalRevenue - totalCosts;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    return {
      clientId,
      totalJobs,
      completedJobs,
      totalRevenue,
      totalCosts,
      totalProfit,
      profitMargin,
      averageJobValue: totalJobs > 0 ? totalRevenue / totalJobs : 0,
      averageJobCost: totalJobs > 0 ? totalCosts / totalJobs : 0,
      averageJobProfit: totalJobs > 0 ? totalProfit / totalJobs : 0,
      jobs: jobReports.map(r => ({
        jobId: r.jobId,
        jobNumber: r.jobNumber,
        revenue: r.invoicedAmount,
        costs: r.totalCosts,
        profit: r.grossProfit,
        profitMargin: r.profitMargin,
      })),
    };
  }

  private groupExpensesByCategory(expenses: Expense[]): Record<string, number> {
    const grouped: Record<string, number> = {};
    
    for (const expense of expenses) {
      if (!grouped[expense.category]) {
        grouped[expense.category] = 0;
      }
      grouped[expense.category] += Number(expense.amountInUSD || expense.amount);
    }
    
    return grouped;
  }

  private calculateOverhead(job: Job, expenses: Expense[]): number {
    const overheadCategories = ['utilities', 'office_supplies', 'insurance', 'permits', 'professional_fees'];
    return expenses
      .filter(e => overheadCategories.includes(e.category))
      .reduce((sum, e) => sum + Number(e.amountInUSD || e.amount), 0);
  }

  private calculateOtherCosts(expenses: Expense[], categorizedCosts: Record<string, number>): number {
    const mainCategories = ['labor', 'equipment', 'transport', 'utilities', 'office_supplies', 'insurance', 'permits', 'professional_fees'];
    return expenses
      .filter(e => !mainCategories.includes(e.category))
      .reduce((sum, e) => sum + Number(e.amountInUSD || e.amount), 0);
  }

  private createCostTimeline(
    expenses: Expense[],
    inventoryMovements: InventoryMovement[],
    purchaseOrders: PurchaseOrder[],
  ): any[] {
    const timeline = [];

    // Add expenses to timeline
    for (const expense of expenses) {
      timeline.push({
        date: expense.expenseDate,
        type: 'expense',
        category: expense.category,
        description: expense.description,
        amount: Number(expense.amountInUSD || expense.amount),
        reference: expense.id,
      });
    }

    // Add inventory movements to timeline
    for (const movement of inventoryMovements) {
      if (movement.type === MovementType.JOB_ALLOCATION || movement.type === MovementType.USAGE) {
        timeline.push({
          date: movement.createdAt,
          type: 'material',
          category: 'inventory',
          description: `${movement.type}: ${movement.reason || ''}`,
          amount: Number(movement.totalCost || 0),
          reference: movement.id,
        });
      }
    }

    // Add purchase orders to timeline
    for (const po of purchaseOrders) {
      timeline.push({
        date: po.orderDate,
        type: 'purchase_order',
        category: 'procurement',
        description: `PO ${po.orderNumber} - ${po.supplier}`,
        amount: Number(po.totalAmount),
        reference: po.id,
      });
    }

    // Sort by date
    timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return timeline.slice(0, 50); // Return last 50 entries
  }

  private getPeriodKey(date: Date, period: 'daily' | 'weekly' | 'monthly'): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    switch (period) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'weekly':
        const weekNumber = this.getWeekNumber(d);
        return `${year}-W${String(weekNumber).padStart(2, '0')}`;
      case 'monthly':
        return `${year}-${month}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  private createEmptyTrend(period: string): CostTrendReport {
    return {
      period,
      totalCosts: 0,
      materialsCost: 0,
      laborCost: 0,
      equipmentCost: 0,
      transportCost: 0,
      overheadCost: 0,
      jobCount: 0,
      averageCostPerJob: 0,
    };
  }
}