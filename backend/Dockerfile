# syntax=docker/dockerfile:1

# Use Typesense official image as base - it has the binary pre-installed at /opt/typesense-server
FROM typesense/typesense:latest

# Install Node.js and wget on Ubuntu
RUN apt-get update && \
    apt-get install -y --no-install-recommends wget curl gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

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

# Override Typesense entrypoint to start both processes
ENTRYPOINT ["./start.sh"]