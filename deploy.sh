#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment process...${NC}"

# Step 1: Build the project
echo -e "${YELLOW}Building the project...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Build failed! Aborting deployment.${NC}"
  exit 1
fi

echo -e "${GREEN}Build successful!${NC}"

# Step 2: Add all changes to git
echo -e "${YELLOW}Adding changes to git...${NC}"
git add .

# Step 3: Commit changes
echo -e "${YELLOW}Committing changes...${NC}"
git commit -m "Deploy update: $(date)"

if [ $? -ne 0 ]; then
  echo -e "${YELLOW}No changes to commit or commit failed.${NC}"
  # We continue anyway, as no changes might be legitimate
else
  echo -e "${GREEN}Changes committed successfully!${NC}"
fi

# Step 4: Push to main branch
echo -e "${YELLOW}Pushing to main branch...${NC}"
git push origin main

if [ $? -ne 0 ]; then
  echo -e "${RED}Push failed! Deployment will continue but code changes were not pushed.${NC}"
else
  echo -e "${GREEN}Push successful!${NC}"
fi

# Step 5: Deploy to GitHub Pages
echo -e "${YELLOW}Deploying to GitHub Pages...${NC}"
npm run deploy

if [ $? -ne 0 ]; then
  echo -e "${RED}Deployment to GitHub Pages failed!${NC}"
  exit 1
fi

echo -e "${GREEN}Deployment complete! Your site should be live shortly.${NC}"
echo -e "${YELLOW}Note: It may take a few minutes for the changes to propagate.${NC}" 