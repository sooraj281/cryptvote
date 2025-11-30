import { useState } from 'react';

function OTPVerification({ voterData, onVerified, onCancel }) {
  const [otp, setOtp] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [contactMethod, setContactMethod] = useState('mobile'); // 'mobile' or 'email'

  const generateOTP = () => {
    // Generate 6-digit OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOTP(newOTP);
    return newOTP;
  };

  const sendOTP = async () => {
    const newOTP = generateOTP();
    setOtpSent(true);

    // In production, this would call an actual SMS/Email API
    // For demo, we'll just log it
    console.log('=================================');
    console.log('📱 OTP SENT');
    console.log('=================================');
    console.log(`Name: ${voterData.name}`);
    console.log(`Aadhaar: ${voterData.aadhaarId}`);
    if (contactMethod === 'mobile') {
      console.log(`Mobile: ${voterData.mobile}`);
    } else {
      console.log(`Email: ${voterData.email}`);
    }
    console.log(`OTP: ${newOTP}`);
    console.log('=================================');

    // Show alert for demo purposes
    alert(`OTP sent to ${contactMethod === 'mobile' ? voterData.mobile : voterData.email}\n\nFor demo: Your OTP is ${newOTP}\n\n(Check browser console for details)`);
  };

  const verifyOTP = () => {
    setVerifying(true);
    
    setTimeout(() => {
      if (otp === generatedOTP) {
        alert('✅ OTP Verified Successfully!');
        onVerified();
      } else {
        alert('❌ Invalid OTP. Please try again.');
        setVerifying(false);
      }
    }, 500);
  };

  return (
    <div className="otp-verification-overlay">
      <div className="otp-verification-modal">
        <h3>🔐 Verify Your Identity</h3>
        
        <div className="voter-details" style={{
          background: '#f0f4ff',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <p><strong>Name:</strong> {voterData.name}</p>
          <p><strong>Aadhaar:</strong> {voterData.aadhaarId}</p>
         
        </div>

        {!otpSent ? (
          <>
            <div className="form-group">
              <label>Send OTP via:</label>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <input
                    type="radio"
                    value="mobile"
                    checked={contactMethod === 'mobile'}
                    onChange={(e) => setContactMethod(e.target.value)}
                  />
                  📱 Mobile 
                </label>
                <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                  <input
                    type="radio"
                    value="email"
                    checked={contactMethod === 'email'}
                    onChange={(e) => setContactMethod(e.target.value)}
                  />
                  📧 Email 
                </label>
              </div>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button className="submit-btn" onClick={sendOTP}>
                Send OTP
              </button>
              <button 
                className="submit-btn" 
                onClick={onCancel}
                style={{background: '#666'}}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                style={{
                  fontSize: '24px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              />
              <p style={{fontSize: '12px', color: '#666', marginTop: '5px'}}>
                OTP sent to {contactMethod === 'mobile' ? voterData.mobile : voterData.email}
              </p>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
              <button 
                className="submit-btn" 
                onClick={verifyOTP}
                disabled={otp.length !== 6 || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button 
                className="submit-btn" 
                onClick={sendOTP}
                style={{background: '#ff9800'}}
              >
                Resend OTP
              </button>
              <button 
                className="submit-btn" 
                onClick={onCancel}
                style={{background: '#666'}}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OTPVerification;
