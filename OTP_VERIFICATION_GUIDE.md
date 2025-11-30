# OTP Verification System

## Overview
The voting DApp now includes OTP (One-Time Password) verification to ensure only authorized voters can register. This adds an extra layer of security by verifying the voter's identity through their registered mobile number or email.

## How It Works

### 1. Voter Database
- Aadhaar numbers, names, mobile numbers, and emails are pre-registered in `public/voters-database.json`
- Only voters in this database can register
- Database is loaded when the registration page opens

### 2. Registration Flow

#### Step 1: Enter Aadhaar
- User enters their 12-digit Aadhaar number
- System validates it exists in the database
- If not found, registration is blocked

#### Step 2: Name Verification
- User enters their name
- System checks if it matches the database
- If mismatch, shows the correct name from database

#### Step 3: OTP Verification
- User selects OTP delivery method (Mobile or Email)
- System generates a 6-digit OTP
- OTP is "sent" (in demo, shown in console and alert)
- User enters the OTP
- System verifies the OTP matches

#### Step 4: Blockchain Registration
- After OTP verification, registration proceeds
- Transaction is submitted to blockchain
- User awaits admin verification

## Demo Voters Database

### Pre-registered Voters:
```json
{
  "aadhaarId": "123456789012",
  "name": "John Doe",
  "mobile": "+1234567890",
  "email": "john@example.com"
}
```

```json
{
  "aadhaarId": "234567890123",
  "name": "Jane Smith",
  "mobile": "+1234567891",
  "email": "jane@example.com"
}
```

```json
{
  "aadhaarId": "345678901234",
  "name": "Bob Johnson",
  "mobile": "+1234567892",
  "email": "bob@example.com"
}
```

## Testing the Feature

### Test Case 1: Successful Registration
1. Go to "Register as Voter"
2. Enter Aadhaar: `123456789012`
3. Enter Name: `John Doe`
4. Select an election
5. Click "Verify & Register"
6. Choose Mobile or Email for OTP
7. Click "Send OTP"
8. Check browser console for OTP (also shown in alert)
9. Enter the 6-digit OTP
10. Click "Verify OTP"
11. Registration proceeds to blockchain

### Test Case 2: Invalid Aadhaar
1. Enter Aadhaar: `999999999999`
2. Enter Name: `Test User`
3. Select election
4. Click "Verify & Register"
5. **Expected**: Error message "Aadhaar ID not found in database"

### Test Case 3: Name Mismatch
1. Enter Aadhaar: `123456789012`
2. Enter Name: `Wrong Name`
3. Select election
4. Click "Verify & Register"
5. **Expected**: Error message showing correct name from database

### Test Case 4: Wrong OTP
1. Complete steps 1-7 from Test Case 1
2. Enter wrong OTP: `000000`
3. Click "Verify OTP"
4. **Expected**: Error message "Invalid OTP"
5. Can resend OTP or try again

## Production Implementation

### For Real Deployment:

#### 1. SMS API Integration
Replace the demo OTP sending with actual SMS API:

```javascript
const sendOTP = async () => {
  const newOTP = generateOTP();
  
  // Call SMS API (e.g., Twilio, AWS SNS, etc.)
  await fetch('YOUR_SMS_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: voterData.mobile,
      message: `Your voting registration OTP is: ${newOTP}`
    })
  });
  
  setOtpSent(true);
};
```

#### 2. Email API Integration
For email OTP:

```javascript
const sendEmailOTP = async () => {
  const newOTP = generateOTP();
  
  // Call Email API (e.g., SendGrid, AWS SES, etc.)
  await fetch('YOUR_EMAIL_API_ENDPOINT', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: voterData.email,
      subject: 'Voting Registration OTP',
      body: `Your OTP is: ${newOTP}`
    })
  });
  
  setOtpSent(true);
};
```

#### 3. Secure Database
- Move voters database to a secure backend server
- Use API calls instead of JSON file
- Add encryption for sensitive data
- Implement rate limiting

#### 4. OTP Security
- Set OTP expiration time (e.g., 5 minutes)
- Limit OTP attempts (e.g., 3 tries)
- Add cooldown between OTP requests
- Store OTP hash instead of plain text

## Adding More Voters

### Edit `public/voters-database.json`:

```json
{
  "voters": [
    {
      "aadhaarId": "123456789012",
      "name": "John Doe",
      "mobile": "+1234567890",
      "email": "john@example.com"
    },
    {
      "aadhaarId": "YOUR_AADHAAR",
      "name": "YOUR_NAME",
      "mobile": "+YOUR_MOBILE",
      "email": "your@email.com"
    }
  ]
}
```

## Features

### Security Features
- ✅ Aadhaar validation against database
- ✅ Name verification
- ✅ OTP generation (6-digit random)
- ✅ OTP verification
- ✅ Choice of mobile or email delivery
- ✅ Resend OTP functionality
- ✅ Cancel option at any step

### User Experience
- ✅ Clear step-by-step process
- ✅ Visual feedback at each step
- ✅ Error messages for invalid data
- ✅ Demo OTP shown in console/alert
- ✅ Auto-format Aadhaar input (numbers only, max 12)
- ✅ Auto-format OTP input (numbers only, max 6)
- ✅ Large, easy-to-read OTP input field

### Admin Features
- ✅ Pre-registered voter database
- ✅ Centralized voter management
- ✅ Contact information for communication
- ✅ Audit trail (console logs)

## Troubleshooting

### Issue: "Aadhaar ID not found"
**Solution**: Make sure the Aadhaar is in `public/voters-database.json`

### Issue: "Name mismatch"
**Solution**: Enter the exact name as registered in the database

### Issue: OTP not showing
**Solution**: Check browser console (F12) for the OTP

### Issue: "Invalid OTP"
**Solution**: 
- Check console for correct OTP
- Make sure you entered all 6 digits
- Try resending OTP

### Issue: Database not loading
**Solution**:
- Check `public/voters-database.json` exists
- Check browser console for errors
- Verify JSON format is valid

## Benefits

### For Voters
- ✅ Secure identity verification
- ✅ Prevents unauthorized registration
- ✅ Familiar OTP process
- ✅ Choice of contact method

### For Election Authority
- ✅ Pre-approved voter list
- ✅ Prevents fake registrations
- ✅ Contact information for communication
- ✅ Audit trail of verifications

### For System
- ✅ Additional security layer
- ✅ Reduces admin verification workload
- ✅ Prevents spam registrations
- ✅ Ensures data accuracy

## Summary

The OTP verification system adds a crucial security layer to the voting DApp:

1. **Pre-registration**: Only voters in the database can register
2. **Identity Verification**: Name must match database
3. **Contact Verification**: OTP sent to registered mobile/email
4. **Blockchain Registration**: Only after successful OTP verification

This ensures that only legitimate, pre-approved voters can register for elections! 🔐
