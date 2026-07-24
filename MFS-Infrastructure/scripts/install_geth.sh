#!/usr/bin/env bash
set -euo pipefail

GETH_USER="geth_user"
GETH_GROUP="geth_group"
GETH_DATA_DIR="/var/lib/geth/sepolia"
GETH_SCRIPT_DIR="/opt/mfs"

echo "[1/5] Adding Ethereum PPA..."
add-apt-repository -y ppa:ethereum/ethereum
apt update

echo "[2/5] Installing GETH..."
apt install -y ethereum

echo "[3/5] Verifying installation..."
geth version

echo "[4/5] Creating data directory..."
mkdir -p "$GETH_DATA_DIR"
chown -R "$GETH_USER:$GETH_GROUP" "/var/lib/geth"

echo "[5/5] Creating startup script directory..."
mkdir -p "$GETH_SCRIPT_DIR"
chown root:root "$GETH_SCRIPT_DIR"
chmod 755 "$GETH_SCRIPT_DIR"

echo ""
echo "GETH installation complete."
echo "Next: copy geth_start.sh to $GETH_SCRIPT_DIR/geth_start.sh"
echo "Then: copy geth-sepolia.service to /etc/systemd/system/"
echo "Then: systemctl daemon-reload && systemctl enable --now geth-sepolia"
