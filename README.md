# MFS Crypto — Full-Stack Token Ecosystem

A production-grade ERC-20 token ecosystem on Ethereum Sepolia testnet, spanning smart contracts, a GETH node, a REST API backend, a React Native mobile wallet, and a React admin panel.

## Architecture

```
                     Sepolia Testnet
 ┌────────────────────────────────────────────────┐
 │  MFSToken.sol + MFSTimeLock.sol                │
 │  (ERC-20, Fee Logic, Genesis Distribution)      │
 └─────────────────────┬──────────────────────────┘
                       │ IPC Socket
                       ▼
 ┌───────────────────────────────────────────────┐
 │   Linux Server (Ubuntu 22.04)                  │
 │  ┌─────────────┐   ┌────────────────────────┐ │
 │  │  GETH Node   │◄──►│  Node.js API (PM2)   │ │
 │  │  (Sepolia)   │   │  Express + Web3.js    │ │
 │  │  IPC Only    │   │  JWT + OTP Engine     │ │
 │  └─────────────┘   └───────────┬────────────┘ │
 │  ┌───────────┐ ┌──────────┐    │              │
 │  │PostgreSQL │ │  Redis   │◄───┘              │
 │  └───────────┘ └──────────┘                   │
 └───────────────────────────────────────────────┘
                       │ HTTPS
              ┌────────┴────────┐
              ▼                  ▼
 ┌──────────────────┐  ┌─────────────────────┐
 │  Mobile Wallet   │  │  Web Admin Panel     │
 │  React Native    │  │  React + Vite        │
 │  iOS + Android   │  │  Role-Based Access   │
 │  Biometric + OTP │  │  Analytics + Control │
 └──────────────────┘  └─────────────────────┘
```

## Modules

| Module | Directory | Stack |
|--------|-----------|-------|
| **1 — Smart Contracts** | `MFS-Token/` | Solidity ^0.8.20, OpenZeppelin v5, Truffle, Ganache |
| **2 — Infrastructure** | `MFS-Infrastructure/` | GETH v1.14+, Ubuntu 22.04, systemd, UFW |
| **3 — Backend API** | `MFS-Backend/` | Node.js, Express.js, Web3.js v4, Sequelize, Redis, JWT |
| **4 — Mobile Wallet** | `MFS-Mobile/` | Expo SDK 57, React Native, Zustand, React Navigation |
| **5 — Admin Panel** | `MFS-Admin/` | React 19, Vite, TanStack Query, Tailwind v4, Recharts |

---

## Module 1 — Smart Contracts

### MFSToken.sol
- ERC-20 with 8 decimals, 10B total supply
- 0.03 MFS fee on P2P transfers → configurable fee address
- Fee exempt mapping for owner, fee address, contract self
- Pausable by owner, caps on fee updates
- Genesis distribution: 4 wallets at deploy

### MFSTimeLock.sol
- Cliff + linear vesting for 3 stacks
- `release()` and `releasableAmount()` for beneficiaries
- `revoke()` owner emergency return

```
cd MFS-Token
npm install
npx ganache --port 7545 --deterministic
npx truffle migrate --network development
npx truffle test    # 87 tests
```

---

## Module 2 — Infrastructure

Hardened Ubuntu 22.04 with GETH Sepolia full node, IPC-only access.

```
cd MFS-Infrastructure
sudo bash server_setup.sh
sudo bash install_geth.sh
sudo bash geth_start.sh
sudo bash firewall_rules.sh
sudo systemctl enable --now geth-sepolia.service
```

Key: `UMask=0007` on IPC socket so Node.js API can connect.

---

## Module 3 — Backend API

Express.js REST API with 7 route modules, Web3.js IPC connection to GETH, OTP dispatch via all 3 channels.

### API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/user/register` | Register + trigger OTP |
| `POST /api/user/verify-otp` | Verify OTP → create user + wallet |
| `POST /api/user/login` | Login + trigger OTP |
| `POST /api/user/login/verify-otp` | Verify OTP → JWT pair |
| `GET/PUT /api/user/profile` | User profile |
| `GET /api/wallet/balance` | MFS balance (on-chain) |
| `GET /api/wallet/address` | Wallet address |
| `POST /api/wallet/send` | Initiate transfer (step 1 — OTP) |
| `POST /api/wallet/send/verify-otp` | Execute transfer (step 2) |
| `GET /api/wallet/transactions` | Tx history |
| `GET /api/wallet/qr` | QR code data URI |
| `GET/POST /api/coins/*` | Accumulated coins |
| `GET /api/referral/*` | Referral tree + stats |
| `GET/POST /api/integration/*` | Linked apps |
| `GET/POST /api/support/tickets` | Support tickets |
| `GET/PUT /api/notifications` | Notifications |
| `* /api/admin/*` | Admin endpoints (role-gated) |

### Setup

```
cd MFS-Backend
docker compose up -d           # PostgreSQL + Redis
cp .env.example .env           # configure RPC, IPC, API keys
npm install
npm run migrate
npm run seed
npm run dev                    # development
npm test                       # 30 tests
```

Swagger docs at `http://localhost:3000/api/docs`.

---

## Module 4 — Mobile Wallet

Expo React Native app with 22 screens, dark theme, biometric security, QR scanning.

### Screens
- Splash, Onboarding (3 slides), Registration, OTP (6-digit), Login, Login OTP
- Dashboard (balance + quick actions), Send (2-step OTP), Receive (QR), QR Scanner
- Transaction History, Transaction Detail, Coin Accumulation, Referral Tree
- Linked Apps, Support (ticket list + detail), Notifications, Profile, Settings

### Security
- Biometric gate on Send confirmation (`expo-local-authentication`)
- AppState-based biometric lock after 2 min background
- JWT stored in `expo-secure-store`

### Setup

```
cd MFS-Mobile
cp .env.example .env
npm install
npx expo start
```

```
npx expo run:android
npx eas build --platform android --profile production
```

---

## Module 5 — Admin Panel

React + Vite dashboard with role-based access (SUPER_ADMIN / ADMIN / SUPPORT).

### Pages

| Page | Route | Role |
|------|-------|------|
| Login | `/login` | None |
| Dashboard | `/` | SUPPORT+ |
| User Management | `/users` | ADMIN+ |
| User Detail | `/users/:id` | ADMIN+ |
| Wallet Management | `/wallets` | ADMIN+ |
| Transaction Explorer | `/transactions` | ADMIN+ |
| Token Configuration | `/token` | SUPER_ADMIN |
| Analytics | `/analytics` | ADMIN+ |
| Support Center | `/support` | SUPPORT+ |
| Admin Management | `/admins` | SUPER_ADMIN |
| Broadcast | `/notifications` | ADMIN+ |

### Setup

```
cd MFS-Admin
npm install
npm run dev        # proxies /api to localhost:3000
npm run build      # production build → dist/
```

---

## Quick Start (All Modules)

```bash
# 1 — Contracts
cd MFS-Token && npm install && npx truffle migrate && npx truffle test

# 2 — Infra (on Ubuntu server)
cd MFS-Infrastructure && sudo bash server_setup.sh && sudo bash install_geth.sh

# 3 — Backend
cd MFS-Backend && docker compose up -d && npm install && npm run migrate && npm run seed && npm run dev

# 4 — Mobile
cd MFS-Mobile && npm install && npx expo start

# 5 — Admin
cd MFS-Admin && npm install && npm run dev
```

---

## Token Details

| Property | Value |
|----------|-------|
| Name | MFS Crypto |
| Standard | ERC-20 |
| Decimals | 8 |
| Total Supply | 10,000,000,000 MFS |
| Transfer Fee | 0.03 MFS per P2P |
| Network | Sepolia Testnet |
| Chain ID | 11155111 |

---

## Environment Variables

All required vars documented in individual `.env.example` files:

- `MFS-Backend/.env.example` — IPC path, DB, Redis, JWT, SendGrid, Twilio, WhatsApp, Firebase
- `MFS-Mobile/.env.example` — API base URL
- `MFS-Admin/.env.example` — Vite API proxy target

---

## Testing

| Module | Command | Count |
|--------|---------|-------|
| Smart Contracts | `npx truffle test` | 87 |
| Backend API | `npm test` | 30 |
| Admin Panel | `npx tsc -b --noEmit && npx vite build` | 0 errors |

---

## Sepolia Faucets

- https://alchemy.com/faucets/ethereum-sepolia
- https://infura.io/faucet/sepolia
- https://sepoliafaucet.com

---

## Troubleshooting

**Ganache + Node v24** — uWS binary fallback is normal; Ganache runs on JS transport.

**IPC permission denied** — Ensure `UMask=0007` in `geth-sepolia.service` and API user is in the same group as GETH user.

**Expo Android build** — Set `ANDROID_HOME` and `JAVA_HOME`.

**Admin build size** — Recharts adds ~500 KB; code-split with dynamic `import()` if needed.
