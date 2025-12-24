# Multi-stage build for NestJS API
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json yarn.lock* ./
COPY api/package.json ./api/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY api/ ./api/

# Generate Prisma Client
WORKDIR /app/api
RUN npx prisma generate

# Build the application
RUN yarn build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application and dependencies
COPY --from=builder /app/api/dist ./dist
COPY --from=builder /app/api/node_modules ./node_modules
COPY --from=builder /app/api/prisma ./prisma
COPY --from=builder /app/api/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Use non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["dumb-init", "node", "dist/src/main.js"]
