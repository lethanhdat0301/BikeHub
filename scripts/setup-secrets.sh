#!/bin/bash

# Script thiết lập secrets cho Google Cloud
# Chạy: chmod +x scripts/setup-secrets.sh && ./scripts/setup-secrets.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ID="${GCP_PROJECT_ID:-bikehub-prod}"

echo -e "${GREEN}=== Thiết lập Google Cloud Secrets ===${NC}"
echo -e "${YELLOW}Project: $PROJECT_ID${NC}"
echo ""

gcloud config set project $PROJECT_ID

# DATABASE_URL
echo -e "${GREEN}[1/5] Tạo DATABASE_URL secret...${NC}"
read -p "Nhập DATABASE_URL (postgresql://...): " DATABASE_URL
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL --data-file=- || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-
echo -e "${GREEN}✓ DATABASE_URL đã được lưu${NC}"

# JWT_SECRET
echo -e "${GREEN}[2/5] Tạo JWT_SECRET secret...${NC}"
read -p "Nhập JWT_SECRET (hoặc nhấn Enter để tạo tự động): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "Generated JWT_SECRET: $JWT_SECRET"
fi
echo -n "$JWT_SECRET" | gcloud secrets create JWT_SECRET --data-file=- || \
    echo -n "$JWT_SECRET" | gcloud secrets versions add JWT_SECRET --data-file=-
echo -e "${GREEN}✓ JWT_SECRET đã được lưu${NC}"

# PAYPAL_CLIENT_ID
echo -e "${GREEN}[3/5] Tạo PAYPAL_CLIENT_ID secret...${NC}"
read -p "Nhập PAYPAL_CLIENT_ID: " PAYPAL_CLIENT_ID
echo -n "$PAYPAL_CLIENT_ID" | gcloud secrets create PAYPAL_CLIENT_ID --data-file=- || \
    echo -n "$PAYPAL_CLIENT_ID" | gcloud secrets versions add PAYPAL_CLIENT_ID --data-file=-
echo -e "${GREEN}✓ PAYPAL_CLIENT_ID đã được lưu${NC}"

# PAYPAL_CLIENT_SECRET
echo -e "${GREEN}[4/5] Tạo PAYPAL_CLIENT_SECRET secret...${NC}"
read -p "Nhập PAYPAL_CLIENT_SECRET: " PAYPAL_CLIENT_SECRET
echo -n "$PAYPAL_CLIENT_SECRET" | gcloud secrets create PAYPAL_CLIENT_SECRET --data-file=- || \
    echo -n "$PAYPAL_CLIENT_SECRET" | gcloud secrets versions add PAYPAL_CLIENT_SECRET --data-file=-
echo -e "${GREEN}✓ PAYPAL_CLIENT_SECRET đã được lưu${NC}"

# Grant access to Cloud Run
echo -e "${GREEN}[5/5] Cấp quyền truy cập secrets cho Cloud Run...${NC}"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

for SECRET in DATABASE_URL JWT_SECRET PAYPAL_CLIENT_ID PAYPAL_CLIENT_SECRET; do
    gcloud secrets add-iam-policy-binding $SECRET \
        --member="serviceAccount:$SERVICE_ACCOUNT" \
        --role="roles/secretmanager.secretAccessor"
done

echo ""
echo -e "${GREEN}=== Hoàn tất thiết lập secrets! ===${NC}"
echo ""
echo -e "${YELLOW}Secrets đã tạo:${NC}"
gcloud secrets list
