import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    return this.todosService.create(createTodoDto, req.user);
  }

  @Get()
  findAll(@Request() req) {
    return this.todosService.findAll(req.user);
  }

  @Get('stats')
  getStats(@Request() req) {
    return this.todosService.getStats(req.user);
  }

  @Get('job/:jobId')
  findByJob(@Param('jobId') jobId: string, @Request() req) {
    return this.todosService.findByJob(jobId, req.user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.todosService.findOne(id, req.user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @Request() req,
  ) {
    return this.todosService.update(id, updateTodoDto, req.user);
  }

  @Patch(':id/complete')
  markAsComplete(@Param('id') id: string, @Request() req) {
    return this.todosService.markAsComplete(id, req.user);
  }

  @Patch(':id/assign/:userId')
  assignTo(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Request() req,
  ) {
    return this.todosService.assignTo(id, userId, req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.todosService.remove(id, req.user);
  }
}