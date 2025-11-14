#!/bin/bash

# Deployment Verification Script
# Run this to check if your services are properly deployed

echo "🔍 Checking Student Engagement Portal Deployment..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if environment variables are set
echo "📋 Checking Environment Variables..."

if [ -f "backend-node/.env" ]; then
    echo -e "${GREEN}✓${NC} backend-node/.env exists"
    
    if grep -q "AGORA_APP_ID=your_agora_app_id" backend-node/.env; then
        echo -e "${RED}✗${NC} AGORA_APP_ID not configured in backend-node/.env"
    else
        echo -e "${GREEN}✓${NC} AGORA_APP_ID configured"
    fi
    
    if grep -q "AGORA_APP_CERTIFICATE=your_agora_certificate" backend-node/.env; then
        echo -e "${RED}✗${NC} AGORA_APP_CERTIFICATE not configured in backend-node/.env"
    else
        echo -e "${GREEN}✓${NC} AGORA_APP_CERTIFICATE configured"
    fi
else
    echo -e "${RED}✗${NC} backend-node/.env missing"
fi

echo ""

if [ -f "frontend-react/.env" ]; then
    echo -e "${GREEN}✓${NC} frontend-react/.env exists"
    
    if grep -q "VITE_AGORA_APP_ID=your_agora_app_id" frontend-react/.env; then
        echo -e "${RED}✗${NC} VITE_AGORA_APP_ID not configured in frontend-react/.env"
    else
        echo -e "${GREEN}✓${NC} VITE_AGORA_APP_ID configured"
    fi
else
    echo -e "${YELLOW}⚠${NC} frontend-react/.env missing (may use defaults)"
fi

echo ""

# Check if model exists
echo "🤖 Checking ML Model..."
if [ -f "backend-ml/models/emotion_model_traced.pt" ]; then
    echo -e "${GREEN}✓${NC} ML model exists"
else
    echo -e "${RED}✗${NC} ML model missing at backend-ml/models/emotion_model_traced.pt"
fi

echo ""

# Check if node_modules are installed
echo "📦 Checking Dependencies..."

if [ -d "backend-node/node_modules" ]; then
    echo -e "${GREEN}✓${NC} backend-node dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} backend-node dependencies not installed (run: cd backend-node && npm install)"
fi

if [ -d "frontend-react/node_modules" ]; then
    echo -e "${GREEN}✓${NC} frontend-react dependencies installed"
else
    echo -e "${YELLOW}⚠${NC} frontend-react dependencies not installed (run: cd frontend-react && npm install)"
fi

# Check Python dependencies
if [ -f "backend-ml/requirements.txt" ]; then
    echo -e "${GREEN}✓${NC} backend-ml requirements.txt exists"
else
    echo -e "${RED}✗${NC} backend-ml requirements.txt missing"
fi

echo ""

# Check for common issues
echo "🔧 Checking Configuration..."

if grep -r "localhost" backend-node/.env 2>/dev/null | grep -q "FRONTEND_URL"; then
    echo -e "${YELLOW}⚠${NC} FRONTEND_URL uses localhost (update for production)"
fi

if [ -f ".env" ]; then
    echo -e "${RED}✗${NC} Root .env file exists (may cause confusion, use service-specific .env files)"
fi

# Check .gitignore
if [ -f ".gitignore" ]; then
    if grep -q ".env" .gitignore; then
        echo -e "${GREEN}✓${NC} .env files are gitignored"
    else
        echo -e "${RED}✗${NC} .env not in .gitignore (SECURITY RISK!)"
    fi
else
    echo -e "${RED}✗${NC} .gitignore missing"
fi

echo ""
echo "🎯 Deployment Readiness Summary:"
echo ""
echo "Next steps:"
echo "1. Ensure all environment variables are configured"
echo "2. Install dependencies: npm install in each service"
echo "3. Test locally before deploying"
echo "4. Follow QUICK_DEPLOY.md for deployment steps"
echo "5. Use PRODUCTION_CHECKLIST.md to verify everything"
echo ""
echo "📚 Documentation:"
echo "  - QUICK_DEPLOY.md - Quick deployment guide"
echo "  - DEPLOYMENT.md - Detailed deployment instructions"
echo "  - PRODUCTION_CHECKLIST.md - Pre-launch checklist"
echo ""
