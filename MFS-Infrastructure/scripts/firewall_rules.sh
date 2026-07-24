#!/usr/bin/env bash
set -euo pipefail

ADMIN_IP="${ADMIN_IP:-}"

echo "[1/6] Setting default deny inbound..."
ufw default deny incoming

echo "[2/6] Setting default deny outbound..."
ufw default deny outgoing

echo "[3/6] Allowing SSH (port 22)..."
if [ -n "$ADMIN_IP" ]; then
  ufw allow from "$ADMIN_IP" to any port 22 proto tcp
else
  ufw allow out 22/tcp
fi

echo "[4/6] Allowing Ethereum P2P (port 30303)..."
ufw allow out 30303/tcp comment 'GETH P2P TCP'
ufw allow out 30303/udp comment 'GETH P2P Discovery'

echo "[5/6] Allowing essential outbound..."
ufw allow out 443/tcp comment 'HTTPS outbound'
ufw allow out 53 comment 'DNS outbound'

echo "[6/6] Enabling firewall..."
ufw --force enable

echo "Firewall rules applied."
ufw status verbose
