# syntax=docker/dockerfile:1

FROM node:20-alpine

# Install Typesense binary
RUN apk add --no-cache wget && \
    wget -q "https://github.com/typesense/typesense/releases/download/v0.24.1/typesense-0.24.1.x86_64" -O /usr/local/bin/typesense && \
    chmod +x /usr/local/bin/typesense && \
    apk del wget

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY src ./src
COPY scripts ./scripts

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Start Typesense in background, then run the Node app
CMD typesense --data-dir=/data --api-key=xyz_admin_secret_key_dukasearch --port=8108 & \
     node src/app.js