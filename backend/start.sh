#!/bin/sh
mkdir -p /data
typesense-server --data-dir=/data --api-key=xyz_admin_secret_key_dukasearch --port=8108 --enable-cors &
TYPESENSE_PID=$!

# Wait for Typesense to be ready
for i in $(seq 1 30); do
  if wget -q --spider http://localhost:8108/health; then
    break
  fi
  sleep 1
done

node src/app.js