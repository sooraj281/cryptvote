import React, { useState, useEffect } from 'react';

const STATUS = {
  None: 0,
  Pending: 1,
  Verified: 2,
  Rejected: 3,
  Withdrawn: 4
};

function VoteTab({ contract, voterStatus, showMessage, loadVoterStatus, account }) {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contract && voterStatus && voterStatus.electionId > 0) {
      loadCandidates();
    }
  }, [contract, voterStatus]);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      const result = await contract.getElectionCandidates(voterStatus.electionId);
      
      const candidateList = result.candidates.map((address, index) => ({
        address,
        name: result.details[index].name,
        party: result.details[index].party,
        votes: Number(result.details[index].votes),
        status: Number(result.details[index].status),
        bio: result.details[index].bio
      })).filter(c => c.status === STATUS.Verified);

      setCandidates(candidateList);
    } catch (error) {
      console.error('Error loading candidates:', error);
      showMessage('error', 'Failed to load candidates');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!contract || !selectedCandidate) return;

    try {
      setSubmitting(true);
      const tx = await contract.castVote(voterStatus.electionId, selectedCandidate);
      
      showMessage('success', 'Vote submitted! Waiting for confirmation...');
      await tx.wait();
      showMessage('success', 'Vote cast successfully!');
      
      loadVoterStatus(contract, account);
      loadCandidates();
    } catch (error) {
      console.error('Error casting vote:', error);
      showMessage('error', error.reason || 'Failed to cast vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (!voterStatus || voterStatus.status !== STATUS.Verified) {
    return (
      <div className="loading">
        You must be a verified voter to cast a vote. Please register and wait for verification.
      </div>
    );
  }

  if (voterStatus.hasVoted) {
    return (
      <div className="loading">
        You have already cast your vote in this election. Thank you for participating!
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading candidates...</div>;
  }

  return (
    <div>
      <h2>Cast Your Vote</h2>
      <p style={{marginBottom: '20px', color: '#666'}}>
        Election ID: {voterStatus.electionId}
      </p>
      
      {candidates.length === 0 ? (
        <div className="loading">No verified candidates available</div>
      ) : (
        <>
          <div className="candidates-grid">
            {candidates.map(candidate => (
              <div
                key={candidate.address}
                className={`candidate-card ${selectedCandidate === candidate.address ? 'selected' : ''}`}
                onClick={() => setSelectedCandidate(candidate.address)}
              >
                <h4>{candidate.name}</h4>
                <p className="candidate-info"><strong>Party:</strong> {candidate.party}</p>
                <p className="candidate-info"><strong>Address:</strong> {candidate.address.slice(0, 6)}...{candidate.address.slice(-4)}</p>
                <div className="vote-count">{candidate.votes} votes</div>
              </div>
            ))}
          </div>
          
          <button 
            className="submit-btn" 
            onClick={handleVote}
            disabled={!selectedCandidate || submitting}
            style={{marginTop: '20px'}}
          >
            {submitting ? 'Submitting Vote...' : 'Cast Vote'}
          </button>
        </>
      )}
    </div>
  );
}

export default VoteTab;
