# Quick Start Guide

## Prerequisites
- Node.js installed
- MetaMask browser extension
- Contract deployed on blockchain

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Contract Address
Edit `src/config.js`:
```javascript
export const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
```

### 3. Start Development Server
```bash
npm start
```
App opens at http://localhost:3000

### 4. Connect MetaMask
- Click "Connect Wallet"
- Approve connection in MetaMask
- Ensure you're on the correct network

## First Time Setup (Contract Owner)

### 1. You Are Automatically Super Admin
The wallet that deployed the contract is automatically a Super Admin.

### 2. Add Political Parties
1. Connect with owner wallet
2. Go to "Manage Parties" tab
3. Add parties (e.g., "Democratic Party", "DEM")

### 3. Add Other Admins (Optional)
1. Go to "Manage Admins" tab
2. Enter wallet address
3. Select role:
   - **Super Admin**: Can add other admins
   - **Election Authority**: Can create elections and parties
   - **Polling Officer**: Can verify voters
   - **Locality Officer**: Can verify candidates

### 4. Create First Election
1. Go to "Create Election" tab
2. Fill in:
   - Election name (e.g., "General Election 2024")
   - Constituency (e.g., "Mumbai North")
   - Start date/time
   - End date/time
3. Click "Create Election"
4. Approve transaction in MetaMask

## Testing the Flow

### As a Voter
1. **Switch to a different MetaMask account** (not the admin)
2. Connect wallet
3. Go to "Register as Voter"
4. Fill in:
   - Your name
   - Aadhaar ID (can use any string for testing, e.g., "hash123")
   - Select the election
5. Submit and approve transaction

### As Admin (Verify Voter)
1. Switch back to admin account
2. Go to "Verify Voters"
3. Enter the voter's wallet address
4. Click "Check Status"
5. Click "Verify" to approve
6. Approve transaction

### As a Candidate
1. Switch to another account
2. Register as voter first (same steps as above)
3. Get verified by admin
4. Go to "Nominate as Candidate"
5. Fill in:
   - Select election
   - Your name
   - Select party
   - Bio (IPFS CID or any string for testing)
6. Submit and approve transaction

### As Admin (Verify Candidate)
1. Switch to admin account
2. Go to "Verify Candidates"
3. Select the election
4. See pending candidates
5. Click "Verify" to approve
6. Approve transaction

### Cast Vote
1. Switch to verified voter account
2. Go to "Cast Vote"
3. Select a candidate
4. Click "Cast Vote"
5. Approve transaction

## Common Commands

### Start Development
```bash
npm start
```

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

## Troubleshooting

### MetaMask Not Connecting
1. Ensure MetaMask is installed and unlocked
2. Check you're on the correct network
3. Try refreshing the page
4. See WALLET_CONNECTION_GUIDE.md

### Admin Tabs Not Showing
1. Verify your wallet has admin role
2. Check in browser console:
```javascript
const contract = new ethers.Contract(
  "CONTRACT_ADDRESS",
  CONTRACT_ABI,
  await new ethers.BrowserProvider(window.ethereum).getSigner()
);
const info = await contract.admins("YOUR_ADDRESS");
console.log(info);
```

### Transaction Failing
1. Check you have enough ETH for gas
2. Verify you have the required permissions
3. Check the contract address is correct
4. Look at error message in MetaMask

### No Elections Showing
1. Create an election first (admin only)
2. Check contract address is correct
3. Verify contract is deployed
4. Check browser console for errors

## Network Configuration

### For Local Testing (Hardhat)
```javascript
// In MetaMask
Network Name: Localhost
RPC URL: http://localhost:8545
Chain ID: 31337
Currency: ETH
```

### For Testnet (e.g., Sepolia)
```javascript
Network Name: Sepolia
RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
Chain ID: 11155111
Currency: ETH
```

## Getting Test ETH

### Sepolia Testnet
- https://sepoliafaucet.com/
- https://www.infura.io/faucet/sepolia

### Goerli Testnet
- https://goerlifaucet.com/

## Project Structure Quick Reference

```
src/
├── App.js              # Main app logic
├── config.js           # ⚠️ UPDATE THIS with your contract address
└── components/         # All UI components
```

## Next Steps

1. ✅ Install dependencies
2. ✅ Update contract address
3. ✅ Start the app
4. ✅ Connect wallet
5. ✅ Add parties (admin)
6. ✅ Create election (admin)
7. ✅ Test voter registration
8. ✅ Test candidate nomination
9. ✅ Test voting

## Need Help?

- **General Usage**: See README.md
- **Wallet Issues**: See WALLET_CONNECTION_GUIDE.md
- **Implementation Details**: See IMPLEMENTATION_COMPLETE.md
- **Browser Console**: Press F12 to see error messages

## Quick Test Script

Run this in browser console after connecting:

```javascript
// Check connection
console.log('Connected:', await window.ethereum.request({ method: 'eth_accounts' }));

// Check contract
const provider = new ethers.BrowserProvider(window.ethereum);
const code = await provider.getCode("YOUR_CONTRACT_ADDRESS");
console.log('Contract exists:', code !== "0x");

// Check admin status
const signer = await provider.getSigner();
const contract = new ethers.Contract("YOUR_CONTRACT_ADDRESS", CONTRACT_ABI, signer);
const adminInfo = await contract.admins(await signer.getAddress());
console.log('Admin role:', adminInfo.role.toString());
console.log('Admin active:', adminInfo.active);
```

Happy voting! 🗳️
