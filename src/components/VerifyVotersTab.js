import { useState } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function VerifyVotersTab({ contract, showMessage, elections }) {
  const [viewMode, setViewMode] = useState('search'); // 'search' or 'list'
  const [selectedElection, setSelectedElection] = useState('');
  const [pendingVoters, setPendingVoters] = useState([]);
  const [voterAddress, setVoterAddress] = useState('');
  const [voterInfo, setVoterInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadVoterInfo = async () => {
    const trimmedAddress = voterAddress.trim();

    if (!trimmedAddress || !contract) {
      showMessage('error', 'Please enter a valid address');
      return;
    }

    // Basic validation for Ethereum address format
    if (!trimmedAddress.startsWith('0x') || trimmedAddress.length !== 42) {
      showMessage('error', 'Invalid address format. Address should start with 0x and be 42 characters long');
      return;
    }

    try {
      setLoading(true);
      const status = await contract.getVoterStatus(trimmedAddress);
      setVoterInfo({
        address: trimmedAddress,
        name: status.name,
        aadhaarId: status.aadhaarId,
        electionId: Number(status.electionId),
        status: Number(status.status),
        hasVoted: status.hasVoted
      });
    } catch (error) {
      console.error('Error loading voter info:', error);
      showMessage('error', 'Failed to load voter information. Please check the address.');
      setVoterInfo(null);
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
      // Reload voter info to show updated status
      loadVoterInfo();
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
      // Reload voter info to show updated status
      loadVoterInfo();
    } catch (error) {
      console.error('Error rejecting voter:', error);
      showMessage('error', error.reason || 'Failed to reject voter');
    }
  };

  const getStatusText = (status) => {
    const statusMap = ['None', 'Pending', 'Verified', 'Rejected', 'Withdrawn'];
    return statusMap[status] || 'Unknown';
  };

  // === NEW / FIXED: load pending voters ===
  const loadPendingVotersByElection = async () => {
    if (!selectedElection) {
      showMessage('error', 'Please select an election');
      return;
    }
    if (!contract) {
      showMessage('error', 'Contract not loaded');
      return;
    }

    setLoading(true);
    try {
      // Preferred: use the contract view that already returns pending voters
      // getPendingVoters() returns (address[] addr, string[] names, string[] aadhaar, uint256[] eids)
      try {
        const result = await contract.getPendingVoters();
        // result is a tuple-like array; destructure defensively
        const addrs = result[0] || [];
        const names = result[1] || [];
        const aadhaars = result[2] || [];
        const eids = result[3] || [];

        const selectedId = parseInt(selectedElection, 10);

        const voters = [];
        for (let i = 0; i < addrs.length; i++) {
          // filter by election id returned by the contract view
          if (Number(eids[i]) === selectedId) {
            voters.push({
              address: addrs[i],
              name: names[i],
              aadhaarId: aadhaars[i],
              electionId: Number(eids[i]),
              status: STATUS.Pending,
              hasVoted: false // contract view doesn't return hasVoted; if required, fetch individually
            });
          }
        }

        setPendingVoters(voters);
        if (voters.length === 0) showMessage('info', 'No pending voters found for this election');
        else showMessage('success', `Found ${voters.length} pending voter(s)`);
        return;
      } catch (readErr) {
        // If getPendingVoters fails (older ABI or node problem), fall back to event scanning.
        console.warn('getPendingVoters() failed, falling back to event scan:', readErr);
      }

      // === Fallback: scan VoterRegistered events and parallel-fetch status ===
      const filter = contract.filters.VoterRegistered();
      // If your provider supports it, specifying fromBlock (e.g. 0) is more reliable,
      // but can be expensive. You can tune fromBlock to contract deployment block if known.
      const events = await contract.queryFilter(filter);
      console.log(`Found ${events.length} registration events (fallback)`);

      const selectedId = parseInt(selectedElection, 10);
      const unique = new Set();
      const addressesToCheck = [];

      for (const ev of events) {
        const addr = ev.args?.voter;
        const eid = Number(ev.args?.electionId);
        if (!addr) continue;
        if (eid !== selectedId) continue;
        if (unique.has(addr)) continue;
        unique.add(addr);
        addressesToCheck.push(addr);
      }

      // Parallel status fetch (Promise.allSettled to avoid failing everything)
      const statusPromises = addressesToCheck.map(addr =>
        contract.getVoterStatus(addr).then(s => ({ addr, s }))
      );

      const settled = await Promise.allSettled(statusPromises);
      const voters = [];
      for (const res of settled) {
        if (res.status === 'fulfilled') {
          const { addr, s } = res.value;
          const electionId = Number(s.electionId);
          const voterStatus = Number(s.status);
          if (electionId === selectedId && voterStatus === STATUS.Pending) {
            voters.push({
              address: addr,
              name: s.name,
              aadhaarId: s.aadhaarId,
              electionId,
              status: voterStatus,
              hasVoted: s.hasVoted
            });
          }
        } else {
          console.warn('Status fetch error (skipped):', res.reason);
        }
      }

      setPendingVoters(voters);
      if (voters.length === 0) showMessage('info', 'No pending voters found for this election (fallback)');
      else showMessage('success', `Found ${voters.length} pending voter(s) (fallback)`);
    } catch (error) {
      console.error('Error loading pending voters:', error);
      showMessage('error', `Failed to load pending voters: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFromList = async (voterAddress) => {
    try {
      const tx = await contract.verifyVoter(voterAddress, STATUS.Verified);
      showMessage('success', 'Verifying voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter verified successfully!');
      loadPendingVotersByElection();
    } catch (error) {
      console.error('Error verifying voter:', error);
      showMessage('error', error.reason || 'Failed to verify voter');
    }
  };

  const handleRejectFromList = async (voterAddress) => {
    try {
      const tx = await contract.verifyVoter(voterAddress, STATUS.Rejected);
      showMessage('success', 'Rejecting voter... Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Voter rejected successfully!');
      loadPendingVotersByElection();
    } catch (error) {
      console.error('Error rejecting voter:', error);
      showMessage('error', error.reason || 'Failed to reject voter');
    }
  };

  return (
    <div>
      <h2>Verify Voters</h2>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button
          className={`tab-btn ${viewMode === 'search' ? 'active' : ''}`}
          onClick={() => setViewMode('search')}
        >
          Search Address
        </button>
        <button
          className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          Batch Verify
        </button>
      </div>

      {viewMode === 'search' && (
        <>
          <div className="form-group">
            <label>Voter Address</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={voterAddress}
                onChange={(e) => setVoterAddress(e.target.value)} // do not trim every keystroke
                placeholder="0x..."
                style={{ flex: 1 }}
              />
              <button
                className="submit-btn"
                onClick={loadVoterInfo}
                disabled={loading || !voterAddress.trim()}
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                {loading ? 'Loading...' : 'Check Status'}
              </button>
            </div>
          </div>

          {voterInfo && (
            <div className="verification-card" style={{ marginTop: '20px' }}>
              <div className="verification-info">
                <h4>{voterInfo.name || 'Not Registered'}</h4>
                <p><strong>Address:</strong> {voterInfo.address}</p>
                <p><strong>Aadhaar ID:</strong> {voterInfo.aadhaarId || 'N/A'}</p>
                <p><strong>Election ID:</strong> {voterInfo.electionId || 'N/A'}</p>
                <p><strong>Status:</strong> <span className={`status-badge status-${getStatusText(voterInfo.status).toLowerCase()}`}>
                  {getStatusText(voterInfo.status)}
                </span></p>
                <p><strong>Has Voted:</strong> {voterInfo.hasVoted ? 'Yes' : 'No'}</p>
              </div>

              {voterInfo.status === STATUS.Pending && (
                <div className="verification-actions">
                  <button
                    className="verify-btn"
                    onClick={() => handleVerify(voterInfo.address)}
                  >
                    Verify
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => handleReject(voterInfo.address)}
                  >
                    Reject
                  </button>
                </div>
              )}

              {voterInfo.status === STATUS.Verified && (
                <p style={{ color: '#4caf50', fontWeight: 'bold' }}>✓ Already Verified</p>
              )}

              {voterInfo.status === STATUS.Rejected && (
                <p style={{ color: '#f44336', fontWeight: 'bold' }}>✗ Already Rejected</p>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'list' && (
        <>
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

          <button
            className="submit-btn"
            onClick={loadPendingVotersByElection}
            disabled={loading || !selectedElection}
            style={{ marginBottom: '20px' }}
          >
            {loading ? 'Loading Pending Voters...' : 'Load Pending Voters'}
          </button>

          {loading && (
            <div className="loading">
              <p>Fetching voter registrations from blockchain...</p>
              <p style={{ fontSize: '14px', color: '#666' }}>This may take a moment...</p>
            </div>
          )}

          {pendingVoters.length > 0 && (
            <div style={{ marginTop: '30px' }}>
              <h3>Pending Voters ({pendingVoters.length})</h3>
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
                        onClick={() => handleVerifyFromList(voter.address)}
                      >
                        Verify
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleRejectFromList(voter.address)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default VerifyVotersTab;
