#!/bin/bash

# Siminho - AWS EKS Deployment Script
# This script helps deploy the Siminho application to AWS EKS

set -e

echo "==================================="
echo "Siminho - AWS EKS Deployment"
echo "==================================="
echo ""

# Configuration
AWS_REGION="eu-west-1"
ECR_REGISTRY=""  # Will be set after user input
CLUSTER_NAME=""  # Will be set after user input

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v aws &> /dev/null; then
    echo "Error: AWS CLI is not installed."
    exit 1
fi

if ! command -v kubectl &> /dev/null; then
    echo "Error: kubectl is not installed."
    exit 1
fi

if ! command -v helm &> /dev/null; then
    echo "Error: Helm is not installed."
    exit 1
fi

echo "✓ All prerequisites installed"
echo ""

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo ""

# Get cluster name
read -p "Enter your EKS cluster name: " CLUSTER_NAME

# Set ECR registry
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
echo "ECR Registry: $ECR_REGISTRY"
echo ""

# Choose environment
echo "Choose deployment environment:"
echo "1) Development"
echo "2) Production"
read -p "Enter your choice (1-2): " env_choice

case $env_choice in
    1)
        ENVIRONMENT="dev"
        NAMESPACE="siminho-dev"
        VALUES_FILE="values-dev.yaml"
        ;;
    2)
        ENVIRONMENT="prod"
        NAMESPACE="siminho-prod"
        VALUES_FILE="values-prod.yaml"
        ;;
    *)
        echo "Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "Deployment Configuration:"
echo "  Environment: $ENVIRONMENT"
echo "  Namespace: $NAMESPACE"
echo "  Cluster: $CLUSTER_NAME"
echo "  Region: $AWS_REGION"
echo ""

read -p "Do you want to continue? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "Step 1: Configuring kubectl..."
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME
echo "✓ kubectl configured"

echo ""
echo "Step 2: Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
echo "✓ Logged into ECR"

echo ""
echo "Step 3: Building and pushing Docker images..."

# Backend
echo "Building backend..."
cd ../backend
docker build -t siminho-backend:latest .
docker tag siminho-backend:latest $ECR_REGISTRY/siminho-backend:latest
docker push $ECR_REGISTRY/siminho-backend:latest
echo "✓ Backend image pushed"

# Frontend
echo "Building frontend..."
cd ../frontend
docker build -t siminho-frontend:latest .
docker tag siminho-frontend:latest $ECR_REGISTRY/siminho-frontend:latest
docker push $ECR_REGISTRY/siminho-frontend:latest
echo "✓ Frontend image pushed"

cd ../infrastructure

echo ""
echo "Step 4: Deploying with Helm..."
helm upgrade --install siminho-${ENVIRONMENT} ./helm/siminho \
  --namespace $NAMESPACE \
  --create-namespace \
  --values ./helm/siminho/${VALUES_FILE} \
  --set backend.image.repository=$ECR_REGISTRY/siminho-backend \
  --set frontend.image.repository=$ECR_REGISTRY/siminho-frontend \
  --wait

echo "✓ Deployment complete!"

echo ""
echo "Step 5: Checking deployment status..."
kubectl get pods -n $NAMESPACE
kubectl get svc -n $NAMESPACE

echo ""
echo "Getting frontend URL..."
FRONTEND_URL=$(kubectl get svc frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$FRONTEND_URL" ]; then
    echo "LoadBalancer is being provisioned. Run this command to get the URL once ready:"
    echo "kubectl get svc frontend-service -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"
else
    echo "Frontend URL: http://$FRONTEND_URL"
fi

echo ""
echo "==================================="
echo "Deployment Complete!"
echo "==================================="
echo ""
echo "Useful commands:"
echo "  View logs: kubectl logs -f deployment/backend -n $NAMESPACE"
echo "  Check pods: kubectl get pods -n $NAMESPACE"
echo "  Uninstall: helm uninstall siminho-${ENVIRONMENT} -n $NAMESPACE"
