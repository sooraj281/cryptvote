# Wallet Connection Troubleshooting Guide

## Why MetaMask Isn't Connecting

The wallet connection code is correct, but here are common reasons why MetaMask might not prompt:

### 1. MetaMask Not Installed
**Solution**: Install MetaMask from https://metamask.io/

### 2. MetaMask is Locked
**Solution**: 
- Click the MetaMask extension icon
- Enter your password to unlock
- Try connecting again

### 3. Wrong Network
**Solution**:
- Check which network your contract is deployed on
- Open MetaMask
- Click the network dropdown at the top
- Select the correct network (e.g., Sepolia, Goerli, or local network)

### 4. Site Not Connected
**Solution**:
- Open MetaMask
- Click the three dots (⋮) menu
- Go to "Connected sites"
- If your site isn't listed, try connecting again
- If it's listed but not working, disconnect and reconnect

### 5. Browser Issues
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Disable other wallet extensions temporarily
- Try in incognito/private mode
- Try a different browser

### 6. MetaMask Already Connected to Another Account
**Solution**:
- Open MetaMask
- Click on your account icon
- Select the account you want to use
- Refresh the page

## Testing the Connection

### Step 1: Check MetaMask is Available
Open browser console (F12) and type:
```javascript
console.log(window.ethereum)
```
If it returns `undefined`, MetaMask is not installed or not detected.

### Step 2: Check Current Network
```javascript
window.ethereum.request({ method: 'eth_chainId' })
  .then(chainId => console.log('Chain ID:', chainId))
```

### Step 3: Check Connected Accounts
```javascript
window.ethereum.request({ method: 'eth_accounts' })
  .then(accounts => console.log('Connected accounts:', accounts))
```

### Step 4: Manual Connection Test
```javascript
window.ethereum.request({ method: 'eth_requestAccounts' })
  .then(accounts => console.log('Connected:', accounts))
  .catch(err => console.error('Error:', err))
```

## Common Error Messages

### "Please install MetaMask!"
- MetaMask extension is not installed
- Install from https://metamask.io/

### "User rejected the request"
- You clicked "Cancel" in MetaMask
- Click "Connect Wallet" again and approve

### "Failed to connect wallet"
- Check browser console for specific error
- Ensure MetaMask is unlocked
- Try refreshing the page

### No transaction popup appears
- Check if MetaMask is on the correct network
- Ensure you have enough ETH for gas
- Check if the contract address is correct
- Verify you have the required permissions (for admin functions)

## For Local Development

If testing on a local blockchain (Hardhat/Ganache):

1. **Add Local Network to MetaMask**:
   - Network Name: Localhost 8545
   - RPC URL: http://localhost:8545
   - Chain ID: 31337 (Hardhat) or 1337 (Ganache)
   - Currency Symbol: ETH

2. **Import Test Account**:
   - Copy private key from Hardhat/Ganache
   - MetaMask → Import Account → Paste private key

3. **Reset Account** (if transactions stuck):
   - MetaMask → Settings → Advanced
   - Click "Reset Account"

## Verifying Contract Deployment

Make sure your contract is actually deployed:

```javascript
// In browser console
const provider = new ethers.BrowserProvider(window.ethereum);
const code = await provider.getCode("YOUR_CONTRACT_ADDRESS");
console.log('Contract code:', code);
// Should return bytecode, not "0x"
```

## Admin Access Issues

If admin tabs don't appear:

1. **Check Admin Status**:
```javascript
// In browser console after connecting
const contract = new ethers.Contract(
  "YOUR_CONTRACT_ADDRESS",
  CONTRACT_ABI,
  await new ethers.BrowserProvider(window.ethereum).getSigner()
);
const adminInfo = await contract.admins("YOUR_WALLET_ADDRESS");
console.log('Admin role:', adminInfo.role.toString());
console.log('Admin active:', adminInfo.active);
```

2. **Grant Admin Role** (from contract owner):
```javascript
// Role values: 1=SuperAdmin, 2=ElectionAuthority, 3=PollingOfficer, 4=LocalityOfficer
await contract.addAdmin("WALLET_ADDRESS", 2);
```

## Still Having Issues?

1. Check browser console (F12) for error messages
2. Verify contract address in `src/config.js`
3. Ensure you're on the correct network
4. Try with a fresh MetaMask account
5. Check that the contract is deployed and verified on the blockchain explorer

## Quick Fix Checklist

- [ ] MetaMask installed and unlocked
- [ ] Correct network selected
- [ ] Contract address correct in config.js
- [ ] Have ETH for gas fees
- [ ] Browser console shows no errors
- [ ] Site connected in MetaMask settings
- [ ] Account has admin role (for admin features)
