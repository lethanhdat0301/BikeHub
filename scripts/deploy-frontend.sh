#!/bin/bash

# Build and deploy frontend to GCP Cloud Run
# Usage: Run from BikeHub root: ./scripts/deploy-frontend.sh
#        Or from frontend dir: ../scripts/deploy-frontend.sh

set -e

echo "🚀 Deploying Frontend to GCP Cloud Run..."

# Determine the correct path based on current directory
if [ -f ".env.build" ]; then
    # Running from frontend directory
    ENV_FILE=".env.build"
    FRONTEND_DIR="."
elif [ -f "frontend/.env.build" ]; then
    # Running from root directory
    ENV_FILE="frontend/.env.build"
    FRONTEND_DIR="frontend"
else
    echo "❌ Error: .env.build not found!"
    echo "📝 Please create it in the frontend directory from .env.build.example"
    echo "   Current directory: $(pwd)"
    exit 1
fi

# Load environment variables
source "$ENV_FILE"

# Navigate to frontend directory
cd "$FRONTEND_DIR"

# Submit build to Cloud Build with substitutions
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions=_VITE_BACK_END_PROD="${_VITE_BACK_END_PROD}",_VITE_RECAPTCHA_SITE_KEY="${_VITE_RECAPTCHA_SITE_KEY}" \
    .

echo "✅ Frontend deployed successfully!"
