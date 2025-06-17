// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// Counters.sol removed in newer OpenZeppelin, using uint256 directly

contract UrashimaTaroMemeContest is Ownable {
    IERC20 public pearlToken; // Address of the Pearl Token contract

    struct Meme {
        uint256 id;
        address creator;
        string ipfsHash; // IPFS hash of the meme image
        string storyProtocolIPId; // ID from Story Protocol for IP registration
        uint256 votes;
        uint256 submissionTime;
        bool exists; // To check if a meme ID is valid
    }

    uint256 private _memeIds; // Using uint256 as a counter
    mapping(uint256 => Meme) public memes;
    mapping(address => mapping(uint256 => bool)) public hasVoted; // user => memeId => voted

    uint256 public contestEndTime;  // Timestamp when the contest end
    uint256 public submissionFee; // Fee in Pearl tokens to submit a meme
    uint256 public voterEntryFee; // NEW: Fee in Pearl tokens for a voter to cast a vote
    uint256 public creatorRewardAmount; // Pearl tokens for top creators
    uint256 public voterRewardAmount; // Pearl tokens for voters (e.g., for participating)

    event MemeSubmitted(uint256 indexed memeId, address indexed creator, string ipfsHash, string storyProtocolIPId);
    event MemeVoted(uint256 indexed memeId, address indexed voter);
    event ContestEnded(uint256 indexed winnerMemeId, address indexed winnerCreator);
    event RewardsDistributed(address indexed recipient, uint256 amount);

    constructor(address _pearlTokenAddress, uint256 _submissionFee, uint256 _voterEntryFee, uint256 _creatorReward, uint256 _voterReward) Ownable(msg.sender) {
        pearlToken = IERC20(_pearlTokenAddress);
        submissionFee = _submissionFee;
        voterEntryFee = _voterEntryFee; 
        creatorRewardAmount = _creatorReward;
        voterRewardAmount = _voterReward;
    }

    // Set contest end time
    function setContestEndTime(uint256 _endTime) external onlyOwner {
        require(_endTime > block.timestamp, "Contest: End time must be in the future");
        contestEndTime = _endTime;
    }

    // Update contest parameters
    function updateContestParameters(uint256 _submissionFee, uint256 _voterEntryFee, uint256 _creatorReward, uint256 _voterReward) public onlyOwner {
        submissionFee = _submissionFee;
        voterEntryFee = _voterEntryFee;
        creatorRewardAmount = _creatorReward;
        voterRewardAmount = _voterReward;
    }

    // Submit a meme
    function submitMeme(string memory _ipfsHash, string memory _storyProtocolIPId) public {
        require(block.timestamp < contestEndTime, "Contest: Contest has ended");
        require(bytes(_ipfsHash).length > 0, "Contest: IPFS hash cannot be empty");
        require(bytes(_storyProtocolIPId).length > 0, "Contest: Story Protocol IP ID cannot be empty");

        // Users must approve this contract to spend Pearl tokens for the submission fee
        require(pearlToken.transferFrom(msg.sender, address(this), submissionFee), "Pearl token transfer failed. Check allowance for submission fee.");

        uint256 newMemeId = _memeIds; // Use uint256 as counter
        memes[newMemeId] = Meme({
            id: newMemeId,
            creator: msg.sender,
            ipfsHash: _ipfsHash,
            storyProtocolIPId: _storyProtocolIPId,
            votes: 0,
            submissionTime: block.timestamp,
            exists: true
        });
        _memeIds++; // Increment uint256 counter

        emit MemeSubmitted(newMemeId, msg.sender, _ipfsHash, _storyProtocolIPId);
    }

    // Vote for a meme
    function voteForMeme(uint256 _memeId) public {
        require(block.timestamp < contestEndTime, "Contest: Contest has ended");
        require(memes[_memeId].exists, "Contest: Meme does not exist");
        require(!hasVoted[msg.sender][_memeId], "Contest: Already voted");
        require(memes[_memeId].creator != msg.sender, "Contest: Cannot vote for own meme");

        // NEW: Voter must pay the voterEntryFee in Pearl tokens
        require(pearlToken.transferFrom(msg.sender, address(this), voterEntryFee), "Pearl token transfer failed. Check allowance for voter entry fee.");

        memes[_memeId].votes++;
        hasVoted[msg.sender][_memeId] = true;

        // Reward the voter (if any)
        if (voterRewardAmount > 0) {
            require(pearlToken.transfer(msg.sender, voterRewardAmount), "Failed to reward voter.");
        }

        emit MemeVoted(_memeId, msg.sender);
    }

    // Get contest results (can be called by anyone after contest ends)
    function getContestResults() public view returns (uint256 winningMemeId, address winningCreator, uint256 maxVotes) {
        require(block.timestamp >= contestEndTime, "Contest: Contest not ended");

        maxVotes = 0;
        winningMemeId = 0;
        winningCreator = address(0);

        for (uint256 i = 0; i < _memeIds; i++) { // Use uint256 as loop condition
            if (memes[i].exists && memes[i].votes > maxVotes) {
                maxVotes = memes[i].votes;
                winningMemeId = memes[i].id;
                winningCreator = memes[i].creator;
            }
        }
        return (winningMemeId, winningCreator, maxVotes);
    }

    // Distribute rewards to the winner (callable by owner after contest ends)
    function distributeWinnerRewards() public onlyOwner {
        require(block.timestamp >= contestEndTime, "Contest: Contest not ended");
        (uint256 winningMemeId, address winningCreator, ) = getContestResults();

        if (winningCreator != address(0)) {
            require(pearlToken.transfer(winningCreator, creatorRewardAmount), "Failed to distribute creator rewards.");
            emit RewardsDistributed(winningCreator, creatorRewardAmount);
        }
    }

    // Function to allow owner to withdraw Pearl tokens accumulated from submission fees and voter entry fees
    function withdrawPearlTokens(uint256 amount) public onlyOwner {
        require(pearlToken.transfer(msg.sender, amount), "Pearl token withdrawal failed.");
    }
}
    