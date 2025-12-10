# Siminho Frontend

Angular frontend application for the Siminho todo list.

## Technology Stack

- Angular 20.3.0
- TypeScript
- RxJS
- Angular HttpClient

## Features

- Create, read, update, and delete todos
- Mark todos as complete/incomplete
- Set todo priority (low, medium, high)
- Set due dates
- Responsive design
- Real-time updates

## Local Development

### Prerequisites

- Node.js 22.17.1
- npm 11.6.2
- Angular CLI 20.3.0

### Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the backend is running on `http://localhost:3000`

3. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:4200`

## Building

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build -- --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## Environment Configuration

The application uses environment files for configuration:

- `src/environments/environment.development.ts` - Development environment
- `src/environments/environment.ts` - Production environment

Configure the backend API URL in these files:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Project Structure

```
src/
├── app/
│   ├── models/          # Data models and interfaces
│   ├── services/        # API services
│   ├── todo-list/       # Todo list component
│   ├── app.ts           # Root component
│   └── app.config.ts    # App configuration
├── environments/        # Environment configurations
└── styles.css          # Global styles
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build the project
- `npm test` - Run unit tests
- `npm run lint` - Lint the code
