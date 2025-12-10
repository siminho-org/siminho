#!/bin/bash

# Script to create ECR repositories for Siminho
# Run this before first deployment to AWS

set -e

AWS_REGION="eu-west-1"

echo "==================================="
echo "Creating ECR Repositories"
echo "==================================="
echo ""

echo "Region: $AWS_REGION"
echo ""

# Create backend repository
echo "Creating siminho-backend repository..."
aws ecr create-repository \
    --repository-name siminho-backend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository siminho-backend already exists"

# Create frontend repository
echo "Creating siminho-frontend repository..."
aws ecr create-repository \
    --repository-name siminho-frontend \
    --region $AWS_REGION \
    --image-scanning-configuration scanOnPush=true \
    --encryption-configuration encryptionType=AES256 \
    2>/dev/null || echo "Repository siminho-frontend already exists"

echo ""
echo "✓ ECR repositories created/verified"
echo ""

# Get repository URIs
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
BACKEND_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/siminho-backend"
FRONTEND_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/siminho-frontend"

echo "Repository URIs:"
echo "  Backend:  $BACKEND_URI"
echo "  Frontend: $FRONTEND_URI"
echo ""
echo "Update these in your Helm values.yaml file:"
echo ""
echo "backend:"
echo "  image:"
echo "    repository: $BACKEND_URI"
echo ""
echo "frontend:"
echo "  image:"
echo "    repository: $FRONTEND_URI"
