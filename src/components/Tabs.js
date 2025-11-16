function Tabs({ activeTab, onTabChange, isAdmin, adminRole, voterStatus, elections }) {
  // Role constants (updated order)
  const ROLES = {
    LocalityOfficer: 1,
    PollingOfficer: 2,
    ElectionAuthority: 3,
    SuperAdmin: 4
  };

  // Check if user is a verified voter
  const isVerifiedVoter = voterStatus && voterStatus.status === 2; // Status.Verified = 2

  // Check if user's election is active
  const isElectionActive = () => {
    if (!voterStatus || !voterStatus.electionId) return false;
    const election = elections.find(e => e.id === voterStatus.electionId);
    if (!election) return false;
    const now = Math.floor(Date.now() / 1000);
    return election.active && now >= election.startTime && now < election.endTime;
  };

  // Check if user is registered (any status except None)
  const isRegisteredVoter = voterStatus && voterStatus.status !== 0; // Status.None = 0

  return (
    <div className="tabs">
      {/* Public tabs - visible to everyone */}
      <button
        className={`tab-btn ${activeTab === 'elections' ? 'active' : ''}`}
        onClick={() => onTabChange('elections')}
      >
        Elections
      </button>
      <button
        className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
        onClick={() => onTabChange('register')}
      >
        Register as Voter
      </button>

      {/* Nominate tab - only show if user is registered as voter */}
      {isRegisteredVoter && (
        <button
          className={`tab-btn ${activeTab === 'nominate' ? 'active' : ''}`}
          onClick={() => onTabChange('nominate')}
        >
          Nominate as Candidate
        </button>
      )}

      {/* Vote tab - only show if verified voter AND election is active */}
      {isVerifiedVoter && isElectionActive() && (
        <button
          className={`tab-btn ${activeTab === 'vote' ? 'active' : ''}`}
          onClick={() => onTabChange('vote')}
        >
          Cast Vote
        </button>
      )}

      {/* Results tab - visible to everyone */}
      <button
        className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
        onClick={() => onTabChange('results')}
      >
        Results
      </button>

      {/* Admin tabs - role-based visibility */}
      {isAdmin && (
        <>
          {/* Super Admin (1) - Can add other admins */}
          {adminRole === ROLES.SuperAdmin && (
            <button
              className={`tab-btn ${activeTab === 'manageAdmins' ? 'active' : ''}`}
              onClick={() => onTabChange('manageAdmins')}
            >
              Manage Admins
            </button>
          )}

          {/* Election Authority (2) or Super Admin - Create/end elections */}
          {(adminRole === ROLES.SuperAdmin || adminRole === ROLES.ElectionAuthority) && (
            <button
              className={`tab-btn ${activeTab === 'createElection' ? 'active' : ''}`}
              onClick={() => onTabChange('createElection')}
            >
              Create Election
            </button>
          )}

          {/* Polling Officer (3) or Super Admin - Verify voters */}
          {(adminRole === ROLES.SuperAdmin || adminRole === ROLES.PollingOfficer) && (
            <button
              className={`tab-btn ${activeTab === 'verifyVoters' ? 'active' : ''}`}
              onClick={() => onTabChange('verifyVoters')}
            >
              Verify Voters
            </button>
          )}

          {/* Locality Officer (4) or Super Admin - Verify candidates */}
          {(adminRole === ROLES.SuperAdmin || adminRole === ROLES.LocalityOfficer) && (
            <button
              className={`tab-btn ${activeTab === 'verifyCandidates' ? 'active' : ''}`}
              onClick={() => onTabChange('verifyCandidates')}
            >
              Verify Candidates
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default Tabs;
