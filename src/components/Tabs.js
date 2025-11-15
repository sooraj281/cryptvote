function Tabs({ activeTab, onTabChange, isAdmin, adminRole }) {
  // Role constants (updated order)
  const ROLES = {
    LocalityOfficer: 1,
    PollingOfficer: 2,
    ElectionAuthority: 3,
    SuperAdmin: 4
  };

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
      <button 
        className={`tab-btn ${activeTab === 'nominate' ? 'active' : ''}`}
        onClick={() => onTabChange('nominate')}
      >
        Nominate as Candidate
      </button>
      <button 
        className={`tab-btn ${activeTab === 'vote' ? 'active' : ''}`}
        onClick={() => onTabChange('vote')}
      >
        Cast Vote
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
