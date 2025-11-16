import { useState, useEffect } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function ResultsTab({ contract, elections, showMessage, isAdmin, adminRole }) {
  const [selectedElection, setSelectedElection] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [electionDetails, setElectionDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsPublished, setResultsPublished] = useState(false);

  useEffect(() => {
    if (contract && selectedElection) {
      loadElectionResults();
    }
  }, [contract, selectedElection]);

  const loadElectionResults = async () => {
    try {
      setLoading(true);
      const election = elections.find(e => e.id === parseInt(selectedElection));
      setElectionDetails(election);

      const result = await contract.getElectionCandidates(selectedElection);
      
      const candidateList = result.candidates.map((address, index) => ({
        address,
        name: result.details[index].name,
        party: result.details[index].party,
        votes: Number(result.details[index].votes),
        status: Number(result.details[index].status),
        bio: result.details[index].bio
      })).filter(c => c.status === STATUS.Verified);

      // Sort by votes (descending)
      candidateList.sort((a, b) => b.votes - a.votes);
      setCandidates(candidateList);

      // Check if results should be visible
      const now = Math.floor(Date.now() / 1000);
      const isEnded = !election.active || now >= election.endTime;
      setResultsPublished(isEnded);
    } catch (error) {
      console.error('Error loading results:', error);
      showMessage('error', 'Failed to load election results');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishResults = () => {
    setResultsPublished(true);
    showMessage('success', 'Results published successfully!');
  };

  // Filter to show only ended elections
  const endedElections = elections.filter(election => {
    const now = Math.floor(Date.now() / 1000);
    return !election.active || now >= election.endTime;
  });

  const isElectionEnded = () => {
    if (!electionDetails) return false;
    const now = Math.floor(Date.now() / 1000);
    return !electionDetails.active || now >= electionDetails.endTime;
  };

  const canPublishResults = isAdmin && (adminRole === 3 || adminRole === 4) && isElectionEnded();

  return (
    <div>
      <h2>Election Results</h2>
      
      <div className="form-group">
        <label>Select Election</label>
        <select
          value={selectedElection}
          onChange={(e) => setSelectedElection(e.target.value)}
          required
        >
          <option value="">Choose an election</option>
          {endedElections.length === 0 ? (
            <option value="" disabled>No ended elections yet</option>
          ) : (
            endedElections.map(election => (
              <option key={election.id} value={election.id}>
                {election.name} - {election.constituency}
              </option>
            ))
          )}
        </select>
      </div>

      {loading && <div className="loading">Loading results...</div>}

      {!loading && selectedElection && electionDetails && (
        <>
          <div className="election-card" style={{marginBottom: '20px'}}>
            <h3>{electionDetails.name}</h3>
            <div className="election-info">
              <p><strong>Constituency:</strong> {electionDetails.constituency}</p>
              <p><strong>Total Votes Cast:</strong> {electionDetails.totalVotes}</p>
              <p><strong>Total Candidates:</strong> {electionDetails.candidateCount}</p>
              <p><strong>Start:</strong> {new Date(electionDetails.startTime * 1000).toLocaleString()}</p>
              <p><strong>End:</strong> {new Date(electionDetails.endTime * 1000).toLocaleString()}</p>
              <span className="status-badge status-ended">Ended</span>
            </div>
          </div>

          {!resultsPublished && canPublishResults && (
            <div style={{marginBottom: '20px', padding: '15px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107'}}>
              <p style={{margin: '0 0 10px 0', color: '#856404'}}>
                <strong>⚠️ Results are not yet published.</strong> Click the button below to make results visible to everyone.
              </p>
              <button 
                className="submit-btn"
                onClick={handlePublishResults}
                style={{width: 'auto', padding: '10px 20px'}}
              >
                Publish Results
              </button>
            </div>
          )}

          {!resultsPublished && !canPublishResults && (
            <div className="loading" style={{background: '#f0f4ff', padding: '20px', borderRadius: '8px'}}>
              <p>🔒 Results will be published by the Election Authority after the election ends.</p>
            </div>
          )}

          {resultsPublished && candidates.length === 0 && (
            <div className="loading">No candidates participated in this election</div>
          )}

          {resultsPublished && candidates.length > 0 && (
            <>
              <h3 style={{marginBottom: '15px'}}>Final Results</h3>
              <div className="results-list">
                {candidates.map((candidate, index) => (
                  <div 
                    key={candidate.address} 
                    className="result-card"
                    style={{
                      border: index === 0 ? '3px solid #4caf50' : '2px solid #e0e0e0',
                      background: index === 0 ? '#f1f8f4' : 'white'
                    }}
                  >
                    <div className="result-rank">
                      {index === 0 && '🏆 '}
                      #{index + 1}
                    </div>
                    <div className="result-info">
                      <h4>{candidate.name}</h4>
                      <p><strong>Party:</strong> {candidate.party}</p>
                      <p><strong>Address:</strong> {candidate.address.slice(0, 6)}...{candidate.address.slice(-4)}</p>
                    </div>
                    <div className="result-votes">
                      <div className="vote-count-large">{candidate.votes}</div>
                      <div className="vote-label">votes</div>
                      {electionDetails.totalVotes > 0 && (
                        <div className="vote-percentage">
                          {((candidate.votes / electionDetails.totalVotes) * 100).toFixed(1)}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default ResultsTab;
