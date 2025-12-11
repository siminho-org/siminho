# Siminho Terraform Infrastructure

This directory contains Terraform configuration to provision the complete AWS infrastructure for the Siminho application.

## 📋 What Gets Created

When you run this Terraform configuration, it creates:

### Networking (VPC Module)
- **VPC** with customizable CIDR block
- **3 Public Subnets** (one per availability zone) for load balancers
- **3 Private Subnets** (one per availability zone) for EKS nodes and RDS
- **Internet Gateway** for public internet access
- **NAT Gateway(s)** for private subnet internet access
- **Route Tables** for public and private subnets
- **VPC Flow Logs** for network monitoring

### Container Registry (ECR Module)
- **2 ECR Repositories**: one for backend, one for frontend
- **Image Scanning** enabled (security vulnerability detection)
- **Encryption** at rest (AES256)
- **Lifecycle Policies** to clean up old images automatically

### Kubernetes Cluster (EKS Module)
- **EKS Control Plane** (managed Kubernetes API server)
- **Node Groups** with configurable instance types and scaling
- **IAM Roles** for cluster and nodes
- **OIDC Provider** for IAM Roles for Service Accounts (IRSA)
- **CloudWatch Logs** for cluster logging
- **AWS Load Balancer Controller IAM Policy** (for ingress)

### Database (RDS Module)
- **PostgreSQL RDS Instance** with configurable size
- **Automated Backups** with configurable retention
- **Multi-AZ** option for high availability
- **Encryption** at rest
- **Performance Insights** enabled
- **AWS Secrets Manager** integration for credentials
- **Security Group** allowing access only from EKS

## 🛠️ Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
   ```bash
   aws configure
   ```
3. **Terraform** installed (version >= 1.0)
   - Download from: https://www.terraform.io/downloads
   - Or install via package manager:
     - Windows: `choco install terraform`
     - macOS: `brew install terraform`
     - Linux: `sudo apt-get install terraform`

4. **kubectl** installed (for accessing the cluster later)
   ```bash
   # Windows
   choco install kubernetes-cli
   
   # macOS
   brew install kubectl
   
   # Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

## 🚀 Quick Start

### Step 1: Configure Variables

Copy the example variables file and customize it:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` and set your values:
- Change `db_password` to a secure password
- Adjust `aws_region` if needed
- Modify instance types/sizes based on your needs

**Important**: `terraform.tfvars` is gitignored and should NEVER be committed!

### Step 2: Initialize Terraform

This downloads required provider plugins:

```bash
terraform init
```

### Step 3: Review the Plan

See what Terraform will create:

```bash
terraform plan
```

This shows all resources that will be created, modified, or destroyed.

### Step 4: Apply the Configuration

Create the infrastructure:

```bash
terraform apply
```

Type `yes` when prompted.

**⏱️ This will take 15-20 minutes** as AWS provisions:
- VPC and networking components (~2 min)
- RDS instance (~5 min)
- EKS cluster (~10-15 min)
- ECR repositories (~30 sec)

### Step 5: Get Outputs

After completion, Terraform displays important outputs:

```bash
terraform output
```

Key outputs:
- `ecr_backend_repository_url` - Where to push backend image
- `ecr_frontend_repository_url` - Where to push frontend image
- `eks_cluster_name` - Your cluster name
- `configure_kubectl` - Command to configure kubectl
- `rds_endpoint` - Database connection endpoint

## 📦 Next Steps After Infrastructure is Ready

### 1. Configure kubectl

Connect to your EKS cluster:

```bash
aws eks update-kubeconfig --region eu-west-1 --name siminho-dev
```

Verify connection:

```bash
kubectl get nodes
```

### 2. Install AWS Load Balancer Controller

Required for Kubernetes Ingress to work:

```bash
# Add Helm repo
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install the controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=siminho-dev \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 3. Build and Push Docker Images

Login to ECR:

```bash
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-1.amazonaws.com
```

Build and push backend:

```bash
cd backend
docker build -t siminho-backend .
docker tag siminho-backend:latest <backend-ecr-url>:latest
docker push <backend-ecr-url>:latest
```

Build and push frontend:

```bash
cd frontend
docker build -t siminho-frontend .
docker tag siminho-frontend:latest <frontend-ecr-url>:latest
docker push <frontend-ecr-url>:latest
```

### 4. Update Helm Values

Edit `infrastructure/helm/siminho/values-prod.yaml` with your ECR URLs and RDS endpoint.

### 5. Deploy Application

```bash
helm install siminho ./infrastructure/helm/siminho \
  -f infrastructure/helm/siminho/values-prod.yaml \
  --set backend.database.host=<rds-endpoint>
```

## 🔧 Terraform Commands Reference

| Command | Description |
|---------|-------------|
| `terraform init` | Initialize working directory |
| `terraform plan` | Preview changes |
| `terraform apply` | Create/update infrastructure |
| `terraform destroy` | Delete all infrastructure |
| `terraform output` | Show output values |
| `terraform state list` | List all resources |
| `terraform state show <resource>` | Show resource details |
| `terraform fmt` | Format .tf files |
| `terraform validate` | Validate configuration |

## 📊 Understanding the Module Structure

```
terraform/
├── main.tf              # Main configuration, calls all modules
├── variables.tf         # Input variable declarations
├── outputs.tf           # Output value declarations
├── terraform.tfvars     # Your variable values (gitignored)
└── modules/
    ├── ecr/            # Container registry
    ├── vpc/            # Networking
    ├── eks/            # Kubernetes cluster
    └── rds/            # PostgreSQL database
```

**Why modules?** 
- Reusability: Use the same module for dev/staging/prod
- Organization: Each service is self-contained
- Maintainability: Update one module without affecting others

## 💰 Cost Estimation

Based on `terraform.tfvars.example` configuration:

| Resource | Monthly Cost (USD) |
|----------|-------------------|
| EKS Control Plane | $73 |
| EC2 Nodes (2x t3.medium) | ~$60 |
| RDS (db.t3.micro) | ~$15 |
| NAT Gateway (1x) | ~$32 |
| Load Balancer | ~$20 |
| Data Transfer | Variable (~$10-50) |
| **Total** | **~$210-250/month** |

**Cost Savings Tips**:
- Set `single_nat_gateway = true` (already default)
- Use spot instances for node groups (set `capacity_type = "SPOT"`)
- Reduce RDS instance size for dev environments
- Stop/destroy dev environments when not in use

## 🔐 Security Best Practices

### Secrets Management
- ✅ Database password stored in AWS Secrets Manager
- ✅ Never commit `terraform.tfvars` to git
- ✅ Use IAM roles instead of access keys where possible
- ⚠️ Consider using encrypted S3 backend for state files

### Network Security
- ✅ RDS in private subnets (not publicly accessible)
- ✅ EKS nodes in private subnets
- ✅ Security groups restrict access between components
- ✅ VPC Flow Logs enabled

### Access Control
- ✅ IAM roles with least privilege
- ✅ OIDC provider for Kubernetes service accounts
- ✅ ECR image scanning enabled

## 🌍 Multi-Environment Setup

To create separate dev/staging/prod environments:

### Option 1: Workspaces

```bash
# Create workspaces
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

# Switch between them
terraform workspace select dev
terraform apply

terraform workspace select prod
terraform apply
```

### Option 2: Separate Directories

```
terraform/
├── dev/
│   ├── main.tf
│   └── terraform.tfvars
├── staging/
│   ├── main.tf
│   └── terraform.tfvars
└── prod/
    ├── main.tf
    └── terraform.tfvars
```

## 📦 State Management (Recommended for Teams)

For team collaboration, store Terraform state in S3:

1. Create S3 bucket and DynamoDB table:
```bash
aws s3 mb s3://siminho-terraform-state --region eu-west-1

aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region eu-west-1
```

2. Uncomment the backend configuration in `main.tf`:
```hcl
backend "s3" {
  bucket         = "siminho-terraform-state"
  key            = "siminho/terraform.tfstate"
  region         = "eu-west-1"
  encrypt        = true
  dynamodb_table = "terraform-state-lock"
}
```

3. Re-initialize:
```bash
terraform init -migrate-state
```

## 🐛 Troubleshooting

### Issue: "Error creating EKS Cluster: AccessDeniedException"
**Solution**: Ensure your IAM user has the required permissions listed in the main README.

### Issue: "Error: timeout while waiting for state to become 'ACTIVE'"
**Solution**: EKS creation takes 10-15 minutes. Be patient or increase timeout.

### Issue: "Error: InvalidParameterException: The following supplied instance types do not exist"
**Solution**: Check if the instance type is available in your region. Some newer types aren't available everywhere.

### Issue: "Error: error creating DB Instance: DBInstanceAlreadyExists"
**Solution**: RDS identifier must be unique. Change `project_name` or manually delete the old instance.

### Issue: kubectl access denied after cluster creation
**Solution**: The IAM user/role that created the cluster has admin access. Add other users:
```bash
kubectl edit configmap aws-auth -n kube-system
```

## 🗑️ Cleanup

To destroy all resources and stop incurring costs:

```bash
terraform destroy
```

Type `yes` when prompted.

**⚠️ WARNING**: This permanently deletes:
- All databases (unless deletion protection is enabled)
- All container images in ECR
- The entire EKS cluster and all applications
- All networking components

**Production Safety**: For production, consider:
- Enabling deletion protection: `deletion_protection = true`
- Taking manual backups before destroying
- Using `terraform plan -destroy` first to review

## 📚 Additional Resources

- [Terraform AWS Provider Documentation](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [EKS Best Practices Guide](https://aws.github.io/aws-eks-best-practices/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [AWS Pricing Calculator](https://calculator.aws/)

## 🤝 Contributing

When modifying infrastructure:
1. Always run `terraform plan` first
2. Test in dev environment before prod
3. Document changes in this README
4. Update variable descriptions
5. Increment module versions if applicable

## 📝 Notes

- Default region is `eu-west-1` (Ireland)
- Default environment is `dev`
- RDS deletion protection enabled for `prod` environment
- Automatic backups retained for 7 days
- All resources tagged with `Project`, `Environment`, and `ManagedBy`
