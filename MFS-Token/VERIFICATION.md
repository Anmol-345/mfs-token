# MFS Token — Etherscan Verification Guide

## Prerequisites
- Contract deployed on Sepolia (see deployment guide)
- Etherscan API key
- Source code matches deployed bytecode

## Method 1: truffle-plugin-verify (Recommended)

### 1. Install
```bash
npm install truffle-plugin-verify
```

### 2. Configure `truffle-config.js`
```js
module.exports = {
  plugins: ["truffle-plugin-verify"],
  api_keys: {
    etherscan: process.env.ETHERSCAN_API_KEY,
  },
  // ... rest of config
};
```

### 3. Verify
```bash
# Verify MFSToken
truffle run verify MFSToken --network sepolia

# Verify MFSTimeLock
truffle run verify MFSTimeLock --network sepolia
```

### 4. Check
- Visit Sepolia Etherscan
- Contract page should show "Contract Source Code Verified"
- Read/Write contract functions visible
- ABI available for download

## Method 2: Manual Flatten + Etherscan UI

### 1. Flatten contracts
```bash
npm install truffle-flattener -g
truffle-flattener contracts/MFSToken.sol > flattened/MFSToken_flat.sol
truffle-flattener contracts/MFSTimeLock.sol > flattened/MFSTimeLock_flat.sol
```

### 2. Go to Sepolia Etherscan
`https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>#code`

### 3. Click "Verify and Publish"

### 4. Fill form
- **Contract Name**: MFSToken (or MFSTimeLock)
- **Compiler**: Solidity ^0.8.20 (use exact version from truffle-config)
- **EVM Version**: default
- **Optimization**: Yes / No (match truffle-config setting)
- **Constructor Arguments**: ABI-encoded constructor params

### 5. Get Constructor Arguments (for manual verify)
Using `ethers.js`:
```js
const { ethers } = require("ethers");
const abi = ["constructor(address,address,address,address,address)"];
const interface = new ethers.Interface(abi);
const encoded = interface.encodeDeploy([
  "0xSTAKEHOLDER_WALLET",
  "0xINVESTOR_WALLET",
  "0xSTAKING_POOL_WALLET",
  "0xMAIN_WALLET",
  "0xCOMPANY_FEE_ADDRESS",
]);
console.log("Constructor args (hex):", encoded);
```

### 6. Paste flattened source
Upload the flattened Solidity file.

### 7. Submit
Etherscan will compile and compare bytecodes. If they match, verification succeeds.

## Post-Verification Checklist
- [ ] Contract shows as verified on Sepolia Etherscan
- [ ] Read Contract tab shows: name, symbol, decimals, totalSupply
- [ ] Write Contract tab shows: transfer, transferFrom, pause, etc.
- [ ] Events tab shows: Transfer, TransferFeeCollected, etc.
