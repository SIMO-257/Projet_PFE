# Multi-stage build for React frontend
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Copy node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy built app from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5173

# For development with HMR
CMD ["npm", "run", "dev"]
