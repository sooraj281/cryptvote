import { useState } from 'react';

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

  const handleSubmit = async (e) => {
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

    try {
      setSubmitting(true);
      const tx = await contract.registerVoter(
        formData.name,
        formData.aadhaarId,
        formData.electionId
      );
      
      showMessage('success', 'Registration submitted! Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Registration successful! Awaiting verification.');
      
      setFormData({ name: '', aadhaarId: '', electionId: '' });
      loadVoterStatus(contract, account);
    } catch (error) {
      console.error('Error registering:', error);
      showMessage('error', error.reason || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
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

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Aadhaar ID (Hashed)</label>
          <input
            type="text"
            value={formData.aadhaarId}
            onChange={(e) => setFormData({...formData, aadhaarId: e.target.value})}
            placeholder="Enter hashed Aadhaar ID"
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
        <button type="submit" className="submit-btn" disabled={submitting}>
          {submitting ? 'Submitting...' : 'Register'}
        </button>
      </form>
    </div>
  );
}

export default RegisterTab;
