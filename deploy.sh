#!/bin/bash

##############################################################################
# DEPLOY SCRIPT - Cloud Run Deployment Automation
# 
# Usage: ./deploy.sh [service-name] [region]
# Example: ./deploy.sh hoc-cung-songnhi asia-southeast1
#
# This script will:
# 1. Run pre-deployment checks (lint, build)
# 2. Deploy to Cloud Run
# 3. Verify deployment
# 4. Show service URL
##############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
SERVICE_NAME="${1:-hoc-cung-songnhi}"
REGION="${2:-asia-southeast1}"

##############################################################################
# Helper Functions
##############################################################################

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

##############################################################################
# Pre-Deployment Checks
##############################################################################

run_pre_checks() {
    print_header "PHASE 1: Pre-Deployment Checks"
    
    # Check 1: Node.js version
    print_info "Checking Node.js version..."
    NODE_VERSION=$(node --version)
    print_success "Node.js version: $NODE_VERSION"
    
    # Check 2: Docker
    print_info "Checking Docker..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found. Please install Docker."
        exit 1
    fi
    DOCKER_VERSION=$(docker --version)
    print_success "Docker version: $DOCKER_VERSION"
    
    # Check 3: gcloud CLI
    print_info "Checking gcloud CLI..."
    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI not found. Please install Google Cloud SDK."
        exit 1
    fi
    GCLOUD_VERSION=$(gcloud --version | head -n 1)
    print_success "gcloud: $GCLOUD_VERSION"
    
    # Check 4: gcloud authentication
    print_info "Checking gcloud authentication..."
    GCLOUD_ACCOUNT=$(gcloud config get-value account 2>/dev/null)
    if [ -z "$GCLOUD_ACCOUNT" ]; then
        print_error "Not authenticated with gcloud. Run: gcloud auth login"
        exit 1
    fi
    print_success "Authenticated as: $GCLOUD_ACCOUNT"
    
    # Check 5: Project ID
    print_info "Checking project ID..."
    PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
    if [ -z "$PROJECT_ID" ]; then
        print_error "No project ID set. Run: gcloud config set project YOUR_PROJECT_ID"
        exit 1
    fi
    print_success "Project ID: $PROJECT_ID"
    
    print_success "All pre-checks passed!"
}

##############################################################################
# Code Quality Checks
##############################################################################

run_quality_checks() {
    print_header "PHASE 2: Code Quality Checks"
    
    # Check 1: ESLint
    print_info "Running ESLint..."
    if npm run lint; then
        print_success "ESLint passed - No warnings or errors"
    else
        print_error "ESLint failed. Please fix linter errors before deploying."
        exit 1
    fi
    
    # Check 2: TypeScript compilation
    print_info "Running TypeScript check..."
    if npx tsc --noEmit; then
        print_success "TypeScript check passed"
    else
        print_warning "TypeScript has some issues, but continuing..."
    fi
    
    # Check 3: Build test
    print_info "Testing production build..."
    if npm run build; then
        print_success "Production build successful"
    else
        print_error "Build failed. Cannot deploy broken code."
        exit 1
    fi
    
    print_success "All quality checks passed!"
}

##############################################################################
# Dockerfile Verification
##############################################################################

verify_dockerfile() {
    print_header "PHASE 3: Dockerfile Verification"
    
    print_info "Checking Dockerfile..."
    
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found!"
        exit 1
    fi
    
    # Check for critical issues
    if grep -q "|| true" package.json; then
        print_error "Found '|| true' in package.json build scripts!"
        print_error "This will hide build errors. Please remove it."
        exit 1
    fi
    
    if grep -q "COPY --from=builder /app/public" Dockerfile; then
        print_warning "Dockerfile tries to copy /app/public folder"
        print_warning "This may fail if folder doesn't exist"
    fi
    
    print_success "Dockerfile verification passed"
}

##############################################################################
# Docker Build (Optional)
##############################################################################

test_docker_build() {
    print_header "PHASE 4: Docker Build Test (Optional)"
    
    read -p "$(echo -e ${YELLOW}Test Docker build locally? [y/N]: ${NC})" -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Building Docker image..."
        if docker build -t ${SERVICE_NAME}:test .; then
            print_success "Docker build successful"
            
            # Check image size
            IMAGE_SIZE=$(docker images ${SERVICE_NAME}:test --format "{{.Size}}")
            print_info "Image size: $IMAGE_SIZE"
            
            read -p "$(echo -e ${YELLOW}Test run container? [y/N]: ${NC})" -n 1 -r
            echo
            
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_info "Starting test container on port 8080..."
                docker run -d --name ${SERVICE_NAME}-test -p 8080:8080 \
                    -e NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co \
                    -e NEXT_PUBLIC_SUPABASE_ANON_KEY=test_key \
                    -e OPENAI_API_KEY=test_key \
                    -e SUPABASE_SERVICE_ROLE_KEY=test_key \
                    -e UNLOCK_CODE_SECRET=test_secret \
                    ${SERVICE_NAME}:test
                
                print_info "Waiting for container to start..."
                sleep 3
                
                print_info "Testing http://localhost:8080..."
                if curl -s -f http://localhost:8080 > /dev/null; then
                    print_success "Container is responding!"
                else
                    print_warning "Container may not be ready yet"
                fi
                
                # Cleanup
                print_info "Stopping test container..."
                docker stop ${SERVICE_NAME}-test > /dev/null 2>&1
                docker rm ${SERVICE_NAME}-test > /dev/null 2>&1
            fi
        else
            print_error "Docker build failed"
            exit 1
        fi
    else
        print_info "Skipping Docker build test"
    fi
}

##############################################################################
# Cloud Run Deployment
##############################################################################

deploy_to_cloudrun() {
    print_header "PHASE 5: Cloud Run Deployment"
    
    print_info "Service Name: $SERVICE_NAME"
    print_info "Region: $REGION"
    print_info "Project: $PROJECT_ID"
    echo ""
    
    read -p "$(echo -e ${YELLOW}Proceed with deployment? [Y/n]: ${NC})" -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Starting deployment..."
        echo ""
        
        START_TIME=$(date +%s)
        
        if gcloud run deploy ${SERVICE_NAME} \
            --source . \
            --region ${REGION} \
            --allow-unauthenticated \
            --platform managed; then
            
            END_TIME=$(date +%s)
            DURATION=$((END_TIME - START_TIME))
            
            print_success "Deployment completed in ${DURATION} seconds!"
        else
            print_error "Deployment failed!"
            print_info "Check logs: gcloud builds list --limit=1"
            exit 1
        fi
    else
        print_warning "Deployment cancelled by user"
        exit 0
    fi
}

##############################################################################
# Post-Deployment Verification
##############################################################################

verify_deployment() {
    print_header "PHASE 6: Post-Deployment Verification"
    
    # Get service URL
    print_info "Getting service URL..."
    SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} \
        --region ${REGION} \
        --format='value(status.url)' 2>/dev/null)
    
    if [ -z "$SERVICE_URL" ]; then
        print_error "Could not get service URL"
        exit 1
    fi
    
    print_success "Service URL: $SERVICE_URL"
    
    # Health check
    print_info "Running health check..."
    sleep 2  # Wait a bit for service to be ready
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" ${SERVICE_URL})
    RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" ${SERVICE_URL})
    
    if [ "$HTTP_CODE" == "200" ]; then
        print_success "Health check passed: HTTP $HTTP_CODE"
        print_info "Response time: ${RESPONSE_TIME}s"
    else
        print_warning "Unexpected HTTP code: $HTTP_CODE"
        print_warning "Service may still be starting up..."
    fi
    
    # Check logs
    print_info "Checking recent logs..."
    echo ""
    gcloud run services logs read ${SERVICE_NAME} \
        --region ${REGION} \
        --limit=10 2>/dev/null || true
}

##############################################################################
# Deployment Summary
##############################################################################

show_summary() {
    print_header "DEPLOYMENT SUMMARY"
    
    echo -e "${GREEN}✅ Deployment Successful!${NC}"
    echo ""
    echo "Service Details:"
    echo "  • Name: ${SERVICE_NAME}"
    echo "  • Region: ${REGION}"
    echo "  • Project: ${PROJECT_ID}"
    echo "  • URL: ${SERVICE_URL}"
    echo ""
    echo "Next Steps:"
    echo "  1. Test your application: ${SERVICE_URL}"
    echo "  2. Monitor logs: gcloud run services logs read ${SERVICE_NAME} --region ${REGION}"
    echo "  3. Check metrics in Cloud Console"
    echo ""
    echo "Useful Commands:"
    echo "  • View service: gcloud run services describe ${SERVICE_NAME} --region ${REGION}"
    echo "  • Update: ./deploy.sh ${SERVICE_NAME} ${REGION}"
    echo "  • Rollback: See DEPLOYMENT_CHECKLIST.md for rollback instructions"
    echo ""
}

##############################################################################
# Main Execution
##############################################################################

main() {
    clear
    
    print_header "🚀 Cloud Run Deployment Script"
    
    echo "Service: ${SERVICE_NAME}"
    echo "Region: ${REGION}"
    echo ""
    
    # Run all phases
    run_pre_checks
    run_quality_checks
    verify_dockerfile
    test_docker_build
    deploy_to_cloudrun
    verify_deployment
    show_summary
    
    print_success "All done! 🎉"
}

# Handle Ctrl+C
trap 'echo -e "\n${RED}Deployment cancelled by user${NC}"; exit 1' INT

# Run main function
main "$@"




