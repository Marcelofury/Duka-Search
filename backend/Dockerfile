# syntax=docker/dockerfile:1

# Stage 1: Get Typesense binary from official image
FROM typesense/typesense:latest AS typesense

# Stage 2: Build final image with Node + Typesense
# Use Ubuntu 22.04 to match Typesense binary dependencies
FROM ubuntu:22.04

# Install Node.js and wget
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl wget ca-certificates && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy Typesense binary from stage 1
COPY --from=typesense /opt/typesense-server /usr/local/bin/typesense-server
RUN chmod +x /usr/local/bin/typesense-server

WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application source
COPY src ./src
COPY scripts ./scripts
COPY start.sh ./
RUN chmod +x start.sh

# Expose the port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ./start.sh