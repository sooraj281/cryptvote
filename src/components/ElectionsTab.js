function ElectionsTab({ elections, loading, isElectionActive, formatDate }) {
  const getElectionStatus = (election) => {
    const now = Math.floor(Date.now() / 1000);
    
    if (!election.active) {
      return { text: 'Ended', class: 'status-ended' };
    }
    
    if (now < election.startTime) {
      return { text: 'Not Started', class: 'status-pending' };
    }
    
    if (now >= election.startTime && now < election.endTime) {
      return { text: 'Active', class: 'status-active' };
    }
    
    return { text: 'Ended', class: 'status-ended' };
  };

  if (loading) {
    return <div className="loading">Loading elections...</div>;
  }

  if (elections.length === 0) {
    return <div className="loading">No elections found</div>;
  }

  return (
    <div className="election-list">
      <h2>All Elections</h2>
      {elections.map(election => {
        const status = getElectionStatus(election);
        return (
          <div key={election.id} className="election-card">
            <h3>{election.name}</h3>
            <div className="election-info">
              <p><strong>Constituency:</strong> {election.constituency}</p>
              <p><strong>Start:</strong> {formatDate(election.startTime)}</p>
              <p><strong>End:</strong> {formatDate(election.endTime)}</p>
              <p><strong>Total Votes:</strong> {election.totalVotes}</p>
              <p><strong>Candidates:</strong> {election.candidateCount}</p>
              <span className={`status-badge ${status.class}`}>
                {status.text}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ElectionsTab;
