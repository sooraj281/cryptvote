function Header({ account, onConnect, adminRole }) {
  const getRoleName = (role) => {
    const roles = {
      0: null,
      1: 'Locality Officer',
      2: 'Polling Officer',
      3: 'Election Authority',
      4: 'Super Admin'
    };
    return roles[role];
  };

  const roleName = getRoleName(adminRole);

  return (
    <div className="header">
      <h1>🗳️ Voting DApp</h1>
      <div className="wallet-info">
        {!account ? (
          <button className="connect-btn" onClick={onConnect}>
            Connect Wallet
          </button>
        ) : (
          <>
            <span className="wallet-address">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
            <span className="status-badge status-verified">Connected</span>
            {roleName && (
              <span className="status-badge status-active" style={{marginLeft: '8px'}}>
                {roleName}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
