import React from 'react';

function ElectionsTab({ elections, loading, isElectionActive, formatDate }) {
  if (loading) {
    return <div className="loading">Loading elections...</div>;
  }

  if (elections.length === 0) {
    return <div className="loading">No elections found</div>;
  }

  return (
    <div className="election-list">
      <h2>All Elections</h2>
      {elections.map(election => (
        <div key={election.id} className="election-card">
          <h3>{election.name}</h3>
          <div className="election-info">
            <p><strong>Constituency:</strong> {election.constituency}</p>
            <p><strong>Start:</strong> {formatDate(election.startTime)}</p>
            <p><strong>End:</strong> {formatDate(election.endTime)}</p>
            <p><strong>Total Votes:</strong> {election.totalVotes}</p>
            <p><strong>Candidates:</strong> {election.candidateCount}</p>
            <span className={`status-badge ${isElectionActive(election) ? 'status-active' : 'status-ended'}`}>
              {isElectionActive(election) ? 'Active' : 'Ended'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ElectionsTab;
