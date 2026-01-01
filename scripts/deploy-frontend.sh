#!/bin/bash

# Build and deploy frontend to GCP Cloud Run
# Usage: ./deploy-frontend.sh

set -e

echo "🚀 Deploying Frontend to GCP Cloud Run..."

# Check if .env.build exists
if [ ! -f "frontend/.env.build" ]; then
    echo "❌ Error: frontend/.env.build not found!"
    echo "📝 Please create it from .env.build.example"
    exit 1
fi

# Load environment variables
source frontend/.env.build

# Navigate to frontend directory
cd frontend

# Submit build to Cloud Build with substitutions
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_VITE_BACK_END_PROD="${_VITE_BACK_END_PROD}",_VITE_RECAPTCHA_SITE_KEY="${_VITE_RECAPTCHA_SITE_KEY}" \
    .

echo "✅ Frontend deployed successfully!"
