# Use official Node.js 18 (or 20) on Alpine 3.19
FROM node:18-alpine3.19

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install 

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Use environment variables
ENV NODE_ENV=production

# Expose port
EXPOSE 5000

# Start the app
CMD ["node", "-r", "tsconfig-paths/register", "-r", "dotenv/config", "dist/server.js"]
