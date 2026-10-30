#!/bin/sh
set -e

TYPESENSE_VERSION="${TYPESENSE_VERSION:-0.25.2}"
TYPESENSE_PORT="${TYPESENSE_PORT:-8108}"
TYPESENSE_DATA_DIR="${TYPESENSE_DATA_DIR:-./typesense-data}"
HEALTH_URL="http://127.0.0.1:${TYPESENSE_PORT}/health"

if command -v typesense-server >/dev/null 2>&1; then
  TYPESENSE_BIN="$(command -v typesense-server)"
else
  TYPESENSE_BIN="./typesense-server"
  if [ ! -x "$TYPESENSE_BIN" ]; then
    echo "Downloading Typesense ${TYPESENSE_VERSION}..."
    ARCH="$(uname -m)"
    case "$ARCH" in
      x86_64|amd64) TS_ARCH="amd64" ;;
      aarch64|arm64) TS_ARCH="arm64" ;;
      *) echo "Unsupported architecture: $ARCH" >&2; exit 1 ;;
    esac
    TARBALL="/tmp/typesense-${TYPESENSE_VERSION}.tar.gz"
    URL="https://dl.typesense.org/releases/${TYPESENSE_VERSION}/typesense-server-${TYPESENSE_VERSION}-linux-${TS_ARCH}.tar.gz"
    if ! curl -fsSL "$URL" -o "$TARBALL"; then
      wget -q "$URL" -O "$TARBALL"
    fi
    tar -xzf "$TARBALL" -C .
    chmod +x "$TYPESENSE_BIN"
  fi
fi

mkdir -p "$TYPESENSE_DATA_DIR"

echo "Starting Typesense ${TYPESENSE_VERSION} on port ${TYPESENSE_PORT}..."
"$TYPESENSE_BIN" \
  --data-dir="$TYPESENSE_DATA_DIR" \
  --api-key="${TYPESENSE_ADMIN_API_KEY:-xyz_admin_secret_key_dukasearch}" \
  --api-address=127.0.0.1 \
  --peering-address=127.0.0.1 \
  --port="$TYPESENSE_PORT" \
  --enable-cors &
TYPESENSE_PID=$!

READY=0
for i in $(seq 1 60); do
  if curl -fsS "$HEALTH_URL" >/dev/null 2>&1 || wget -q --spider "$HEALTH_URL" 2>/dev/null; then
    READY=1
    break
  fi
  if ! kill -0 "$TYPESENSE_PID" 2>/dev/null; then
    echo "Typesense process exited before becoming ready." >&2
    exit 1
  fi
  sleep 1
done

if [ "$READY" -ne 1 ]; then
  echo "Typesense did not become ready in time." >&2
  kill "$TYPESENSE_PID" 2>/dev/null || true
  exit 1
fi

echo "Typesense is ready."
exec node src/app.js
