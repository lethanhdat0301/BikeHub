#!/bin/bash

# Script triển khai BikeHub lên Google Cloud Platform
# Chạy: chmod +x scripts/deploy-gcp.sh && ./scripts/deploy-gcp.sh

set -e

# Màu sắc cho output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="${GCP_PROJECT_ID:-bikehub-prod}"
REGION="${GCP_REGION:-asia-southeast1}"
DB_INSTANCE_NAME="bikehub-db"

echo -e "${GREEN}=== BikeHub GCP Deployment Script ===${NC}"
echo -e "${YELLOW}Project ID: $PROJECT_ID${NC}"
echo -e "${YELLOW}Region: $REGION${NC}"
echo ""

# Kiểm tra gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI không được cài đặt${NC}"
    echo "Vui lòng cài đặt: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Kiểm tra Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker không được cài đặt${NC}"
    echo "Vui lòng cài đặt: https://docs.docker.com/get-docker/"
    exit 1
fi

# Set project
echo -e "${GREEN}[1/6] Thiết lập Google Cloud Project...${NC}"
gcloud config set project $PROJECT_ID

# Enable APIs
echo -e "${GREEN}[2/6] Enable Google Cloud APIs...${NC}"
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    compute.googleapis.com

# Build và Push Images
echo -e "${GREEN}[3/6] Build và Push Docker Images...${NC}"

echo "  - Building API image..."
(cd api && gcloud builds submit --tag gcr.io/$PROJECT_ID/api .)

echo "  - Building Frontend image..."
(cd frontend && gcloud builds submit --tag gcr.io/$PROJECT_ID/frontend .)

echo "  - Building Admin image..."
(cd admin && gcloud builds submit --tag gcr.io/$PROJECT_ID/admin .)

# Deploy API
echo -e "${GREEN}[4/6] Deploy API to Cloud Run...${NC}"
gcloud run deploy api \
    --image gcr.io/$PROJECT_ID/api \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --set-env-vars "NODE_ENV=production,PORT=8080" \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10

# Lấy API URL
API_URL=$(gcloud run services describe api --region=$REGION --format="value(status.url)")
echo -e "${GREEN}API deployed at: $API_URL${NC}"

# Deploy Frontend
echo -e "${GREEN}[5/6] Deploy Frontend to Cloud Run...${NC}"
gcloud run deploy frontend \
    --image gcr.io/$PROJECT_ID/frontend \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5

FRONTEND_URL=$(gcloud run services describe frontend --region=$REGION --format="value(status.url)")
echo -e "${GREEN}Frontend deployed at: $FRONTEND_URL${NC}"

# Deploy Admin
echo -e "${GREEN}[6/6] Deploy Admin to Cloud Run...${NC}"
gcloud run deploy admin \
    --image gcr.io/$PROJECT_ID/admin \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 256Mi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5

ADMIN_URL=$(gcloud run services describe admin --region=$REGION --format="value(status.url)")
echo -e "${GREEN}Admin deployed at: $ADMIN_URL${NC}"

# Summary
echo ""
echo -e "${GREEN}=== Deployment hoàn tất! ===${NC}"
echo ""
echo -e "${YELLOW}URLs:${NC}"
echo -e "  API:      $API_URL"
echo -e "  Frontend: $FRONTEND_URL"
echo -e "  Admin:    $ADMIN_URL"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "  1. Cập nhật API URL trong frontend/admin code"
echo "  2. Thiết lập Cloud SQL nếu chưa có"
echo "  3. Cấu hình secrets trong Secret Manager"
echo "  4. Chạy database migrations"
echo "  5. Cấu hình custom domain (optional)"
echo ""
echo -e "${GREEN}Chi tiết trong DEPLOYMENT-GUIDE-GCP.md${NC}"
