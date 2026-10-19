# Multi-stage production Dockerfile for AURA Backend Server
FROM node:20-alpine AS base

# Install dumb-init to handle PID 1 signal forwarding
RUN apk add --no-cache dumb-init

WORKDIR /app

# Install dependencies with production optimizations
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source code
COPY src ./src

# Set secure non-root user
USER node

ENV NODE_ENV=production \
    PORT=5000

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "src/server.js"]
