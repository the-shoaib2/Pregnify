#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Pregnify Setup...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed. Please install MySQL v8.0 or higher.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm.${NC}"
    exit 1
fi

# Setup Backend
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend

# Install dependencies
echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install

# Setup database
echo -e "${YELLOW}Setting up database...${NC}"
npx prisma migrate reset
npx prisma generate
npx prisma db push

# Setup Frontend
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd ../frontend

# Install dependencies
echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install

echo -e "${GREEN}Setup completed successfully!${NC}"
echo -e "${YELLOW}To start the development servers:${NC}"
echo -e "1. Start backend: ${GREEN}cd backend && npm run dev${NC}"
echo -e "2. Start frontend: ${GREEN}cd frontend && npm run dev${NC}" 