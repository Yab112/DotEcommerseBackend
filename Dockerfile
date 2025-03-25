# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci

# Copy source files
COPY src ./src
COPY config ./config
COPY .env ./

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env ./

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD node dist/utils/healthCheck.js || exit 1

# Start command
CMD ["node", "dist/server.js"]