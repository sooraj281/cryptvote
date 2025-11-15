import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './config';
import './App.css';
import Header from './components/Header';
import Message from './components/Message';
import Tabs from './components/Tabs';
import ElectionsTab from './components/ElectionsTab';
import RegisterTab from './components/RegisterTab';
import NominateTab from './components/NominateTab';
import VoteTab from './components/VoteTab';
import CreateElectionTab from './components/CreateElectionTab';
import VerifyVotersTab from './components/VerifyVotersTab';
import VerifyCandidatesTab from './components/VerifyCandidatesTab';
import ManageAdminsTab from './components/ManageAdminsTab';

function App() {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminRole, setAdminRole] = useState(0); // 0=None, 1=LocalityOfficer, 2=PollingOfficer, 3=ElectionAuthority, 4=SuperAdmin
  const [activeTab, setActiveTab] = useState('elections');
  const [elections, setElections] = useState([]);
  const [voterStatus, setVoterStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount('');
      setContract(null);
      setIsAdmin(false);
      setAdminRole(0);
    } else {
      connectWallet();
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        showMessage('error', 'Please install MetaMask!');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      setContract(contract);
      setAccount(accounts[0]);

      // Check if user is admin and get their role
      try {
        const adminInfo = await contract.admins(accounts[0]);
        const role = Number(adminInfo.role);
        const isActive = adminInfo.active;

        setIsAdmin(isActive && role > 0);
        setAdminRole(isActive ? role : 0);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setAdminRole(0);
      }

      showMessage('success', 'Wallet connected successfully!');
      loadElections(contract);
      loadVoterStatus(contract, accounts[0]);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      showMessage('error', 'Failed to connect wallet');
    }
  };

  const loadElections = async (contractInstance) => {
    try {
      setLoading(true);
      const count = await contractInstance.electionCount();
      const electionsList = [];

      for (let i = 1; i <= Number(count); i++) {
        const election = await contractInstance.getElectionDetails(i);
        const stats = await contractInstance.getElectionStats(i);

        electionsList.push({
          id: i,
          name: election.name,
          startTime: Number(election.startTime),
          endTime: Number(election.endTime),
          constituency: election.constituency,
          totalVotes: Number(stats.totalVotes),
          candidateCount: Number(stats.candidateCount),
          active: election.active
        });
      }

      setElections(electionsList);
    } catch (error) {
      console.error('Error loading elections:', error);
      showMessage('error', 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const loadVoterStatus = async (contractInstance, address) => {
    try {
      const status = await contractInstance.getVoterStatus(address);
      setVoterStatus({
        name: status.name,
        hasVoted: status.hasVoted,
        electionId: Number(status.electionId),
        status: Number(status.status)
      });
    } catch (error) {
      console.error('Error loading voter status:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const getStatusText = (status) => {
    const statusMap = ['None', 'Pending', 'Verified', 'Rejected', 'Withdrawn'];
    return statusMap[status] || 'Unknown';
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isElectionActive = (election) => {
    const now = Math.floor(Date.now() / 1000);
    return election.active && now >= election.startTime && now < election.endTime;
  };

  return (
    <div className="App">
      <div className="container">
        <Header account={account} onConnect={connectWallet} adminRole={adminRole} />
        <Message message={message} />

        {account && (
          <>
            <Tabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              isAdmin={isAdmin}
              adminRole={adminRole}
            />

            <div className="content">
              {activeTab === 'elections' && (
                <ElectionsTab
                  elections={elections}
                  loading={loading}
                  isElectionActive={isElectionActive}
                  formatDate={formatDate}
                />
              )}
              {activeTab === 'register' && (
                <RegisterTab
                  contract={contract}
                  elections={elections}
                  voterStatus={voterStatus}
                  showMessage={showMessage}
                  getStatusText={getStatusText}
                  loadVoterStatus={loadVoterStatus}
                  account={account}
                />
              )}
              {activeTab === 'nominate' && (
                <NominateTab
                  contract={contract}
                  elections={elections}
                  showMessage={showMessage}
                />
              )}
              {activeTab === 'vote' && (
                <VoteTab
                  contract={contract}
                  voterStatus={voterStatus}
                  showMessage={showMessage}
                  loadVoterStatus={loadVoterStatus}
                  account={account}
                />
              )}
              {/* Super Admin (4) - Full control */}
              {activeTab === 'manageAdmins' && adminRole === 4 && (
                <ManageAdminsTab
                  contract={contract}
                  showMessage={showMessage}
                />
              )}

              {/* Election Authority (3) - Create/end elections */}
              {activeTab === 'createElection' && (adminRole === 4 || adminRole === 3) && (
                <CreateElectionTab
                  contract={contract}
                  showMessage={showMessage}
                  loadElections={loadElections}
                />
              )}

              {/* Polling Officer (2) - Verify voters */}
              {activeTab === 'verifyVoters' && (adminRole === 4 || adminRole === 2) && (
                <VerifyVotersTab
                  contract={contract}
                  showMessage={showMessage}
                />
              )}

              {/* Locality Officer (1) - Verify candidates */}
              {activeTab === 'verifyCandidates' && (adminRole === 4 || adminRole === 1) && (
                <VerifyCandidatesTab
                  contract={contract}
                  elections={elections}
                  showMessage={showMessage}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
