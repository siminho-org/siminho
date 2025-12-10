# Siminho Infrastructure

Docker and Kubernetes infrastructure for the Siminho todo list application.

## Contents

- Docker Compose files for local development
- Helm charts for Kubernetes deployment
- Deployment scripts and documentation

## Docker Compose

### Local Development with Docker Compose

The easiest way to run the entire application locally:

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (will delete database data)
docker-compose down -v
```

**Services:**
- PostgreSQL: `http://localhost:5432`
- Backend API: `http://localhost:3000`
- Frontend: `http://localhost:4200`

### Development Mode

For backend development with hot reload:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This mounts the backend source code for live reloading.

## Kubernetes Deployment with Helm

### Prerequisites

- AWS CLI configured with appropriate credentials
- kubectl installed and configured
- Helm 3.x installed
- Docker images built and pushed to a container registry (ECR, Docker Hub, etc.)

### Building and Pushing Docker Images

#### For AWS ECR:

```bash
# Login to ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-1.amazonaws.com

# Create ECR repositories (first time only)
aws ecr create-repository --repository-name siminho-backend --region eu-west-1
aws ecr create-repository --repository-name siminho-frontend --region eu-west-1

# Build and tag backend
cd backend
docker build -t siminho-backend:latest .
docker tag siminho-backend:latest <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-backend:latest
docker push <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-backend:latest

# Build and tag frontend
cd ../frontend
docker build -t siminho-frontend:latest .
docker tag siminho-frontend:latest <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-frontend:latest
docker push <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-frontend:latest
```

### Update Helm Values

Update the image repositories in `helm/siminho/values.yaml`:

```yaml
backend:
  image:
    repository: <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-backend
    tag: latest

frontend:
  image:
    repository: <account-id>.dkr.ecr.eu-west-1.amazonaws.com/siminho-frontend
    tag: latest
```

### Deploy to AWS EKS

#### Configure kubectl for EKS

```bash
aws eks update-kubeconfig --region eu-west-1 --name <your-cluster-name>
```

#### Install the Application

**Development Environment:**

```bash
cd infrastructure/helm

# Install or upgrade
helm upgrade --install siminho-dev ./siminho \
  --namespace siminho-dev \
  --create-namespace \
  --values ./siminho/values-dev.yaml
```

**Production Environment:**

```bash
cd infrastructure/helm

# Install or upgrade
helm upgrade --install siminho-prod ./siminho \
  --namespace siminho-prod \
  --create-namespace \
  --values ./siminho/values-prod.yaml
```

#### Verify Deployment

```bash
# Check pods
kubectl get pods -n siminho-prod

# Check services
kubectl get svc -n siminho-prod

# Get frontend LoadBalancer URL
kubectl get svc frontend-service -n siminho-prod -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# View logs
kubectl logs -f deployment/backend -n siminho-prod
kubectl logs -f deployment/frontend -n siminho-prod
```

### Uninstall

```bash
# Development
helm uninstall siminho-dev -n siminho-dev

# Production
helm uninstall siminho-prod -n siminho-prod
```

## Helm Chart Configuration

The Helm chart supports customization through values files:

- `values.yaml` - Default/base configuration
- `values-dev.yaml` - Development environment overrides
- `values-prod.yaml` - Production environment overrides

### Key Configuration Options

**PostgreSQL:**
- `postgresql.enabled` - Enable/disable PostgreSQL deployment
- `postgresql.persistence.size` - Storage size
- `postgresql.auth.password` - Database password

**Backend:**
- `backend.replicaCount` - Number of backend replicas
- `backend.resources` - CPU and memory limits
- `backend.env` - Environment variables

**Frontend:**
- `frontend.replicaCount` - Number of frontend replicas
- `frontend.service.type` - Service type (LoadBalancer, ClusterIP, NodePort)
- `frontend.resources` - CPU and memory limits

**Ingress:**
- `ingress.enabled` - Enable/disable ingress
- `ingress.hosts` - Domain configuration
- `ingress.tls` - TLS/SSL configuration

## Monitoring and Troubleshooting

### Check Application Health

```bash
# Port forward to access locally
kubectl port-forward svc/backend-service 3000:3000 -n siminho-prod
kubectl port-forward svc/frontend-service 8080:80 -n siminho-prod

# Execute commands in pods
kubectl exec -it deployment/backend -n siminho-prod -- /bin/sh
kubectl exec -it deployment/postgres -n siminho-prod -- psql -U postgres -d siminho_prod
```

### View Logs

```bash
# Stream logs
kubectl logs -f deployment/backend -n siminho-prod
kubectl logs -f deployment/frontend -n siminho-prod
kubectl logs -f deployment/postgres -n siminho-prod

# View recent logs
kubectl logs --tail=100 deployment/backend -n siminho-prod
```

### Debugging

```bash
# Describe resources
kubectl describe pod <pod-name> -n siminho-prod
kubectl describe svc frontend-service -n siminho-prod

# Get events
kubectl get events -n siminho-prod --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n siminho-prod
kubectl top nodes
```

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment backend --replicas=5 -n siminho-prod

# Scale frontend
kubectl scale deployment frontend --replicas=5 -n siminho-prod
```

### Update Helm Chart

Edit the replica count in values file and upgrade:

```bash
helm upgrade siminho-prod ./siminho \
  --namespace siminho-prod \
  --values ./siminho/values-prod.yaml \
  --set backend.replicaCount=5 \
  --set frontend.replicaCount=5
```

## Database Backup

```bash
# Backup database
kubectl exec deployment/postgres -n siminho-prod -- pg_dump -U postgres siminho_prod > backup.sql

# Restore database
kubectl exec -i deployment/postgres -n siminho-prod -- psql -U postgres siminho_prod < backup.sql
```

## Setting Up Domain and SSL (Optional)

### Install AWS Load Balancer Controller

Follow the official guide: https://docs.aws.amazon.com/eks/latest/userguide/aws-load-balancer-controller.html

### Enable Ingress

Update `values.yaml`:

```yaml
ingress:
  enabled: true
  className: "alb"
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/target-type: ip
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:eu-west-1:xxxx:certificate/xxxx
  hosts:
    - host: siminho.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: siminho-tls
      hosts:
        - siminho.yourdomain.com
```

Then upgrade the Helm release.

## Cost Optimization

- Use spot instances for non-production environments
- Set appropriate resource requests and limits
- Use Horizontal Pod Autoscaler (HPA) for automatic scaling
- Consider using RDS instead of PostgreSQL pod for production
- Enable cluster autoscaling

## Security Best Practices

1. Use AWS Secrets Manager or Kubernetes Secrets for sensitive data
2. Enable network policies to restrict pod-to-pod communication
3. Use IAM roles for service accounts (IRSA)
4. Regularly update container images
5. Enable pod security policies
6. Use private subnets for worker nodes
7. Enable audit logging
