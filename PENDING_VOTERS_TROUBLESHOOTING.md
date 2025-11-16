# Pending Voters List - Troubleshooting Guide

## Issue: Pending List Not Working

### What I've Added

1. **Debug Logging**
   - Console logs to track function calls
   - Error details in console
   - Result logging

2. **Manual Refresh Button**
   - 🔄 Refresh button in Pending List view
   - Click to manually reload the list
   - Shows loading state

3. **Better Error Messages**
   - Shows specific error details
   - Info message when no pending voters
   - Clear error feedback

4. **Info Message Support**
   - Added 'info' message type
   - Blue background for info messages
   - Better visual feedback

## How to Debug

### Step 1: Check Browser Console
1. Open browser console (F12)
2. Go to "Verify Voters" tab
3. Click "Pending List"
4. Look for these logs:
   ```
   Loading pending voters from useEffect
   Calling getPendingVoters...
   Pending voters result: {...}
   Processed voter list: [...]
   ```

### Step 2: Check for Errors
Look for error messages in console:
- "No contract available" - Contract not loaded
- "Failed to load pending voters" - Contract call failed
- Check the error details logged

### Step 3: Verify Contract Function
Test the contract function directly in console:
```javascript
// In browser console
const contract = window.contract; // If exposed
const result = await contract.getPendingVoters();
console.log(result);
```

### Step 4: Check Contract Deployment
Verify the contract has the `getPendingVoters()` function:
1. Go to block explorer (e.g., Etherscan)
2. Enter contract address: `0x199718Ed1ae9Cc96a4abe789325bf0A9262B5B24`
3. Check "Read Contract" tab
4. Look for `getPendingVoters` function

## Common Issues & Solutions

### Issue 1: "No pending voters found"
**Cause:** No voters have registered yet
**Solution:** 
1. Register a voter from another wallet
2. Wait for transaction to confirm
3. Click refresh button

### Issue 2: Function not found error
**Cause:** Contract doesn't have `getPendingVoters()` function
**Solution:**
1. Verify contract address is correct
2. Check if contract is the latest version
3. Verify ABI includes the function

### Issue 3: Empty result
**Cause:** All voters have been verified/rejected
**Solution:**
1. Register new voters
2. Check if voters are in "Pending" status
3. Use "Search Address" mode to check individual voters

### Issue 4: Loading forever
**Cause:** Network issue or contract call hanging
**Solution:**
1. Check MetaMask is connected
2. Check network connection
3. Refresh the page
4. Try switching networks and back

## Testing the Feature

### Test 1: Register and View
1. **Wallet A (Admin):** Connect as Polling Officer
2. **Wallet B (Voter):** Register as voter
3. **Wallet A:** Go to "Verify Voters" → "Pending List"
4. **Expected:** See Wallet B in the list

### Test 2: Verify and Remove
1. See pending voter in list
2. Click "Verify" button
3. Approve transaction
4. **Expected:** Voter removed from pending list

### Test 3: Multiple Voters
1. Register 3 voters from different wallets
2. Go to "Pending List"
3. **Expected:** See all 3 voters
4. Verify one
5. **Expected:** See 2 remaining voters

### Test 4: Manual Refresh
1. Have pending voters in list
2. Register another voter from different tab/window
3. Click 🔄 Refresh button
4. **Expected:** New voter appears in list

## Debug Checklist

- [ ] Contract address is correct in config.js
- [ ] MetaMask is connected
- [ ] Connected as Polling Officer or Super Admin
- [ ] At least one voter has registered
- [ ] Voter status is "Pending" (not verified/rejected)
- [ ] Browser console shows no errors
- [ ] Network connection is stable
- [ ] Contract has `getPendingVoters()` function

## Manual Testing Commands

### Check if function exists
```javascript
// In browser console
const abi = CONTRACT_ABI; // From config
const hasPendingVoters = abi.some(item => 
  item.includes('getPendingVoters')
);
console.log('Has getPendingVoters:', hasPendingVoters);
```

### Test contract call
```javascript
// Get contract instance
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(
  "0x199718Ed1ae9Cc96a4abe789325bf0A9262B5B24",
  CONTRACT_ABI,
  signer
);

// Call function
try {
  const result = await contract.getPendingVoters();
  console.log('Addresses:', result.addr);
  console.log('Names:', result.names);
  console.log('Aadhaar:', result.aadhaar);
  console.log('Election IDs:', result.eids);
} catch (error) {
  console.error('Error:', error);
}
```

## Expected Console Output

### Successful Load
```
Loading pending voters from useEffect
Calling getPendingVoters...
Pending voters result: {
  addr: ['0x123...', '0x456...'],
  names: ['Alice', 'Bob'],
  aadhaar: ['hash1', 'hash2'],
  eids: [1n, 1n]
}
Processed voter list: [
  {address: '0x123...', name: 'Alice', aadhaarId: 'hash1', electionId: 1},
  {address: '0x456...', name: 'Bob', aadhaarId: 'hash2', electionId: 1}
]
```

### No Pending Voters
```
Loading pending voters from useEffect
Calling getPendingVoters...
Pending voters result: {
  addr: [],
  names: [],
  aadhaar: [],
  eids: []
}
Processed voter list: []
```

### Error
```
Loading pending voters from useEffect
Calling getPendingVoters...
Error loading pending voters: Error: ...
Error details: execution reverted
```

## Quick Fixes

### Fix 1: Force Reload
```javascript
// In browser console
window.location.reload();
```

### Fix 2: Clear State
```javascript
// Disconnect and reconnect wallet
// Or refresh the page
```

### Fix 3: Check Network
```javascript
// In browser console
const network = await window.ethereum.request({ 
  method: 'eth_chainId' 
});
console.log('Current network:', network);
```

## Still Not Working?

1. **Check contract on block explorer**
   - Verify it's deployed
   - Check recent transactions
   - Verify function exists

2. **Test with Search mode**
   - Switch to "Search Address"
   - Enter a voter address manually
   - See if that works

3. **Check browser console**
   - Look for any JavaScript errors
   - Check network tab for failed requests
   - Verify contract calls

4. **Try different browser**
   - Sometimes browser extensions interfere
   - Try incognito mode
   - Try different browser

## Contact Points

If still having issues, check:
1. Contract address is correct
2. ABI includes `getPendingVoters`
3. Contract is deployed on correct network
4. MetaMask is on correct network
5. You have admin permissions

The debug logs and refresh button should help identify the issue!
