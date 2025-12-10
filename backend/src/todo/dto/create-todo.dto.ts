import { IsString, IsOptional, IsEnum, IsBoolean, IsDateString } from 'class-validator';
import { TodoPriority } from '../todo.entity';

export class CreateTodoDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsEnum(TodoPriority)
  priority?: TodoPriority;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
