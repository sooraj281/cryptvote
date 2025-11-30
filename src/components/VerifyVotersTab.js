import { useState, useEffect } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function VerifyVotersTab({ contract, showMessage, elections }) {
  const [selectedElection, setSelectedElection] = useState('');
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && selectedElection) {
      loadPendingVoters();
    }
  }, [contract, selectedElection]);

  const loadPendingVoters = async () => {
    try {
      setLoading(true);
      console.log('Loading pending voters...');

      const result = await contract.getPendingVoters();

      const voterList = result.addr.map((address, index) => ({
        address,
        name: result.names[index],
        aadhaarId: result.aadhaar[index],
        electionId: Number(result.eids[index])
      })).filter(v => selectedElection ? v.electionId === parseInt(selectedElection) : true);

      console.log(`Found ${voterList.length} pending voters`);
      setPendingVoters(voterList);

      if (voterList.length === 0) {
        showMessage('info', 'No pending voters for this election');
      } else {
        showMessage('success', `Found ${voterList.length} pending voter(s)`);
      }
    } catch (error) {
      console.error('Error loading pending voters:', error);
      showMessage('error', 'Failed to load pending voters');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (voterAddress) => {
    try {
      const tx = await contract.verifyVoter(voterAddress, STATUS.Verified);
      showMessage('success', 'Verifying voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter verified successfully!');
      loadPendingVoters();
    } catch (error) {
      console.error('Error verifying voter:', error);
      showMessage('error', error.reason || 'Failed to verify voter');
    }
  };

  const handleReject = async (voterAddress) => {
    try {
      const tx = await contract.verifyVoter(voterAddress, STATUS.Rejected);
      showMessage('success', 'Rejecting voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter rejected successfully!');
      loadPendingVoters();
    } catch (error) {
      console.error('Error rejecting voter:', error);
      showMessage('error', error.reason || 'Failed to reject voter');
    }
  };

  return (
    <div>
      <h2>Verify Voters</h2>

      <div className="form-group">
        <label>Select Election</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          required
        >
          <option value="">Choose an election</option>
          {elections.map(election => (
            <option key={election.id} value={election.id}>
              {election.name} - {election.constituency}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="loading">
          <p>Loading pending voters...</p>
        </div>
      )}

      {!loading && selectedElection && pendingVoters.length > 0 && (
        <>
          <h3 style={{ marginTop: '20px', marginBottom: '15px' }}>
            Pending Voters ({pendingVoters.length})
          </h3>
          <div className="verification-list">
            {pendingVoters.map(voter => (
              <div key={voter.address} className="verification-card">
                <div className="verification-info">
                  <h4>{voter.name}</h4>
                  <p><strong>Address:</strong> {voter.address}</p>
                  <p><strong>Aadhaar ID:</strong> {voter.aadhaarId}</p>
                  <p><strong>Election ID:</strong> {voter.electionId}</p>
                </div>
                <div className="verification-actions">
                  <button
                    className="verify-btn"
                    onClick={() => handleVerify(voter.address)}
                  >
                    Verify
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(voter.address)}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default VerifyVotersTab;