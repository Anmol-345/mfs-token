#!/usr/bin/env bash
set -euo pipefail

GETH_DATA_DIR="/var/lib/geth/sepolia"
IPC_PATH="/var/lib/geth/sepolia/geth.ipc"

exec geth \
  --sepolia \
  --datadir "$GETH_DATA_DIR" \
  --ipcpath "$IPC_PATH" \
  --maxpeers 50 \
  --cache 4096 \
  --syncmode snap \
  --no-usb \
  --verbosity 3
