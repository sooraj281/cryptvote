// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VotingDApp - Optimized for Mainnet
 * @dev Size < 24KB with optimizer 200
 */
contract VotingDApp is ReentrancyGuard, Pausable {
    // ========== Enums ==========
    enum Role { None, LocalityOfficer, PollingOfficer, ElectionAuthority, SuperAdmin }
    enum Status { None, Pending, Verified, Rejected, Withdrawn }

    // ========== Structs ==========
    struct Voter { string name; string aadhaarId; bool hasVoted; uint256 electionId; Status status; }
    struct Candidate { string name; string party; uint256 votes; Status status; string bio; }
    struct Election { string name; uint256 startTime; uint256 endTime; string constituency; uint256 totalVotes; bool active; }
    struct Party { string name; string symbol; }
    struct Admin { Role role; bool active; }

    // ========== Constants ==========
    uint256 public constant MAX_CANDIDATES_PER_ELECTION = 50;

    // ========== State Variables ==========
    address public owner;
    uint256 public electionCount;

    mapping(address => Voter) public voters;
    mapping(address => Admin) public admins;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(address => Candidate)) public electionCandidates;
    mapping(uint256 => address[]) public electionCandidateList;
    mapping(uint256 => mapping(address => bool)) public hasNominated;
    mapping(string => Party) public parties;
    string[] public partyNames;
    address[] public pendingVoterList;

    // ========== Custom Errors ==========
    error NotOwner();
    error NotActive();
    error InsufficientRole();
    error InvalidTime();
    error StartInPast();
    error ZeroAddress();
    error AlreadyAdmin();
    error InvalidStatus();
    error NotPending();
    error InvalidElection();
    error AlreadyRegistered();
    error TooManyCandidates();
    error NotVerified();
    error AlreadyVoted();
    error CandidateNotApproved();
    error AlreadyNominated();
    error CannotWithdraw();

    // ========== Modifiers ==========
    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAdmin(Role requiredRole) {
        if (!admins[msg.sender].active) revert NotActive();
        if (uint8(admins[msg.sender].role) < uint8(requiredRole)) revert InsufficientRole();
        _;
    }

    modifier electionActive(uint256 id) {
        Election memory e = elections[id];
        if (!e.active || block.timestamp < e.startTime || block.timestamp >= e.endTime) revert InvalidElection();
        _;
    }

    // ========== Events ==========
    event ElectionCreated(uint256 indexed id, string name, string constituency);
    event VoterRegistered(address indexed voter, uint256 electionId);
    event VoterVerified(address indexed voter, Status status);
    event CandidateNominated(address indexed candidate, uint256 indexed electionId);
    event NominationVerified(address indexed candidate, uint256 indexed electionId, Status status);
    event VoteCast(address indexed voter, uint256 indexed electionId, address indexed candidate);

    // ========== Constructor ==========
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = Admin(Role.SuperAdmin, true);
    }

    // ========== Admin Functions ==========
    function createElection(
        string memory _name,
        uint256 _startTime,
        uint256 _endTime,
        string memory _constituency
    ) external onlyAdmin(Role.ElectionAuthority) whenNotPaused {
        if (_startTime >= _endTime) revert InvalidTime();
        if (_startTime <= block.timestamp) revert StartInPast();

        electionCount++;
        elections[electionCount] = Election(_name, _startTime, _endTime, _constituency, 0, true);
        emit ElectionCreated(electionCount, _name, _constituency);
    }

    function addAdmin(address _admin, Role _role) external onlyAdmin(Role.SuperAdmin) whenNotPaused {
        if (_admin == address(0)) revert ZeroAddress();
        if (admins[_admin].active) revert AlreadyAdmin();
        admins[_admin] = Admin(_role, true);
    }

    function verifyVoter(address _voter, Status _status) external onlyAdmin(Role.PollingOfficer) nonReentrant whenNotPaused {
        if (_status != Status.Verified && _status != Status.Rejected) revert InvalidStatus();
        if (voters[_voter].status != Status.Pending) revert NotPending();

        voters[_voter].status = _status;
        emit VoterVerified(_voter, _status);

        // Remove from pending list
        for (uint256 i = 0; i < pendingVoterList.length; i++) {
            if (pendingVoterList[i] == _voter) {
                pendingVoterList[i] = pendingVoterList[pendingVoterList.length - 1];
                pendingVoterList.pop();
                break;
            }
        }
    }

    function verifyCandidate(uint256 _electionId, address _candidate, Status _status)
        external onlyAdmin(Role.LocalityOfficer) nonReentrant whenNotPaused
    {
        if (_status != Status.Verified && _status != Status.Rejected) revert InvalidStatus();
        if (electionCandidates[_electionId][_candidate].status != Status.Pending) revert NotPending();
        electionCandidates[_electionId][_candidate].status = _status;
        emit NominationVerified(_candidate, _electionId, _status);
    }

    // ========== Voter Functions ==========
    function registerVoter(string memory _name, string memory _aadhaarId, uint256 _electionId) external whenNotPaused {
        if (bytes(_name).length == 0 || bytes(_aadhaarId).length == 0) revert InvalidStatus();
        if (_electionId > electionCount || _electionId == 0) revert InvalidElection();

        Voter storage v = voters[msg.sender];
        if (v.electionId == _electionId && v.status != Status.None) revert AlreadyRegistered();

        if (v.status == Status.None) pendingVoterList.push(msg.sender);

        voters[msg.sender] = Voter(_name, _aadhaarId, false, _electionId, Status.Pending);
        emit VoterRegistered(msg.sender, _electionId);
    }

    function castVote(uint256 _electionId, address _candidate) external electionActive(_electionId) nonReentrant whenNotPaused {
        Voter storage voter = voters[msg.sender];
        Candidate storage cand = electionCandidates[_electionId][_candidate];

        if (voter.status != Status.Verified) revert NotVerified();
        if (voter.electionId != _electionId) revert InvalidElection();
        if (voter.hasVoted) revert AlreadyVoted();
        if (cand.status != Status.Verified) revert CandidateNotApproved();

        voter.hasVoted = true;
        cand.votes++;
        elections[_electionId].totalVotes++;
        emit VoteCast(msg.sender, _electionId, _candidate);
    }

    // ========== Candidate Functions ==========
    function submitNomination(
        uint256 _electionId,
        string memory _name,
        string memory _partyName,
        string memory _partySymbol,
        string memory _bio
    ) external whenNotPaused {
        if (_electionId > electionCount || _electionId == 0) revert InvalidElection();
        if (hasNominated[_electionId][msg.sender]) revert AlreadyNominated();
        if (bytes(_name).length == 0 || bytes(_partyName).length == 0 || bytes(_partySymbol).length == 0 || bytes(_bio).length == 0)
            revert InvalidStatus();
        if (electionCandidateList[_electionId].length >= MAX_CANDIDATES_PER_ELECTION) revert TooManyCandidates();

        if (bytes(parties[_partyName].name).length == 0) {
            parties[_partyName] = Party(_partyName, _partySymbol);
            partyNames.push(_partyName);
        }

        electionCandidates[_electionId][msg.sender] = Candidate(_name, _partyName, 0, Status.Pending, _bio);
        electionCandidateList[_electionId].push(msg.sender);
        hasNominated[_electionId][msg.sender] = true;
        emit CandidateNominated(msg.sender, _electionId);
    }

    function withdrawNomination(uint256 _electionId) external whenNotPaused {
        Candidate storage c = electionCandidates[_electionId][msg.sender];
        if (c.status != Status.Pending) revert CannotWithdraw();
        c.status = Status.Withdrawn;
    }

    // ========== View Functions ==========
    function getElectionDetails(uint256 id) external view returns (Election memory) { return elections[id]; }

    function getCandidateProfile(uint256 id, address c) external view returns (Candidate memory) {
        return electionCandidates[id][c];
    }

    function getElectionCandidates(uint256 id) external view returns (address[] memory c, Candidate[] memory d) {
        c = electionCandidateList[id];
        d = new Candidate[](c.length);
        for (uint256 i = 0; i < c.length; i++) d[i] = electionCandidates[id][c[i]];
    }

    function getElectionStats(uint256 id) external view returns (uint256 votes, uint256 count) {
        votes = elections[id].totalVotes;
        count = electionCandidateList[id].length;
    }

    function getParties() external view returns (string[] memory n, string[] memory s) {
        n = new string[](partyNames.length);
        s = new string[](partyNames.length);
        for (uint256 i = 0; i < partyNames.length; i++) {
            n[i] = partyNames[i];
            s[i] = parties[partyNames[i]].symbol;
        }
    }

    function getVoterStatus(address v) external view returns (Voter memory) { return voters[v]; }

    function getPendingVoters() external view returns (
        address[] memory addr,
        string[] memory names,
        string[] memory aadhaar,
        uint256[] memory eids
    ) {
        uint256 count = 0;
        for (uint256 i = 0; i < pendingVoterList.length; i++)
            if (voters[pendingVoterList[i]].status == Status.Pending) count++;

        addr = new address[](count);
        names = new string[](count);
        aadhaar = new string[](count);
        eids = new uint256[](count);

        uint256 idx = 0;
        for (uint256 i = 0; i < pendingVoterList.length; i++) {
            address a = pendingVoterList[i];
            Voter memory v = voters[a];
            if (v.status == Status.Pending) {
                addr[idx] = a;
                names[idx] = v.name;
                aadhaar[idx] = v.aadhaarId;
                eids[idx] = v.electionId;
                idx++;
            }
        }
    }

    // ========== Emergency ==========
    function pause() external onlyOwner { _pause(); }
    function unpause() external onlyOwner { _unpause(); }
}