# Siminho Backend

NestJS backend API for the Siminho todo list application.

## Technology Stack

- NestJS
- TypeORM
- PostgreSQL
- Node.js 22.17.1

## Features

- RESTful API for todo CRUD operations
- TypeORM for database management
- Environment-based configuration
- Input validation with class-validator
- CORS enabled for frontend communication

## API Endpoints

### Todos

- `GET /todos` - Get all todos
- `GET /todos/:id` - Get a specific todo
- `POST /todos` - Create a new todo
- `PATCH /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### Todo Schema

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string (optional)",
  "completed": "boolean",
  "priority": "low | medium | high",
  "dueDate": "ISO date string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Local Development

### Prerequisites

- Node.js 22.17.1
- PostgreSQL 16+ (or use Docker)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.development` file (already created):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=siminho_dev
PORT=3000
NODE_ENV=development
```

3. Start PostgreSQL (if using Docker):
```bash
docker run --name siminho-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=siminho_dev -p 5432:5432 -d postgres:latest
```

4. Run the application:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Building for Production

```bash
npm run build
```

## Environment Variables

- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:4200)
