#!/bin/bash

# Render Deployment Verification Script
# Checks that everything is ready for Render deployment

echo "🔍 VoteBlock Render Deployment Verification"
echo "==========================================="
echo ""

ERRORS=0
WARNINGS=0

# Check files exist
echo "📋 Checking configuration files..."
if [ -f "render.yaml" ]; then
  echo "  ✓ render.yaml found"
else
  echo "  ✗ render.yaml NOT found"
  ERRORS=$((ERRORS + 1))
fi

if [ -f ".renderignore" ]; then
  echo "  ✓ .renderignore found"
else
  echo "  ✗ .renderignore NOT found"
  ERRORS=$((ERRORS + 1))
fi

# Check backend
echo ""
echo "🔧 Checking backend..."
cd backend

if [ ! -f "package.json" ]; then
  echo "  ✗ backend/package.json NOT found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ package.json found"
  
  # Check scripts
  if grep -q '"build"' package.json; then
    echo "  ✓ 'build' script found"
  else
    echo "  ✗ 'build' script NOT found"
    ERRORS=$((ERRORS + 1))
  fi
  
  if grep -q '"start"' package.json; then
    echo "  ✓ 'start' script found"
  else
    echo "  ✗ 'start' script NOT found"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [ -f "tsconfig.json" ]; then
  echo "  ✓ tsconfig.json found"
else
  echo "  ✗ tsconfig.json NOT found"
  ERRORS=$((ERRORS + 1))
fi

# Try to build backend (optional, requires dependencies installed)
echo ""
echo "  Attempting to build backend (if dependencies installed)..."
if npm list > /dev/null 2>&1; then
  echo "    Dependencies appear to be installed"
  if npm run build > /dev/null 2>&1; then
    echo "    ✓ Backend builds successfully"
  else
    echo "    ⚠ Backend build failed (might need 'npm install')"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "    ℹ Dependencies not installed yet (will be installed by Render)"
fi

cd ..

# Check frontend
echo ""
echo "🎨 Checking frontend..."
cd frontend

if [ ! -f "package.json" ]; then
  echo "  ✗ frontend/package.json NOT found"
  ERRORS=$((ERRORS + 1))
else
  echo "  ✓ package.json found"
  
  # Check build script
  if grep -q '"build"' package.json; then
    echo "  ✓ 'build' script found"
  else
    echo "  ✗ 'build' script NOT found"
    ERRORS=$((ERRORS + 1))
  fi
fi

if [ -f "vite.config.ts" ]; then
  echo "  ✓ vite.config.ts found"
else
  echo "  ✗ vite.config.ts NOT found"
  ERRORS=$((ERRORS + 1))
fi

# Try to build frontend (optional)
echo ""
echo "  Attempting to build frontend (if dependencies installed)..."
if npm list > /dev/null 2>&1; then
  echo "    Dependencies appear to be installed"
  if npm run build > /dev/null 2>&1; then
    echo "    ✓ Frontend builds successfully"
  else
    echo "    ⚠ Frontend build failed (might need 'npm install')"
    WARNINGS=$((WARNINGS + 1))
  fi
else
  echo "    ℹ Dependencies not installed yet (will be installed by Render)"
fi

cd ..

# Check git
echo ""
echo "📦 Checking Git repository..."
if [ -d ".git" ]; then
  echo "  ✓ Git repository initialized"
  
  if git remote | grep -q origin; then
    echo "  ✓ Remote 'origin' configured"
  else
    echo "  ✗ Remote 'origin' NOT configured"
    echo "    Run: git remote add origin <your-repo-url>"
    ERRORS=$((ERRORS + 1))
  fi
else
  echo "  ✗ NOT a Git repository"
  ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo "✅ All checks passed! Ready to deploy to Render."
  echo ""
  echo "Next steps:"
  echo "1. Commit your changes: git add . && git commit -m 'Ready for Render deployment'"
  echo "2. Push to GitHub: git push origin main"
  echo "3. Go to https://render.com/dashboard and create a Blueprint"
  echo "4. Select this repository and deploy"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo "⚠️  Some warnings found, but deployment might still work."
  echo "Warnings: $WARNINGS"
  echo ""
  echo "Run 'npm install' in backend/ and frontend/ to resolve warnings."
  exit 0
else
  echo "❌ Errors found! Fix these before deploying."
  echo "Errors: $ERRORS"
  echo "Warnings: $WARNINGS"
  exit 1
fi
