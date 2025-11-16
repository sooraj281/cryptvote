export const CONTRACT_ADDRESS = "0xccD9f412787977b308Bf140789A91E7574260c8c";

export const CONTRACT_ABI = [
  // View functions
  "function electionCount() view returns (uint256)",
  "function elections(uint256) view returns (string name, uint256 startTime, uint256 endTime, string constituency, uint256 totalVotes, bool active)",
  "function voters(address) view returns (string name, string aadhaarId, bool hasVoted, uint256 electionId, uint8 status)",
  "function admins(address) view returns (uint8 role, bool active)",
  "function owner() view returns (address)",
  "function partyCount() view returns (uint256)",
  "function getElectionDetails(uint256 _electionId) view returns (tuple(string name, uint256 startTime, uint256 endTime, string constituency, uint256 totalVotes, bool active))",
  "function getElectionCandidates(uint256 _electionId) view returns (address[] candidates, tuple(string name, string party, uint256 votes, uint8 status, string bio)[] details)",
  "function getElectionStats(uint256 _electionId) view returns (uint256 totalVotes, uint256 candidateCount)",
  "function getVoterStatus(address _voter) view returns (tuple(string name, string aadhaarId, bool hasVoted, uint256 electionId, uint8 status))",
  "function getCandidateProfile(uint256 _electionId, address _candidate) view returns (tuple(string name, string party, uint256 votes, uint8 status, string bio))",
  "function getParties() view returns (string[] names, string[] symbols)",
  "function getPendingVoters() view returns (address[] addr, string[] names, string[] aadhaar, uint256[] eids)",
  
  // Voter functions
  "function registerVoter(string _name, string _aadhaarId, uint256 _electionId)",
  "function castVote(uint256 _electionId, address _candidate)",
  
  // Candidate functions
  "function submitNomination(uint256 _electionId, string _name, string _partyName, string _partySymbol, string _bio)",
  "function withdrawNomination(uint256 _electionId)",
  
  // Admin functions - Election Management
  "function createElection(string _name, uint256 _startTime, uint256 _endTime, string _constituency)",
  "function endElection(uint256 _electionId)",
  
  // Admin functions - Admin Management
  "function addAdmin(address _admin, uint8 _role)",
  
  // Admin functions - Verification
  "function verifyVoter(address _voter, uint8 _status)",
  "function verifyCandidate(uint256 _electionId, address _candidate, uint8 _status)",
  
  // Emergency functions
  "function pause()",
  "function unpause()",
  
  // Events
  "event VoterRegistered(address indexed voter, string name, uint256 electionId)",
  "event VoterVerified(address indexed voter, uint8 status)",
  "event VoteCast(address indexed voter, uint256 indexed electionId, address indexed candidate)",
  "event ElectionCreated(uint256 indexed electionId, string name, string constituency)",
  "event ElectionEnded(uint256 indexed electionId)",
  "event CandidateNominated(address indexed candidate, uint256 indexed electionId)",
  "event NominationVerified(address indexed candidate, uint256 indexed electionId, uint8 status)",
  "event NominationWithdrawn(address indexed candidate, uint256 indexed electionId)",
  "event PartyAdded(string indexed name, string symbol)",
  "event AdminAdded(address indexed admin, uint8 role)"
];
