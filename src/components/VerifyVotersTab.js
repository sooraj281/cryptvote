import { useState, useEffect } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function VerifyVotersTab({ contract, showMessage }) {
  const [pendingVoters, setPendingVoters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'search'
  const [searchAddress, setSearchAddress] = useState('');
  const [searchedVoter, setSearchedVoter] = useState(null);

  const loadPendingVoters = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      const result = await contract.getPendingVoters();
      
      const voterList = result.addr.map((address, index) => ({
        address,
        name: result.names[index],
        aadhaarId: result.aadhaar[index],
        electionId: Number(result.eids[index])
      }));
      
      setPendingVoters(voterList);
    } catch (error) {
      console.error('Error loading pending voters:', error);
      showMessage('error', 'Failed to load pending voters');
    } finally {
      setLoading(false);
    }
  };

  const loadVoterInfo = async () => {
    if (!searchAddress || !contract) return;
    
    try {
      setLoading(true);
      const status = await contract.getVoterStatus(searchAddress);
      setSearchedVoter({
        address: searchAddress,
        name: status.name,
        aadhaarId: status.aadhaarId,
        electionId: Number(status.electionId),
        status: Number(status.status),
        hasVoted: status.hasVoted
      });
    } catch (error) {
      console.error('Error loading voter info:', error);
      showMessage('error', 'Failed to load voter information');
      setSearchedVoter(null);
    } finally {
      setLoading(false);
    }
  };

  // Load pending voters on mount
  useEffect(() => {
    if (contract && viewMode === 'list') {
      loadPendingVoters();
    }
  }, [contract, viewMode]);

  const handleVerify = async (voterAddress) => {
    try {
      // Status.Verified = 2
      const tx = await contract.verifyVoter(voterAddress, 2);
      showMessage('success', 'Verifying voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter verified successfully!');
      // Reload pending voters list
      if (viewMode === 'list') {
        loadPendingVoters();
      } else {
        loadVoterInfo();
      }
    } catch (error) {
      console.error('Error verifying voter:', error);
      showMessage('error', error.reason || 'Failed to verify voter');
    }
  };

  const handleReject = async (voterAddress) => {
    try {
      // Status.Rejected = 3
      const tx = await contract.verifyVoter(voterAddress, 3);
      showMessage('success', 'Rejecting voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter rejected successfully!');
      // Reload pending voters list
      if (viewMode === 'list') {
        loadPendingVoters();
      } else {
        loadVoterInfo();
      }
    } catch (error) {
      console.error('Error rejecting voter:', error);
      showMessage('error', error.reason || 'Failed to reject voter');
    }
  };

  const getStatusText = (status) => {
    const statusMap = ['None', 'Pending', 'Verified', 'Rejected', 'Withdrawn'];
    return statusMap[status] || 'Unknown';
  };

  return (
    <div>
      <h2>Verify Voters</h2>
      
      {/* View Mode Toggle */}
      <div style={{marginBottom: '20px', display: 'flex', gap: '10px'}}>
        <button 
          className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => { setViewMode('list'); loadPendingVoters(); }}
        >
          Pending List
        </button>
        <button 
          className={`tab-btn ${viewMode === 'search' ? 'active' : ''}`}
          onClick={() => setViewMode('search')}
        >
          Search Address
        </button>
      </div>

      {/* List View - Show all pending voters */}
      {viewMode === 'list' && (
        <>
          {loading && <div className="loading">Loading pending voters...</div>}
          
          {!loading && pendingVoters.length === 0 && (
            <div className="loading">No pending voters at this time</div>
          )}

          {!loading && pendingVoters.length > 0 && (
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
          )}
        </>
      )}

      {/* Search View - Search by address */}
      {viewMode === 'search' && (
        <>
          <div className="form-group">
            <label>Voter Address</label>
            <div style={{display: 'flex', gap: '10px'}}>
              <input
                type="text"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                placeholder="0x..."
                style={{flex: 1}}
              />
              <button 
                className="submit-btn" 
                onClick={loadVoterInfo}
                disabled={loading || !searchAddress}
                style={{width: 'auto', padding: '12px 24px'}}
              >
                {loading ? 'Loading...' : 'Check Status'}
              </button>
            </div>
          </div>

          {searchedVoter && (
            <div className="verification-card" style={{marginTop: '20px'}}>
              <div className="verification-info">
                <h4>{searchedVoter.name || 'Not Registered'}</h4>
                <p><strong>Address:</strong> {searchedVoter.address}</p>
                <p><strong>Aadhaar ID:</strong> {searchedVoter.aadhaarId || 'N/A'}</p>
                <p><strong>Election ID:</strong> {searchedVoter.electionId || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${getStatusText(searchedVoter.status).toLowerCase()}`}>
                  {getStatusText(searchedVoter.status)}
                </span></p>
                <p><strong>Has Voted:</strong> {searchedVoter.hasVoted ? 'Yes' : 'No'}</p>
              </div>
              
              {searchedVoter.status === STATUS.Pending && (
                <div className="verification-actions">
                  <button 
                    className="verify-btn"
                    onClick={() => handleVerify(searchedVoter.address)}
                  >
                    Verify
                  </button>
                  <button 
                    className="reject-btn"
                    onClick={() => handleReject(searchedVoter.address)}
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {searchedVoter.status === STATUS.Verified && (
                <p style={{color: '#4caf50', fontWeight: 'bold'}}>✓ Already Verified</p>
              )}
              
              {searchedVoter.status === STATUS.Rejected && (
                <p style={{color: '#f44336', fontWeight: 'bold'}}>✗ Already Rejected</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VerifyVotersTab;
