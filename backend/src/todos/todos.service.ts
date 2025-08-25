import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from '../users/user.entity';

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todosRepository: Repository<Todo>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User): Promise<Todo> {
    const todo = this.todosRepository.create({
      ...createTodoDto,
      createdBy: user,
    });
    return await this.todosRepository.save(todo);
  }

  async findAll(user: User): Promise<Todo[]> {
    const query = this.todosRepository.createQueryBuilder('todo')
      .leftJoinAndSelect('todo.assignedTo', 'assignedTo')
      .leftJoinAndSelect('todo.createdBy', 'createdBy')
      .leftJoinAndSelect('todo.job', 'job')
      .where('todo.createdById = :userId OR todo.assignedToId = :userId', { userId: user.id })
      .orderBy('todo.dueDate', 'ASC', 'NULLS LAST')
      .addOrderBy('todo.priority', 'DESC')
      .addOrderBy('todo.createdAt', 'DESC');

    return await query.getMany();
  }

  async findByJob(jobId: string, user: User): Promise<Todo[]> {
    return await this.todosRepository.find({
      where: { job: { id: jobId } },
      relations: ['assignedTo', 'createdBy', 'job'],
      order: {
        dueDate: 'ASC',
        priority: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string, user: User): Promise<Todo> {
    const todo = await this.todosRepository.findOne({
      where: { id },
      relations: ['assignedTo', 'createdBy', 'job'],
    });

    if (!todo) {
      throw new NotFoundException(`Todo with ID ${id} not found`);
    }

    // Check if user has access to this todo
    if (todo.createdBy.id !== user.id && 
        todo.assignedTo?.id !== user.id && 
        user.role !== 'admin' && 
        user.role !== 'manager') {
      throw new ForbiddenException('You do not have access to this todo');
    }

    return todo;
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, user: User): Promise<Todo> {
    const todo = await this.findOne(id, user);

    // Check if user can update this todo
    if (todo.createdBy.id !== user.id && 
        user.role !== 'admin' && 
        user.role !== 'manager') {
      throw new ForbiddenException('You can only update your own todos');
    }

    // If status is being changed to completed, set completedAt
    if (updateTodoDto.status === 'completed' && todo.status !== 'completed') {
      updateTodoDto.completedAt = new Date();
    } else if (updateTodoDto.status !== 'completed' && todo.status === 'completed') {
      updateTodoDto.completedAt = null;
    }

    Object.assign(todo, updateTodoDto);
    return await this.todosRepository.save(todo);
  }

  async remove(id: string, user: User): Promise<void> {
    const todo = await this.findOne(id, user);

    // Check if user can delete this todo
    if (todo.createdBy.id !== user.id && 
        user.role !== 'admin' && 
        user.role !== 'manager') {
      throw new ForbiddenException('You can only delete your own todos');
    }

    await this.todosRepository.remove(todo);
  }

  async getStats(user: User): Promise<any> {
    const todos = await this.findAll(user);
    
    const stats = {
      total: todos.length,
      pending: todos.filter(t => t.status === 'pending').length,
      inProgress: todos.filter(t => t.status === 'in_progress').length,
      completed: todos.filter(t => t.status === 'completed').length,
      overdue: todos.filter(t => 
        t.status !== 'completed' && 
        t.dueDate && 
        new Date(t.dueDate) < new Date()
      ).length,
      highPriority: todos.filter(t => 
        t.priority === 'high' && 
        t.status !== 'completed'
      ).length,
    };

    return stats;
  }

  async markAsComplete(id: string, user: User): Promise<Todo> {
    const todo = await this.findOne(id, user);
    todo.status = 'completed';
    todo.completedAt = new Date();
    return await this.todosRepository.save(todo);
  }

  async assignTo(id: string, assignToId: string, user: User): Promise<Todo> {
    const todo = await this.findOne(id, user);

    // Only managers and admins can assign todos
    if (user.role !== 'admin' && user.role !== 'manager') {
      throw new ForbiddenException('Only managers and admins can assign todos');
    }

    todo.assignedTo = { id: assignToId } as User;
    return await this.todosRepository.save(todo);
  }
}