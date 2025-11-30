import { useState, useEffect } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function VerifyCandidatesTab({ contract, elections, showMessage }) {
  const [selectedElection, setSelectedElection] = useState('');
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contract && selectedElection) {
      loadPendingCandidates();
    }
  }, [contract, selectedElection]);

  const loadPendingCandidates = async () => {
    try {
      setLoading(true);
      console.log('Loading candidates for election:', selectedElection);
      
      const result = await contract.getElectionCandidates(selectedElection);
      
      const candidateList = result.candidates.map((address, index) => ({
        address,
        name: result.details[index].name,
        party: result.details[index].party,
        bio: result.details[index].bio,
        status: Number(result.details[index].status)
      })).filter(c => c.status === STATUS.Pending);

      console.log(`Found ${candidateList.length} pending candidates`);
      setPendingCandidates(candidateList);
      
      if (candidateList.length === 0) {
        showMessage('info', 'No pending candidates for this election');
      } else {
        showMessage('success', `Found ${candidateList.length} pending candidate(s)`);
      }
    } catch (error) {
      console.error('Error loading pending candidates:', error);
      showMessage('error', 'Failed to load pending candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (candidateAddress) => {
    try {
      // Status.Verified = 2
      const tx = await contract.verifyCandidate(selectedElection, candidateAddress, 2);
      showMessage('success', 'Verifying candidate... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Candidate verified successfully!');
      loadPendingCandidates();
    } catch (error) {
      console.error('Error verifying candidate:', error);
      showMessage('error', error.reason || 'Failed to verify candidate');
    }
  };

  const handleReject = async (candidateAddress) => {
    try {
      // Status.Rejected = 3
      const tx = await contract.verifyCandidate(selectedElection, candidateAddress, 3);
      showMessage('success', 'Rejecting candidate... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Candidate rejected successfully!');
      loadPendingCandidates();
    } catch (error) {
      console.error('Error rejecting candidate:', error);
      showMessage('error', error.reason || 'Failed to reject candidate');
    }
  };

  return (
    <div>
      <h2>Verify Candidates</h2>
      
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
          <p>Loading pending candidates...</p>
        </div>
      )}

      {!loading && selectedElection && pendingCandidates.length > 0 && (
        <>
          <h3 style={{marginTop: '20px', marginBottom: '15px'}}>
            Pending Candidates ({pendingCandidates.length})
          </h3>
          <div className="verification-list">
            {pendingCandidates.map(candidate => (
              <div key={candidate.address} className="verification-card">
                <div className="verification-info">
                  <h4>{candidate.name}</h4>
                  <p><strong>Address:</strong> {candidate.address}</p>
                  <p><strong>Party:</strong> {candidate.party}</p>
                  <p><strong>Bio (IPFS):</strong> {candidate.bio}</p>
                </div>
                <div className="verification-actions">
                  <button 
                    className="verify-btn"
                    onClick={() => handleVerify(candidate.address)}
                  >
                    Verify
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(candidate.address)}
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

export default VerifyCandidatesTab;
