# MFS Crypto — Infrastructure & GETH Node Setup Guide

## Prerequisites
- Ubuntu 22.04 LTS server (fresh install)
- Root or sudo access
- SSH key pair for admin access

## Quick Start

### 1. Copy scripts to server
```bash
scp -r scripts/ root@<SERVER_IP>:~
scp geth-sepolia.service root@<SERVER_IP>:/etc/systemd/system/
```

### 2. Run server hardening
```bash
ssh root@<SERVER_IP>
chmod +x scripts/*.sh
export ADMIN_SSH_KEY="ssh-ed25519 AAAA..."  # your public key
./scripts/server_setup.sh
```

### 3. Install GETH
```bash
./scripts/install_geth.sh
```

### 4. Deploy startup script
```bash
cp scripts/geth_start.sh /opt/mfs/geth_start.sh
chmod +x /opt/mfs/geth_start.sh
chown root:root /opt/mfs/geth_start.sh
```

### 5. Enable and start GETH service
```bash
systemctl daemon-reload
systemctl enable geth-sepolia
systemctl start geth-sepolia
systemctl status geth-sepolia
```

### 6. Apply firewall
```bash
export ADMIN_IP="1.2.3.4/32"  # your admin IP
./scripts/firewall_rules.sh
```

## Sync Verification

### Check sync status via IPC
```bash
# Connect to GETH console
geth attach /var/lib/geth/sepolia/geth.ipc

# In console:
> eth.syncing
false    # false = fully synced

> net.peerCount
12       # should be > 3

> eth.blockNumber
7654321  # latest block number

> eth.syncing.currentBlock  # if syncing, shows progress
```

### Watch sync progress from shell
```bash
journalctl -u geth-sepolia -f
```

## Verification Checklist

- [ ] `systemctl status geth-sepolia` → `active (running)`
- [ ] `geth attach /var/lib/geth/sepolia/geth.ipc` → connects
- [ ] `eth.syncing` → `false` after sync complete
- [ ] `net.peerCount` → > 3
- [ ] No HTTP/RPC ports: `ss -tlnp | grep geth` → no `:8545` or `:8546`
- [ ] `ufw status verbose` shows correct rules
- [ ] IPC socket accessible by `mfs_api` user: `sudo -u mfs_api geth attach /var/lib/geth/sepolia/geth.ipc`
- [ ] Service auto-restarts: `killall -9 geth && sleep 5 && systemctl status geth-sepolia`

## IPC Socket Permissions

The IPC socket at `/var/lib/geth/sepolia/geth.ipc` must be readable by the `mfs_api` user:

```bash
# Set group ownership so mfs_api can access
chown geth_user:geth_group /var/lib/geth/sepolia/geth.ipc
chmod 660 /var/lib/geth/sepolia/geth.ipc

# Verify
ls -la /var/lib/geth/sepolia/geth.ipc
# Should show: srw-rw---- geth_user geth_group geth.ipc
```

## Log Management

```bash
# View live logs
journalctl -u geth-sepolia -f

# View last 100 lines
journalctl -u geth-sepolia -n 100

# Application logs (configured in server_setup.sh)
ls -la /var/log/mfs/
```

## Maintenance

### Graceful restart
```bash
systemctl restart geth-sepolia
```

### Stop node
```bash
systemctl stop geth-sepolia
```

### Update GETH
```bash
apt update && apt upgrade -y ethereum
systemctl restart geth-sepolia
```
