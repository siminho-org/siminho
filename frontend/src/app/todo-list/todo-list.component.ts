import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { Todo, CreateTodoDto, TodoPriority } from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
})
export class TodoListComponent implements OnInit {
  private todoService = inject(TodoService);
  
  todos: Todo[] = [];
  newTodo: CreateTodoDto = {
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
  };
  editingTodo: Todo | null = null;
  loading = false;
  error: string | null = null;

  TodoPriority = TodoPriority;

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = null;
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos = todos;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load todos. Please check if the backend is running.';
        this.loading = false;
        console.error('Error loading todos:', err);
      },
    });
  }

  createTodo(): void {
    if (!this.newTodo.title.trim()) {
      return;
    }

    this.loading = true;
    this.todoService.createTodo(this.newTodo).subscribe({
      next: (todo) => {
        this.todos.unshift(todo);
        this.resetNewTodo();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to create todo';
        this.loading = false;
        console.error('Error creating todo:', err);
      },
    });
  }

  toggleComplete(todo: Todo): void {
    this.todoService
      .updateTodo(todo.id, { completed: !todo.completed })
      .subscribe({
        next: (updatedTodo) => {
          const index = this.todos.findIndex((t) => t.id === todo.id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
        },
        error: (err) => {
          this.error = 'Failed to update todo';
          console.error('Error updating todo:', err);
        },
      });
  }

  startEdit(todo: Todo): void {
    this.editingTodo = { ...todo };
  }

  cancelEdit(): void {
    this.editingTodo = null;
  }

  saveEdit(): void {
    if (!this.editingTodo || !this.editingTodo.title.trim()) {
      return;
    }

    this.todoService
      .updateTodo(this.editingTodo.id, {
        title: this.editingTodo.title,
        description: this.editingTodo.description,
        priority: this.editingTodo.priority,
        dueDate: this.editingTodo.dueDate,
      })
      .subscribe({
        next: (updatedTodo) => {
          const index = this.todos.findIndex((t) => t.id === updatedTodo.id);
          if (index !== -1) {
            this.todos[index] = updatedTodo;
          }
          this.editingTodo = null;
        },
        error: (err) => {
          this.error = 'Failed to update todo';
          console.error('Error updating todo:', err);
        },
      });
  }

  deleteTodo(id: string): void {
    if (!confirm('Are you sure you want to delete this todo?')) {
      return;
    }

    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.todos = this.todos.filter((t) => t.id !== id);
      },
      error: (err) => {
        this.error = 'Failed to delete todo';
        console.error('Error deleting todo:', err);
      },
    });
  }

  resetNewTodo(): void {
    this.newTodo = {
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
    };
  }

  getPriorityClass(priority: TodoPriority): string {
    switch (priority) {
      case TodoPriority.HIGH:
        return 'priority-high';
      case TodoPriority.MEDIUM:
        return 'priority-medium';
      case TodoPriority.LOW:
        return 'priority-low';
      default:
        return '';
    }
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }
}
