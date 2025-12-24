# Hướng dẫn triển khai BikeHub lên Google Cloud Platform

## Mục lục
1. [Chuẩn bị](#1-chuẩn-bị)
2. [Thiết lập Database (Cloud SQL)](#2-thiết-lập-database-cloud-sql)
3. [Triển khai API (Cloud Run)](#3-triển-khai-api-cloud-run)
4. [Triển khai Frontend & Admin](#4-triển-khai-frontend--admin)
5. [Cấu hình Domain và SSL](#5-cấu-hình-domain-và-ssl)
6. [CI/CD với GitHub Actions](#6-cicd-với-github-actions)

---

## 1. Chuẩn bị

### 1.1 Cài đặt Google Cloud CLI
```bash
# Tải và cài đặt: https://cloud.google.com/sdk/docs/install
# Sau khi cài, khởi động lại terminal và chạy:
gcloud init
gcloud auth login
```

### 1.2 Tạo Google Cloud Project
```bash
# Tạo project mới
gcloud projects create bikehub-prod --name="BikeHub Production"

# Set project làm mặc định
gcloud config set project bikehub-prod

# Enable các APIs cần thiết
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  compute.googleapis.com
```

### 1.3 Cài đặt các công cụ bổ sung
```bash
# Docker (nếu chưa có)
# https://docs.docker.com/get-docker/
```

---

## 2. Thiết lập Database (Cloud SQL)

### 2.1 Tạo Cloud SQL PostgreSQL Instance
```bash
# Tạo instance PostgreSQL
gcloud sql instances create bikehub-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=asia-southeast1 \
  --root-password=YOUR_STRONG_PASSWORD \
  --storage-size=10GB \
  --storage-auto-increase

# Tạo database
gcloud sql databases create bikehub --instance=bikehub-db

# Tạo user
gcloud sql users create bikehub-user \
  --instance=bikehub-db \
  --password=YOUR_DB_USER_PASSWORD
```

### 2.2 Lấy Connection String
```bash
# Lấy connection name
gcloud sql instances describe bikehub-db --format="value(connectionName)"
# Kết quả: PROJECT_ID:REGION:bikehub-db
```

### 2.3 Lưu credentials vào Secret Manager
```bash
# Database URL
echo -n "postgresql://bikehub-user:YOUR_DB_USER_PASSWORD@localhost/bikehub?host=/cloudsql/PROJECT_ID:REGION:bikehub-db" | \
  gcloud secrets create DATABASE_URL --data-file=-

# JWT Secret
echo -n "your-super-secret-jwt-key-change-this-in-production" | \
  gcloud secrets create JWT_SECRET --data-file=-

# PayPal credentials (nếu có)
echo -n "your-paypal-client-id" | \
  gcloud secrets create PAYPAL_CLIENT_ID --data-file=-
echo -n "your-paypal-client-secret" | \
  gcloud secrets create PAYPAL_CLIENT_SECRET --data-file=-
```

---

## 3. Triển khai API (Cloud Run)

### 3.1 Tạo Dockerfile cho API
Tạo file `api/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY api/package.json ./api/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY api/ ./api/
COPY tsconfig.json ./

# Generate Prisma Client
WORKDIR /app/api
RUN npx prisma generate

# Build
RUN yarn build

# Production image
FROM node:18-alpine

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/prisma ./prisma
COPY --from=builder /app/api/package.json ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile && \
    npx prisma generate

EXPOSE 8080

# Run migrations and start
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]
```

### 3.2 Tạo .dockerignore cho API
Tạo file `api/.dockerignore`:
```
node_modules
dist
.env
.env.local
*.log
.git
```

### 3.3 Build và Deploy API
```bash
# Di chuyển vào thư mục api
cd api

# Build Docker image với Cloud Build
gcloud builds submit --tag gcr.io/bikehub-prod/api

# Deploy lên Cloud Run
gcloud run deploy api \
  --image gcr.io/bikehub-prod/api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,PORT=8080" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest" \
  --add-cloudsql-instances PROJECT_ID:REGION:bikehub-db \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10

# Lấy API URL
gcloud run services describe api --region=asia-southeast1 --format="value(status.url)"
```

### 3.4 Chạy Prisma Migrations
```bash
# Tạo Cloud SQL Proxy để kết nối local
gcloud sql connect bikehub-db --user=bikehub-user

# Hoặc dùng Cloud Shell để chạy migration
gcloud run jobs create migrate-db \
  --image gcr.io/bikehub-prod/api \
  --command npx \
  --args "prisma","migrate","deploy" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --add-cloudsql-instances PROJECT_ID:REGION:bikehub-db \
  --region asia-southeast1

gcloud run jobs execute migrate-db --region=asia-southeast1
```

---

## 4. Triển khai Frontend & Admin

### Phương án A: Firebase Hosting (Đơn giản)

#### 4.1 Cài đặt Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

#### 4.2 Khởi tạo Firebase
```bash
# Tại root folder
firebase init hosting

# Chọn:
# - Existing project: bikehub-prod
# - Public directory: frontend/dist (hoặc admin/build)
# - Single-page app: Yes
# - GitHub Actions: Yes (optional)
```

#### 4.3 Build và Deploy Frontend
```bash
# Build frontend
cd frontend
yarn build

# Cập nhật API URL trong code trước khi build
# File: frontend/src/apis/axios.ts
# baseURL: 'https://api-xxxxx-run.app' (URL từ bước 3.3)

# Deploy
firebase deploy --only hosting:frontend

# Tương tự với Admin
cd ../admin
yarn build
firebase deploy --only hosting:admin
```

### Phương án B: Cloud Run (Flexible)

#### 4.1 Tạo Dockerfile cho Frontend
Tạo file `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
COPY frontend/package.json ./frontend/

RUN yarn install --frozen-lockfile

COPY frontend/ ./frontend/

WORKDIR /app/frontend
RUN yarn build

# Nginx to serve static files
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.2 Tạo nginx.conf
Tạo file `frontend/nginx.conf`:
```nginx
server {
    listen 8080;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 4.3 Build và Deploy
```bash
cd frontend

# Build và push image
gcloud builds submit --tag gcr.io/bikehub-prod/frontend

# Deploy
gcloud run deploy frontend \
  --image gcr.io/bikehub-prod/frontend \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 256Mi

# Lấy Frontend URL
gcloud run services describe frontend --region=asia-southeast1 --format="value(status.url)"
```

---

## 5. Cấu hình Domain và SSL

### 5.1 Map Custom Domain
```bash
# Cho API
gcloud run domain-mappings create \
  --service api \
  --domain api.bikehub.com \
  --region asia-southeast1

# Cho Frontend
gcloud run domain-mappings create \
  --service frontend \
  --domain bikehub.com \
  --region asia-southeast1

# Cho Admin
gcloud run domain-mappings create \
  --service frontend \
  --domain admin.bikehub.com \
  --region asia-southeast1
```

### 5.2 Cấu hình DNS
Thêm records sau vào DNS provider của bạn (theo hướng dẫn GCP):
```
Type: A
Name: @
Value: [IP từ GCP]

Type: CNAME
Name: api
Value: ghs.googlehosted.com
```

---

## 6. CI/CD với GitHub Actions

Tạo file `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GCP

on:
  push:
    branches: [main]

env:
  PROJECT_ID: bikehub-prod
  REGION: asia-southeast1

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
      
      - name: Build and Push API
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/api api/
          
      - name: Deploy API to Cloud Run
        run: |
          gcloud run deploy api \
            --image gcr.io/$PROJECT_ID/api \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Build and Push Frontend
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/frontend frontend/
          
      - name: Deploy Frontend to Cloud Run
        run: |
          gcloud run deploy frontend \
            --image gcr.io/$PROJECT_ID/frontend \
            --region $REGION \
            --platform managed \
            --allow-unauthenticated
```

---

## Chi phí ước tính (Monthly)

- **Cloud SQL (db-f1-micro)**: ~$7-10/tháng
- **Cloud Run API (512MB, low traffic)**: ~$5-15/tháng
- **Cloud Run Frontend**: ~$0-5/tháng
- **Cloud Build**: $0 (120 build minutes free)
- **Secret Manager**: ~$0.06/tháng
- **Storage**: ~$1/tháng

**Tổng**: ~$15-30/tháng cho ứng dụng nhỏ/vừa

---

## Lưu ý quan trọng

1. **Bảo mật**: Đổi tất cả passwords và secrets
2. **Backup**: Thiết lập automated backups cho Cloud SQL
3. **Monitoring**: Bật Cloud Logging và Cloud Monitoring
4. **Scaling**: Điều chỉnh min/max instances theo nhu cầu
5. **Cost**: Theo dõi billing dashboard thường xuyên

---

## Troubleshooting

### Lỗi kết nối database
```bash
# Kiểm tra Cloud SQL instance
gcloud sql instances describe bikehub-db

# Test connection
gcloud sql connect bikehub-db --user=bikehub-user
```

### Lỗi build Docker
```bash
# Build local để debug
cd api
docker build -t test-api .
docker run -p 8080:8080 test-api
```

### Xem logs
```bash
# API logs
gcloud run services logs read api --region=asia-southeast1

# Cloud Build logs
gcloud builds list --limit 10
gcloud builds log BUILD_ID
```

---

## Liên hệ & Hỗ trợ

- Google Cloud Console: https://console.cloud.google.com
- Documentation: https://cloud.google.com/docs
- Support: https://cloud.google.com/support
