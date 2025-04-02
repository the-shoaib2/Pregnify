# Backend Dockerfile

# Use official Node.js image as base
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for backend
COPY package*.json ./ 

# Install dependencies
RUN npm install

# Copy backend source code to the container
COPY src/ ./src
COPY prisma/ ./prisma
COPY .env ./

# Expose the backend port
EXPOSE 8080

# Run the backend application
CMD ["npm", "start"]
