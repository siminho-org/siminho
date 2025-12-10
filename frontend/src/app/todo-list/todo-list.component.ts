import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../services/todo.service';
import { Todo, CreateTodoDto, TodoPriority } from '../models/todo.model';

@Component({
  selector: 'app-todo-list',
  imports: [FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrl: './todo-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoListComponent implements OnInit {
  private readonly todoService = inject(TodoService);

  protected readonly todos = signal<Todo[]>([]);
  protected readonly newTodo = signal<CreateTodoDto>({
    title: '',
    description: '',
    priority: TodoPriority.MEDIUM,
  });
  protected readonly editingTodo = signal<Todo | null>(null);
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly TodoPriority = TodoPriority;
  protected readonly todosCount = computed(() => this.todos().length);

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading.set(true);
    this.error.set(null);
    this.todoService.getTodos().subscribe({
      next: (todos) => {
        this.todos.set(todos);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load todos. Please check if the backend is running.');
        this.loading.set(false);
        console.error('Error loading todos:', err);
      },
    });
  }

  createTodo(): void {
    const todo = this.newTodo();
    if (!todo.title.trim()) {
      return;
    }

    this.loading.set(true);
    this.todoService.createTodo(todo).subscribe({
      next: (newTodo) => {
        this.todos.update(todos => [newTodo, ...todos]);
        this.resetNewTodo();
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to create todo');
        this.loading.set(false);
        console.error('Error creating todo:', err);
      },
    });
  }
  toggleComplete(todo: Todo): void {
    this.todoService
      .updateTodo(todo.id, { completed: !todo.completed })
      .subscribe({
        next: (updatedTodo) => {
          this.todos.update(todos =>
            todos.map(t => t.id === todo.id ? updatedTodo : t)
          );
        },
        error: (err) => {
          this.error.set('Failed to update todo');
          console.error('Error updating todo:', err);
        },
      });
  }

  startEdit(todo: Todo): void {
    this.editingTodo.set({ ...todo });
  }

  cancelEdit(): void {
    this.editingTodo.set(null);
  }

  saveEdit(): void {
    const editing = this.editingTodo();
    if (!editing || !editing.title.trim()) {
      return;
    }

    this.todoService
      .updateTodo(editing.id, {
        title: editing.title,
        description: editing.description,
        priority: editing.priority,
        dueDate: editing.dueDate,
      })
      .subscribe({
        next: (updatedTodo) => {
          this.todos.update(todos =>
            todos.map(t => t.id === updatedTodo.id ? updatedTodo : t)
          );
          this.editingTodo.set(null);
        },
        error: (err) => {
          this.error.set('Failed to update todo');
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
        this.todos.update(todos => todos.filter(t => t.id !== id));
      },
      error: (err) => {
        this.error.set('Failed to delete todo');
        console.error('Error deleting todo:', err);
      },
    });
  }

  resetNewTodo(): void {
    this.newTodo.set({
      title: '',
      description: '',
      priority: TodoPriority.MEDIUM,
    });
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
