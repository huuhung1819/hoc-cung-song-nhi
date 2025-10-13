#!/bin/bash

##############################################################################
# QUICK DEPLOY - Minimal deployment script (no interactive prompts)
#
# Usage: ./quick-deploy.sh [service-name] [region]
# Example: ./quick-deploy.sh hoc-cung-songnhi asia-southeast1
##############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICE_NAME="${1:-hoc-cung-songnhi}"
REGION="${2:-asia-southeast1}"

echo -e "${BLUE}🚀 Quick Deploy: ${SERVICE_NAME}${NC}"
echo ""

# Pre-checks
echo -e "${BLUE}[1/4] Pre-checks...${NC}"
npm run lint > /dev/null 2>&1 && echo -e "${GREEN}✅ Lint passed${NC}" || { echo -e "${RED}❌ Lint failed${NC}"; exit 1; }
npm run build > /dev/null 2>&1 && echo -e "${GREEN}✅ Build passed${NC}" || { echo -e "${RED}❌ Build failed${NC}"; exit 1; }

# Deploy
echo -e "${BLUE}[2/4] Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --source . \
  --region ${REGION} \
  --allow-unauthenticated \
  --platform managed \
  --quiet

# Get URL
echo -e "${BLUE}[3/4] Getting service URL...${NC}"
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format='value(status.url)')
echo -e "${GREEN}✅ URL: ${SERVICE_URL}${NC}"

# Verify
echo -e "${BLUE}[4/4] Health check...${NC}"
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL})
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ Service is healthy (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}⚠️  HTTP $HTTP_CODE - Service may be starting${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deploy complete!${NC}"
echo -e "Visit: ${SERVICE_URL}"


