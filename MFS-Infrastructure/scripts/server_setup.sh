#!/usr/bin/env bash
set -euo pipefail

MFS_API_USER="mfs_api"
GETH_USER="geth_user"
GETH_GROUP="geth_group"
ADMIN_SSH_KEY="${ADMIN_SSH_KEY:-}"  # set via env var

echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

echo "[2/8] Creating system users..."
if ! id -u "$GETH_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$GETH_USER"
fi

if ! id -u "$MFS_API_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$MFS_API_USER"
fi

if ! getent group "$GETH_GROUP" &>/dev/null; then
  groupadd "$GETH_GROUP"
fi

usermod -aG "$GETH_GROUP" "$GETH_USER"
usermod -aG "$GETH_GROUP" "$MFS_API_USER"

echo "[3/8] Hardening SSH..."
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\?PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
if [ -n "$ADMIN_SSH_KEY" ]; then
  mkdir -p "/home/$MFS_API_USER/.ssh"
  echo "$ADMIN_SSH_KEY" >> "/home/$MFS_API_USER/.ssh/authorized_keys"
  chmod 600 "/home/$MFS_API_USER/.ssh/authorized_keys"
  chmod 700 "/home/$MFS_API_USER/.ssh"
  chown -R "$MFS_API_USER:$MFS_API_USER" "/home/$MFS_API_USER/.ssh"
fi
systemctl restart sshd

echo "[4/8] Installing fail2ban..."
apt install -y fail2ban
cat > /etc/fail2ban/jail.local << 'F2B'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
F2B
systemctl enable --now fail2ban

echo "[5/8] Installing UFW..."
apt install -y ufw

echo "[6/8] Installing logrotate..."
apt install -y logrotate
cat > /etc/logrotate.d/mfs << 'LR'
/var/log/mfs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    copytruncate
}
LR

echo "[7/8] Setting timezone to UTC..."
timedatectl set-timezone UTC

echo "[8/8] Creating log directory..."
mkdir -p /var/log/mfs
chown -R "$MFS_API_USER:$MFS_API_USER" /var/log/mfs

echo "Server setup complete."
echo "Next steps:"
echo "  1. Run ./install_geth.sh"
echo "  2. Run ./firewall_rules.sh"
echo "  3. Enable geth-sepolia service"
