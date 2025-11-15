# Voting DApp - Decentralized Voting System

A secure, blockchain-based voting application built with React and Ethereum smart contracts.

## Features

### For All Users
- **View Elections**: Browse all active and past elections
- **Register as Voter**: Register for specific elections with Aadhaar verification
- **Submit Nomination**: Nominate yourself as a candidate for elections
- **Cast Vote**: Vote for verified candidates in active elections

### For Administrators
- **Create Elections**: Set up new elections with time ranges and constituencies
- **Verify Voters**: Approve or reject voter registration applications
- **Verify Candidates**: Approve or reject candidate nominations
- **Manage Parties**: Add political parties with names and symbols
- **Manage Admins**: Grant admin roles to other addresses

## Admin Roles

1. **Super Admin (Role 1)**: Full control, can add other admins
2. **Election Authority (Role 2)**: Create elections, add parties, end elections
3. **Polling Officer (Role 3)**: Verify voters
4. **Locality Officer (Role 4)**: Verify candidates

## Installation

```bash
npm install
```

## Configuration

Update `src/config.js` with your deployed contract address:

```javascript
export const CONTRACT_ADDRESS = "0x...";
```

## Running the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## Wallet Connection

### Requirements
- MetaMask browser extension installed
- Connected to the correct network (where the contract is deployed)
- Some ETH for gas fees

### Troubleshooting Wallet Connection

If MetaMask doesn't prompt when clicking "Connect Wallet":

1. **Check MetaMask is Installed**: Ensure MetaMask extension is installed and unlocked
2. **Check Network**: Make sure you're on the correct network (check contract deployment network)
3. **Clear Cache**: Try clearing browser cache and reloading
4. **Manual Connection**: Open MetaMask and manually connect to the site
5. **Check Console**: Open browser console (F12) to see any error messages

### Common Issues

**"Please install MetaMask!"**
- Install MetaMask browser extension from metamask.io

**"Failed to connect wallet"**
- Check that MetaMask is unlocked
- Ensure you have at least one account
- Try refreshing the page

**"Transaction failed"**
- Ensure you have enough ETH for gas fees
- Check that you're calling the function with correct permissions
- Verify the contract address is correct

**Admin tabs not showing**
- Ensure your wallet address has been granted admin role in the contract
- Check that the contract's `admins` mapping has your address with `active = true` and `role > 0`

## Contract Functions

### Voter Functions
- `registerVoter(name, aadhaarId, electionId)` - Register for an election
- `castVote(electionId, candidateAddress)` - Cast your vote

### Candidate Functions
- `submitNomination(electionId, name, party, bio)` - Submit nomination
- `withdrawNomination(electionId)` - Withdraw pending nomination

### Admin Functions
- `createElection(name, startTime, endTime, constituency)` - Create election
- `verifyVoter(voterAddress, status)` - Verify/reject voter (status: 2=Verified, 3=Rejected)
- `verifyCandidate(electionId, candidateAddress, status)` - Verify/reject candidate
- `addParty(name, symbol)` - Add political party
- `addAdmin(address, role)` - Grant admin role
- `endElection(electionId)` - End election after endTime
- `pause()` / `unpause()` - Emergency pause (owner only)

## Status Codes

- **0**: None (not registered)
- **1**: Pending (awaiting verification)
- **2**: Verified (approved)
- **3**: Rejected (denied)
- **4**: Withdrawn (candidate withdrew)

## Project Structure

```
src/
├── App.js                          # Main application component
├── App.css                         # Global styles
├── config.js                       # Contract address and ABI
├── components/
│   ├── Header.js                   # Wallet connection header
│   ├── Message.js                  # Success/error messages
│   ├── Tabs.js                     # Navigation tabs
│   ├── ElectionsTab.js             # View all elections
│   ├── RegisterTab.js              # Voter registration
│   ├── NominateTab.js              # Candidate nomination
│   ├── VoteTab.js                  # Cast vote
│   ├── CreateElectionTab.js        # Admin: Create elections
│   ├── VerifyVotersTab.js          # Admin: Verify voters
│   ├── VerifyCandidatesTab.js      # Admin: Verify candidates
│   ├── ManagePartiesTab.js         # Admin: Manage parties
│   └── ManageAdminsTab.js          # Admin: Manage admins
```

## Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Role-Based Access**: Different permission levels
- **Off-chain Identity**: Aadhaar hashed off-chain
- **IPFS Metadata**: Candidate bios stored on IPFS
- **Time-Locked Voting**: Elections only active during specified time range

## Development

Built with:
- React 18
- ethers.js v6
- Solidity 0.8.20
- OpenZeppelin Contracts

## License

MIT
