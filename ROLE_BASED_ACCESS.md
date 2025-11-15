# Role-Based Access Control

## Overview
The Voting DApp now implements role-based access control, showing only relevant admin tabs based on the user's assigned role.

## Admin Roles

### 1. Super Admin (Role 1) 👑
**Full Control** - Has access to ALL admin functions

**Permissions:**
- ✅ Manage Admins (add other admins)
- ✅ Create Elections
- ✅ Verify Voters
- ✅ Verify Candidates

**Tabs Visible:**
- Elections
- Register as Voter
- Nominate as Candidate
- Cast Vote
- **Manage Admins** ⭐
- **Create Election** ⭐
- **Verify Voters** ⭐
- **Verify Candidates** ⭐

---

### 2. Election Authority (Role 2) 📋
**Election Management** - Can create and manage elections

**Permissions:**
- ✅ Create Elections
- ✅ End Elections (after time expires)
- ❌ Cannot add admins
- ❌ Cannot verify voters
- ❌ Cannot verify candidates

**Tabs Visible:**
- Elections
- Register as Voter
- Nominate as Candidate
- Cast Vote
- **Create Election** ⭐

---

### 3. Polling Officer (Role 3) ✓
**Voter Verification** - Can verify voter registrations

**Permissions:**
- ✅ Verify Voters (approve/reject)
- ❌ Cannot create elections
- ❌ Cannot add admins
- ❌ Cannot verify candidates

**Tabs Visible:**
- Elections
- Register as Voter
- Nominate as Candidate
- Cast Vote
- **Verify Voters** ⭐

---

### 4. Locality Officer (Role 4) 🎯
**Candidate Verification** - Can verify candidate nominations

**Permissions:**
- ✅ Verify Candidates (approve/reject)
- ❌ Cannot create elections
- ❌ Cannot add admins
- ❌ Cannot verify voters

**Tabs Visible:**
- Elections
- Register as Voter
- Nominate as Candidate
- Cast Vote
- **Verify Candidates** ⭐

---

## How It Works

### 1. Role Detection
When a user connects their wallet:
```javascript
const adminInfo = await contract.admins(userAddress);
const role = Number(adminInfo.role);
const isActive = adminInfo.active;
```

### 2. Tab Visibility
Tabs are shown based on role:
- **Super Admin (1)**: Sees all admin tabs
- **Election Authority (2)**: Sees only "Create Election"
- **Polling Officer (3)**: Sees only "Verify Voters"
- **Locality Officer (4)**: Sees only "Verify Candidates"

### 3. Role Display
The user's role is displayed in the header next to their wallet address:
- "Super Admin" badge
- "Election Authority" badge
- "Polling Officer" badge
- "Locality Officer" badge

## Granting Roles

### As Super Admin
Only Super Admins can grant roles to other addresses:

1. Connect with Super Admin wallet
2. Go to "Manage Admins" tab
3. Enter the wallet address
4. Select the role:
   - Super Admin (1)
   - Election Authority (2)
   - Polling Officer (3)
   - Locality Officer (4)
5. Submit transaction

### Smart Contract Function
```solidity
function addAdmin(address _admin, Role _role) 
    external 
    onlyAdmin(Role.SuperAdmin)
```

## Security Features

### 1. Contract-Level Enforcement
Role checks are enforced at the smart contract level:
- `onlyAdmin(Role.SuperAdmin)` - Only Super Admin
- `onlyAdmin(Role.ElectionAuthority)` - Election Authority or higher
- `onlyAdmin(Role.PollingOfficer)` - Polling Officer or higher
- `onlyAdmin(Role.LocalityOfficer)` - Locality Officer or higher

### 2. UI-Level Filtering
The UI only shows tabs the user has permission to access:
- Prevents confusion
- Cleaner interface
- Better user experience

### 3. Component-Level Protection
Even if someone tries to access a restricted tab directly, the component won't render without proper role.

## Example Scenarios

### Scenario 1: Election Setup Team
```
Super Admin (Owner)
├── Election Authority (Creates elections)
├── Polling Officer (Verifies voters)
└── Locality Officer (Verifies candidates)
```

### Scenario 2: Multiple Regions
```
Super Admin (Central Authority)
├── Election Authority (National Level)
├── Polling Officer (Region A)
├── Polling Officer (Region B)
├── Locality Officer (Region A)
└── Locality Officer (Region B)
```

### Scenario 3: Hierarchical Structure
```
Super Admin (Chief Election Commissioner)
├── Super Admin (Deputy Commissioner)
├── Election Authority (State Officer)
│   ├── Polling Officer (District A)
│   └── Polling Officer (District B)
└── Locality Officer (Constituency Officer)
```

## Testing Role-Based Access

### Test as Super Admin
1. Deploy contract (you're automatically Super Admin)
2. Connect wallet
3. Verify you see all admin tabs
4. Test each admin function

### Test as Election Authority
1. Add a new address as Election Authority (role 2)
2. Connect with that wallet
3. Verify you only see "Create Election" tab
4. Try creating an election

### Test as Polling Officer
1. Add a new address as Polling Officer (role 3)
2. Connect with that wallet
3. Verify you only see "Verify Voters" tab
4. Try verifying a voter

### Test as Locality Officer
1. Add a new address as Locality Officer (role 4)
2. Connect with that wallet
3. Verify you only see "Verify Candidates" tab
4. Try verifying a candidate

## Benefits

### 1. Separation of Duties
- Different people handle different tasks
- Reduces risk of single point of failure
- Better accountability

### 2. Scalability
- Easy to add more admins for specific tasks
- Can distribute workload across team
- Regional/hierarchical management possible

### 3. Security
- Principle of least privilege
- Each admin only has necessary permissions
- Reduces attack surface

### 4. User Experience
- Clean, focused interface
- No confusion about available actions
- Clear role indication in header

## Troubleshooting

### "I don't see any admin tabs"
- Check if your address has been granted an admin role
- Verify the role is active in the contract
- Try disconnecting and reconnecting wallet

### "I see wrong tabs for my role"
- Refresh the page
- Check your role in the contract
- Verify you're connected with the correct wallet

### "Transaction fails when using admin function"
- Ensure your role has permission for that function
- Check you have enough ETH for gas
- Verify the contract address is correct

## Code Reference

### App.js
```javascript
const [adminRole, setAdminRole] = useState(0);

// Fetch role on wallet connect
const adminInfo = await contract.admins(accounts[0]);
setAdminRole(Number(adminInfo.role));
```

### Tabs.js
```javascript
// Show tabs based on role
{(adminRole === 1 || adminRole === 2) && (
  <button>Create Election</button>
)}
```

### Header.js
```javascript
// Display role badge
{roleName && (
  <span className="status-badge">{roleName}</span>
)}
```
