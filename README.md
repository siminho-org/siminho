# Siminho - Todo List Application

A full-stack todo list application built with Angular, NestJS, PostgreSQL, Docker, and Kubernetes.

## Project Structure

```
siminho/
├── frontend/              # Angular 20.3.0 application
├── backend/               # NestJS API with TypeORM
├── infrastructure/        # Docker & Kubernetes configurations
│   ├── helm/             # Helm charts for K8s deployment
│   ├── local-setup.sh    # Local development script
│   └── deploy-aws.sh     # AWS EKS deployment script
├── docker-compose.yml     # Full stack Docker Compose
└── README.md
```

## Technology Stack

- **Frontend**: Angular 20.3.0
- **Backend**: NestJS with TypeORM
- **Database**: PostgreSQL 16
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes with Helm
- **Deployment**: AWS EKS (EU-West)
- **Node.js**: 22.17.1

## Features

- ✅ Create, read, update, and delete todo items
- ✅ Mark todos as complete/incomplete
- ✅ Set todo priority (low, medium, high)
- ✅ Set due dates for todos
- ✅ Responsive UI design
- ✅ RESTful API
- ✅ Development and production environments
- ✅ Fully containerized with Docker
- ✅ Kubernetes deployment ready for AWS EKS

## Quick Start

### Option 1: Docker Compose (Recommended for Testing)

The fastest way to run the entire application:

```bash
# Start all services (frontend, backend, database)
docker-compose up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Option 2: Local Development (Without Docker)

#### Prerequisites
- Node.js 22.17.1
- PostgreSQL 16+
- Angular CLI 20.3.0

#### Setup Backend
```bash
cd backend
npm install

# Start PostgreSQL (or use Docker)
docker run --name siminho-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=siminho_dev -p 5432:5432 -d postgres:16-alpine

# Start backend
npm run start:dev
```

#### Setup Frontend
```bash
cd frontend
npm install
npm start

# Access at http://localhost:4200
```

### Option 3: AWS EKS Deployment

For production deployment to AWS EKS:

```bash
cd infrastructure
chmod +x deploy-aws.sh
./deploy-aws.sh
```

See [Infrastructure README](./infrastructure/README.md) for detailed deployment instructions.

## API Documentation

### Endpoints

**Base URL**: `http://localhost:3000`

- `GET /todos` - Get all todos
- `GET /todos/:id` - Get a specific todo
- `POST /todos` - Create a new todo
- `PATCH /todos/:id` - Update a todo
- `DELETE /todos/:id` - Delete a todo

### Todo Object Schema

```json
{
  "id": "uuid",
  "title": "string (required)",
  "description": "string (optional)",
  "completed": "boolean",
  "priority": "low | medium | high",
  "dueDate": "ISO date string (optional)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Example Requests

**Create Todo:**
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "priority": "high",
    "dueDate": "2025-12-15"
  }'
```

**Update Todo:**
```bash
curl -X PATCH http://localhost:3000/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

## Development

### Project Commands

**Backend:**
```bash
cd backend
npm run start:dev    # Start with hot reload
npm run build        # Build for production
npm run test         # Run tests
```

**Frontend:**
```bash
cd frontend
npm start            # Start dev server
npm run build        # Build for production
npm test             # Run tests
```

### Environment Configuration

**Backend** (`.env.development`, `.env.production`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=siminho_dev
PORT=3000
NODE_ENV=development
```

**Frontend** (`src/environments/`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

## Docker Deployment

### Build Images

```bash
# Backend
cd backend
docker build -t siminho-backend:latest .

# Frontend
cd frontend
docker build -t siminho-frontend:latest .
```

### Run with Docker Compose

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Kubernetes Deployment

### Prerequisites
- AWS CLI configured
- kubectl installed
- Helm 3.x installed
- EKS cluster running
- Docker images in ECR

### Deploy to EKS

```bash
# Configure kubectl
aws eks update-kubeconfig --region eu-west-1 --name <cluster-name>

# Deploy with Helm
cd infrastructure/helm

# Development
helm upgrade --install siminho-dev ./siminho \
  --namespace siminho-dev \
  --create-namespace \
  --values ./siminho/values-dev.yaml

# Production
helm upgrade --install siminho-prod ./siminho \
  --namespace siminho-prod \
  --create-namespace \
  --values ./siminho/values-prod.yaml

# Check status
kubectl get pods -n siminho-prod
kubectl get svc -n siminho-prod
```

### Access Application

```bash
# Get LoadBalancer URL
kubectl get svc frontend-service -n siminho-prod -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

## Project Structure Details

### Backend (`/backend`)
```
backend/
├── src/
│   ├── todo/              # Todo module
│   │   ├── dto/           # Data transfer objects
│   │   ├── todo.entity.ts
│   │   ├── todo.service.ts
│   │   ├── todo.controller.ts
│   │   └── todo.module.ts
│   ├── app.module.ts      # Root module
│   └── main.ts            # Entry point
├── .env.development
├── .env.production
├── Dockerfile
└── package.json
```

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/
│   │   ├── models/        # TypeScript interfaces
│   │   ├── services/      # API services
│   │   ├── todo-list/     # Todo component
│   │   ├── app.ts
│   │   └── app.config.ts
│   ├── environments/      # Environment configs
│   └── styles.css
├── Dockerfile
├── nginx.conf
└── package.json
```

### Infrastructure (`/infrastructure`)
```
infrastructure/
├── helm/
│   └── siminho/
│       ├── templates/     # K8s manifests
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── values-dev.yaml
│       └── values-prod.yaml
├── local-setup.sh
├── deploy-aws.sh
└── README.md
```

## Monitoring and Troubleshooting

### View Logs

**Docker:**
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

**Kubernetes:**
```bash
kubectl logs -f deployment/backend -n siminho-prod
kubectl logs -f deployment/frontend -n siminho-prod
```

### Access Database

**Docker:**
```bash
docker exec -it siminho-postgres psql -U postgres -d siminho_dev
```

**Kubernetes:**
```bash
kubectl exec -it deployment/postgres -n siminho-prod -- psql -U postgres -d siminho_prod
```

### Common Issues

1. **Backend can't connect to database**
   - Check if PostgreSQL is running
   - Verify environment variables
   - Check network connectivity

2. **Frontend can't reach backend**
   - Verify backend is running on port 3000
   - Check CORS configuration
   - Verify API URL in environment files

3. **Docker build fails**
   - Clear Docker cache: `docker system prune -a`
   - Check Dockerfile syntax
   - Ensure all dependencies are available

## Testing

### Backend Tests
```bash
cd backend
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
```

### Frontend Tests
```bash
cd frontend
npm test               # Unit tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Security Considerations

- Change default database passwords in production
- Use AWS Secrets Manager for sensitive data
- Enable HTTPS/TLS for production
- Implement rate limiting
- Add authentication when needed
- Use IAM roles for AWS resources
- Keep dependencies updated

## Performance Optimization

- Enable caching for static assets
- Use CDN for frontend distribution
- Implement connection pooling for database
- Add Redis for session management
- Use horizontal pod autoscaling in K8s
- Optimize Docker image sizes

## Future Enhancements

- User authentication and authorization
- Multiple todo lists per user
- Todo sharing and collaboration
- Email notifications
- Mobile app
- Real-time updates with WebSockets
- Advanced filtering and search
- Todo categories and tags

## Documentation

- [Backend README](./backend/README.md) - Backend setup and API details
- [Frontend README](./frontend/README.md) - Frontend development guide
- [Infrastructure README](./infrastructure/README.md) - Deployment guide

## License

MIT

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review logs for error messages

---

**Built with ❤️ using Angular, NestJS, PostgreSQL, Docker, and Kubernetes**


