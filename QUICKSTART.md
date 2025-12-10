# Siminho - Quick Start Guide

This guide will help you get the Siminho todo application running quickly.

## What You Have

A complete full-stack todo list application with:
- ✅ Angular 20.3.0 frontend
- ✅ NestJS backend with TypeORM
- ✅ PostgreSQL 16 database
- ✅ Docker and Docker Compose setup
- ✅ Kubernetes Helm charts for AWS EKS
- ✅ Development and production configurations

## Choose Your Path

### Path 1: Just Want to Test? (5 minutes)

Run everything with Docker Compose:

```bash
# From the project root
docker-compose up --build

# Wait for all services to start, then visit:
# http://localhost:4200
```

That's it! All services (frontend, backend, database) will be running.

### Path 2: Local Development (10 minutes)

#### Step 1: Start PostgreSQL
```bash
docker run --name siminho-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=siminho_dev -p 5432:5432 -d postgres:16-alpine
```

#### Step 2: Start Backend
```bash
cd backend
npm install
npm run start:dev
# Running on http://localhost:3000
```

#### Step 3: Start Frontend (in new terminal)
```bash
cd frontend
npm install
npm start
# Running on http://localhost:4200
```

### Path 3: Deploy to AWS EKS (30-60 minutes)

#### Prerequisites
- AWS account with EKS cluster
- AWS CLI configured
- kubectl installed
- Helm installed

#### Quick Deploy
```bash
cd infrastructure
chmod +x create-ecr-repos.sh deploy-aws.sh
./create-ecr-repos.sh      # First time only
./deploy-aws.sh            # Follow the prompts
```

## Project Tour

### Test the Application

1. **Open** http://localhost:4200
2. **Add a todo**: Fill in the title, set priority, add description
3. **Create**: Click "Add Todo"
4. **Complete**: Check the checkbox to mark as done
5. **Edit**: Click "Edit" to modify a todo
6. **Delete**: Click "Delete" to remove a todo

### API Endpoints

Test the API directly:

```bash
# Get all todos
curl http://localhost:3000/todos

# Create a todo
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test todo","priority":"high"}'

# Update a todo
curl -X PATCH http://localhost:3000/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a todo
curl -X DELETE http://localhost:3000/todos/{id}
```

## Development Workflow

### Making Changes

**Backend Changes:**
```bash
cd backend
# Edit files in src/
# Changes auto-reload if using npm run start:dev
```

**Frontend Changes:**
```bash
cd frontend
# Edit files in src/
# Changes auto-reload if using npm start
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
# Output in dist/
```

**Frontend:**
```bash
cd frontend
npm run build -- --configuration production
# Output in dist/frontend/browser/
```

## Common Commands

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart a service
docker-compose restart backend

# Stop everything
docker-compose down

# Stop and remove data
docker-compose down -v
```

### Database

```bash
# Connect to PostgreSQL
docker exec -it siminho-postgres psql -U postgres -d siminho_dev

# Common SQL commands:
# \dt                  - List tables
# SELECT * FROM todos; - View all todos
# \q                   - Quit
```

### Kubernetes

```bash
# Check pods
kubectl get pods -n siminho-prod

# View logs
kubectl logs -f deployment/backend -n siminho-prod

# Get service URL
kubectl get svc frontend-service -n siminho-prod

# Port forward for local access
kubectl port-forward svc/frontend-service 8080:80 -n siminho-prod
```

## File Structure Overview

```
siminho/
├── backend/
│   ├── src/
│   │   └── todo/           # Todo module (entity, service, controller)
│   ├── .env.development    # Dev environment
│   ├── .env.production     # Prod environment
│   └── Dockerfile          # Production Docker image
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── models/     # TypeScript interfaces
│   │   │   ├── services/   # API service
│   │   │   └── todo-list/  # Main component
│   │   └── environments/   # Environment configs
│   └── Dockerfile          # Production Docker image
│
├── infrastructure/
│   ├── helm/siminho/       # Kubernetes Helm chart
│   ├── local-setup.sh      # Local dev helper
│   ├── deploy-aws.sh       # AWS deployment script
│   └── create-ecr-repos.sh # ECR setup script
│
├── docker-compose.yml      # Local Docker setup
└── docker-compose.dev.yml  # Dev mode with hot reload
```

## Next Steps

### For Development
1. Add authentication
2. Add user accounts
3. Add multiple todo lists
4. Add categories/tags
5. Add real-time updates

### For Production
1. Set up domain name
2. Configure SSL/TLS
3. Set up monitoring (CloudWatch, Prometheus)
4. Configure backups
5. Set up CI/CD pipeline
6. Add rate limiting
7. Implement caching

### For Learning
1. Explore the NestJS decorators and modules
2. Study TypeORM entity relationships
3. Learn Angular signals and RxJS
4. Understand Docker multi-stage builds
5. Deep dive into Helm templates
6. Study Kubernetes resource management

## Troubleshooting

### Backend won't start
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check environment variables
cat backend/.env.development

# View backend logs
docker-compose logs backend
```

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:3000/todos

# Check environment configuration
cat frontend/src/environments/environment.development.ts

# Verify CORS is enabled in backend
```

### Database connection failed
```bash
# Check PostgreSQL is accessible
docker exec -it siminho-postgres psql -U postgres -d siminho_dev

# Verify credentials in .env files match
```

## Getting Help

1. **Check logs first**: Most issues show up in logs
2. **Review README files**: Each folder has detailed docs
3. **Check environment configs**: Ensure URLs and credentials are correct
4. **Verify services are running**: Use `docker ps` or `kubectl get pods`

## Quick Reference

| Service | Local URL | Docker Port | K8s Service |
|---------|-----------|-------------|-------------|
| Frontend | http://localhost:4200 | 4200:80 | frontend-service |
| Backend | http://localhost:3000 | 3000:3000 | backend-service |
| PostgreSQL | localhost:5432 | 5432:5432 | postgres-service |

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Angular Documentation](https://angular.dev/)
- [TypeORM Documentation](https://typeorm.io/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)

---

**Happy Coding! 🚀**
