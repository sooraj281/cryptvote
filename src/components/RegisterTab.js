import { useState, useEffect } from 'react';
import OTPVerification from './OTPVerification';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function RegisterTab({ contract, elections, voterStatus, showMessage, getStatusText, loadVoterStatus, account }) {
  const [formData, setFormData] = useState({
    name: '',
    aadhaarId: '',
    electionId: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [votersDatabase, setVotersDatabase] = useState([]);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [verifiedVoterData, setVerifiedVoterData] = useState(null);
  const [checking, setChecking] = useState(false);

  // Load voters database
  useEffect(() => {
    fetch('/voters-database.json')
      .then(res => res.json())
      .then(data => {
        setVotersDatabase(data.voters);
        console.log('Loaded voters database:', data.voters.length, 'voters');
      })
      .catch(error => {
        console.error('Error loading voters database:', error);
        showMessage('error', 'Failed to load voters database');
      });
  }, []);

  const handleAadhaarCheck = async (e) => {
    e.preventDefault();
    if (!contract) return;

    // Check if election has ended
    const selectedElection = elections.find(e => e.id === parseInt(formData.electionId));
    if (selectedElection) {
      const now = Math.floor(Date.now() / 1000);
      if (now >= selectedElection.endTime) {
        showMessage('error', 'Cannot register for an ended election');
        return;
      }
    }

    setChecking(true);

    // Check if Aadhaar exists in database
    const voterData = votersDatabase.find(v => v.aadhaarId === formData.aadhaarId);
    
    if (!voterData) {
      showMessage('error', 'Aadhaar ID not valid. Please contact election authority.');
      setChecking(false);
      return;
    }

    // Auto-fill name if it matches
    if (formData.name && formData.name.toLowerCase() !== voterData.name.toLowerCase()) {
      showMessage('error', `Name mismatch!Enter the correct Name !`);
      setChecking(false);
      return;
    }

    // Set verified voter data and show OTP modal
    setVerifiedVoterData(voterData);
    setShowOTPModal(true);
    setChecking(false);
  };

  const handleOTPVerified = async () => {
    setShowOTPModal(false);
    
    try {
      setSubmitting(true);
      const tx = await contract.registerVoter(
        verifiedVoterData.name,
        formData.aadhaarId,
        formData.electionId
      );
      
      showMessage('success', 'Registration submitted! Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Registration successful! Awaiting verification.');
      
      setFormData({ name: '', aadhaarId: '', electionId: '' });
      setVerifiedVoterData(null);
      loadVoterStatus(contract, account);
    } catch (error) {
      console.error('Error registering:', error);
      showMessage('error', error.reason || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPCancel = () => {
    setShowOTPModal(false);
    setVerifiedVoterData(null);
  };

  // Filter elections to show only active or upcoming ones
  const availableElections = elections.filter(election => {
    const now = Math.floor(Date.now() / 1000);
    return election.active && now < election.endTime;
  });

  return (
    <div>
      <h2>Register as Voter</h2>
      
      {voterStatus && voterStatus.status !== STATUS.None && (
        <div className="voter-status">
          <h3>Your Voter Status</h3>
          <p><strong>Name:</strong> {voterStatus.name}</p>
          <p><strong>Election ID:</strong> {voterStatus.electionId}</p>
          <p><strong>Status:</strong> <span className={`status-badge status-${getStatusText(voterStatus.status).toLowerCase()}`}>
            {getStatusText(voterStatus.status)}
          </span></p>
          <p><strong>Has Voted:</strong> {voterStatus.hasVoted ? 'Yes' : 'No'}</p>
        </div>
      )}

      <div className="info-box" style={{marginBottom: '20px', padding: '15px', background: '#e3f2fd', borderRadius: '8px'}}>
        <p style={{margin: 0, color: '#1565c0', fontSize: '14px'}}>
          ℹ️ Your Aadhaar must be registered in the election database. OTP verification will be required.
        </p>
      </div>

      <form onSubmit={handleAadhaarCheck}>
        <div className="form-group">
          <label>Aadhaar ID</label>
          <input
            type="text"
            value={formData.aadhaarId}
            onChange={(e) => setFormData({...formData, aadhaarId: e.target.value.replace(/\D/g, '').slice(0, 12)})}
            placeholder="Enter 12-digit Aadhaar number"
            maxLength="12"
            required
          />
          
        </div>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="form-group">
          <label>Select Election</label>
          <select
            value={formData.electionId}
            onChange={(e) => setFormData({...formData, electionId: e.target.value})}
            required
          >
            <option value="">Choose an election</option>
            {availableElections.length === 0 ? (
              <option value="" disabled>No active elections available</option>
            ) : (
              availableElections.map(election => {
                const now = Math.floor(Date.now() / 1000);
                const status = now < election.startTime ? ' (Upcoming)' : ' (Active)';
                return (
                  <option key={election.id} value={election.id}>
                    {election.name} - {election.constituency}{status}
                  </option>
                );
              })
            )}
          </select>
        </div>
        <button type="submit" className="submit-btn" disabled={submitting || checking}>
          {checking ? 'Verifying Aadhaar...' : submitting ? 'Submitting...' : 'Verify & Register'}
        </button>
      </form>

      {showOTPModal && verifiedVoterData && (
        <OTPVerification
          voterData={verifiedVoterData}
          onVerified={handleOTPVerified}
          onCancel={handleOTPCancel}
        />
      )}
    </div>
  );
}

export default RegisterTab;
