#!/bin/bash

# Deploy API to Cloud Run with custom startup probe
gcloud run deploy api \
  --image gcr.io/gen-lang-client-0406312695/api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,GCS_BUCKET=bike_images" \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest,JWT_SIGNATURE=JWT_SIGNATURE:latest,CLIENT_ID=CLIENT_ID:latest,CLIENT_SECRET=CLIENT_SECRET:latest,CORS_ALLOW_URL=CORS_ALLOW_URL:latest,CALLBACK=CALLBACK:latest,REDIRECT_URL=REDIRECT_URL:latest,EMAIL_USERNAME=EMAIL_USERNAME:latest,EMAIL_PASSWORD=EMAIL_PASSWORD:latest,EMAIL_PROVIDER=EMAIL_PROVIDER:latest,AZURE_TENANT_ID=AZURE_TENANT_ID:latest,AZURE_CLIENT_ID=AZURE_CLIENT_ID:latest,AZURE_CLIENT_SECRET=AZURE_CLIENT_SECRET:latest,MAIL_FROM=MAIL_FROM:latest,EMAIL_LOGO_PATH=EMAIL_LOGO_PATH:latest,EMAIL_LOGO_URL=EMAIL_LOGO_URL:latest,BASE_URL_PROD=BASE_URL_PROD:latest" \
  --add-cloudsql-instances gen-lang-client-0406312695:asia-southeast1:bikehub-db \
  --memory 1Gi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --max-instances 10 \
  --startup-cpu-boost \
  --cpu-throttling \
  --no-cpu-throttling
