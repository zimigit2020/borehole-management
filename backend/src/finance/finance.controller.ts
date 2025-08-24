import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FinanceService } from './finance.service';
import { CreateInvoiceDto, UpdateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateExchangeRateDto, UpdateExchangeRateDto, ConvertCurrencyDto } from './dto/exchange-rate.dto';
import { CreateExpenseDto, UpdateExpenseDto, ApproveExpenseDto, RejectExpenseDto, RecordReimbursementDto } from './dto/expense.dto';
import { InvoiceStatus } from './entities/invoice.entity';
import { ExpenseStatus } from './entities/expense.entity';

@ApiTags('finance')
@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // Invoice endpoints
  @Post('invoices')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create new invoice' })
  async createInvoice(@Body() dto: CreateInvoiceDto, @Request() req) {
    return this.financeService.createInvoice(dto, req.user);
  }

  @Get('invoices/overdue')
  @ApiOperation({ summary: 'Get overdue invoices' })
  async getOverdueInvoices() {
    return this.financeService.getOverdueInvoices();
  }

  @Get('invoices/:id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOneInvoice(@Param('id') id: string) {
    return this.financeService.findOneInvoice(id);
  }

  @Get('invoices')
  @ApiOperation({ summary: 'Get all invoices' })
  async findAllInvoices(
    @Query('status') status?: InvoiceStatus,
    @Query('jobId') jobId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.findAllInvoices({
      status,
      jobId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  @Put('invoices/:id')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update invoice' })
  async updateInvoice(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.financeService.updateInvoice(id, dto);
  }

  @Delete('invoices/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete invoice' })
  async deleteInvoice(@Param('id') id: string) {
    await this.financeService.deleteInvoice(id);
    return { message: 'Invoice deleted successfully' };
  }

  @Post('invoices/:id/send')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Send invoice to client' })
  async sendInvoice(@Param('id') id: string) {
    return this.financeService.sendInvoice(id);
  }

  @Post('invoices/:id/cancel')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Cancel invoice' })
  async cancelInvoice(@Param('id') id: string, @Body() body: { reason: string }) {
    return this.financeService.cancelInvoice(id, body.reason);
  }

  // Payment endpoints
  @Post('payments')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Record payment' })
  async recordPayment(@Body() dto: CreatePaymentDto, @Request() req) {
    return this.financeService.recordPayment(dto, req.user);
  }

  @Post('payments/:id/verify')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Verify payment' })
  async verifyPayment(@Param('id') id: string, @Request() req) {
    return this.financeService.verifyPayment(id, req.user);
  }

  @Get('payments')
  @ApiOperation({ summary: 'Get payments' })
  async getPayments(
    @Query('invoiceId') invoiceId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financeService.getPayments({
      invoiceId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  // Reports
  @Get('reports/summary')
  @ApiOperation({ summary: 'Get financial summary' })
  async getFinancialSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getFinancialSummary(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('reports/revenue/:year')
  @ApiOperation({ summary: 'Get revenue by month' })
  async getRevenueByMonth(@Param('year') year: string) {
    return this.financeService.getRevenueByMonth(parseInt(year));
  }

  @Post('maintenance/update-overdue')
  @Roles('admin')
  @ApiOperation({ summary: 'Update overdue invoice statuses' })
  async updateOverdueStatuses() {
    await this.financeService.updateOverdueStatuses();
    return { message: 'Overdue statuses updated' };
  }

  // Exchange Rate endpoints
  @Post('exchange-rates')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Create or update exchange rate' })
  async createExchangeRate(@Body() dto: CreateExchangeRateDto, @Request() req) {
    return this.financeService.createExchangeRate(dto, req.user);
  }

  @Put('exchange-rates/:from/:to')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Update exchange rate' })
  async updateExchangeRate(
    @Param('from') from: string,
    @Param('to') to: string,
    @Body() dto: UpdateExchangeRateDto,
    @Request() req,
  ) {
    return this.financeService.updateExchangeRate(from, to, dto, req.user);
  }

  @Get('exchange-rates')
  @ApiOperation({ summary: 'Get all exchange rates' })
  async getExchangeRates(@Query('activeOnly') activeOnly: boolean = true) {
    return this.financeService.getExchangeRates(activeOnly);
  }

  @Get('exchange-rates/:from/:to')
  @ApiOperation({ summary: 'Get specific exchange rate' })
  async getExchangeRate(@Param('from') from: string, @Param('to') to: string) {
    return this.financeService.getExchangeRate(from, to);
  }

  @Post('exchange-rates/convert')
  @ApiOperation({ summary: 'Convert currency' })
  async convertCurrency(@Body() dto: ConvertCurrencyDto) {
    return this.financeService.convertCurrency(dto);
  }

  // Expense endpoints
  @Post('expenses')
  @ApiOperation({ summary: 'Create new expense' })
  async createExpense(@Body() dto: CreateExpenseDto, @Request() req) {
    return this.financeService.createExpense(dto, req.user);
  }

  @Get('expenses')
  @ApiOperation({ summary: 'Get expenses' })
  async getExpenses(
    @Query('status') status?: ExpenseStatus,
    @Query('category') category?: string,
    @Query('jobId') jobId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('submittedById') submittedById?: string,
  ) {
    return this.financeService.getExpenses({
      status,
      category,
      jobId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      submittedById,
    });
  }

  @Get('expenses/summary')
  @ApiOperation({ summary: 'Get expense summary' })
  async getExpenseSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.financeService.getExpenseSummary(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('expenses/:id')
  @ApiOperation({ summary: 'Get expense by ID' })
  async getExpense(@Param('id') id: string) {
    return this.financeService.getExpenseById(id);
  }

  @Put('expenses/:id')
  @ApiOperation({ summary: 'Update expense' })
  async updateExpense(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.financeService.updateExpense(id, dto);
  }

  @Post('expenses/:id/approve')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Approve expense' })
  async approveExpense(@Param('id') id: string, @Body() dto: ApproveExpenseDto, @Request() req) {
    return this.financeService.approveExpense(id, dto, req.user);
  }

  @Post('expenses/:id/reject')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Reject expense' })
  async rejectExpense(@Param('id') id: string, @Body() dto: RejectExpenseDto, @Request() req) {
    return this.financeService.rejectExpense(id, dto, req.user);
  }

  @Post('expenses/:id/reimburse')
  @Roles('admin', 'manager')
  @ApiOperation({ summary: 'Record expense reimbursement' })
  async recordReimbursement(@Param('id') id: string, @Body() dto: RecordReimbursementDto) {
    return this.financeService.recordReimbursement(id, dto);
  }

  @Delete('expenses/:id')
  @ApiOperation({ summary: 'Delete expense' })
  async deleteExpense(@Param('id') id: string) {
    await this.financeService.deleteExpense(id);
    return { message: 'Expense deleted successfully' };
  }
}