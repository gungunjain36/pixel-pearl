// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MemeContest is Ownable {
    using Counters for Counters.Counter;

    IERC20 public PearlToken;

    struct Meme {
        uint256 id; 
        address creater;
        string ipfsHash;
        string storyProtocolIPID;
        uint256 votes;
        uint256 submissionTime;
        bool exists;
    }

    Counters.Counter private _memeIds;
    mapping(uint256 => Meme) public memes;
    mapping(address => mapping(uint256 => bool)) public hasVoted;

    uint256 public contestEndTime; 
    uint256 public submissionFee;
    uint256 public voterEntryFee;
    uint256 public creatorRewardAmount; 
    uint256 public voterRewardAmount;

    event MemeSubmitted(uint256 indexed memeId, address indexed creator, string ipfsHash, string storyProtocolIPId);
    event MemeVoted(uint256 indexed memeId, address indexed voter);
    event ContestEnded(uint256 indexed winnerMemeId, address indexed winnerCreator);
    event RewardsDistributed(address indexed recipient, uint256 amount);

    constructor(address _pearlTokenAddress, uint256 _submissionFee,uint256 _voterEntryFee, uint256 _creatorReward, uint256 _voterReward) Ownable(msg.sender){
        PearlToken = IERC20(_pearlTokenAddress);
        submissionFee = _submissionFee;
        voterEntryFee = _voterEntryFee;
        creatorRewardAmount = _creatorReward;
        voterRewardAmount = _voterReward;
    }

    function setContestEndTime(uint256 _endTime) public onlyOwner {
        require(_endTime > block.timestamp, "End time must be in the future.");
        contestEndTime = _endTime;
    }

    function updateContestParameters(uint256 _submissionFee, uint256 _voterEntryFee, uint256 _creatorReward, uint256 _voterReward) public onlyOwner {
        submissionFee = _submissionFee;
        voterEntryFee = _voterEntryFee;
        creatorRewardAmount = _creatorReward;
        voterRewardAmount = _voterReward;
    }

    // Submit a meme
    function submitMeme(string memory _ipfsHash, string memory _storyProtocolIPID) public {
        require(block.timestamp < contestEndTime, "Contest has ended.");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty.");
        require(bytes(_storyProtocolIPId).length > 0, "Story Protocol IP ID cannot be empty.");

        require(PearlToken.transferFrom(msg.sender, address(this), submissionFee), "Submission fee transfer failed.Check allowance for submission fee.");

       
        uint256 memeId = _memeIds.current();

        memes[memeId] = Meme({
            id: memeId,
            creater: msg.sender,
            ipfsHash: _ipfsHash,
            storyProtocolIPID: _storyProtocolIPID,
            votes: 0,
            submissionTime: block.timestamp,
            exists: true
        });
        _memeIds.increment();

        emit MemeSubmitted(memeId, msg.sender, _ipfsHash, _storyProtocolIPID);
    }


    // Vote for a meme
    function voteForMeme(uint256 _memeId) public {
        require(block.timestamp < contestEndTime, "Contest has ended.");
        require(memes[_memeId].exists, "Meme does not exist.");
        require(!hasVoted[msg.sender][_memeId], "You have already voted for this meme.");
        require(memes[_memeId].creator != msg.sender, "Cannot vote for your own meme.");
        // Check if the voter has enough balance to pay the entry fee
        require(PearlToken.balanceOf(msg.sender) >= voterEntryFee, "Insufficient balance to pay voter entry fee.");

        require(PearlToken.transferFrom(msg.sender, address(this), voterEntryFee), "Voter entry fee transfer failed. Check allowance for voter entry fee.");

        memes[_memeId].votes += 1;
        hasVoted[msg.sender][_memeId] = true;

        if (voterRewardAmount > 0) {
            require(pearlToken.transfer(msg.sender, voterRewardAmount), "Failed to reward voter.");
        }

        emit MemeVoted(_memeId, msg.sender);
    }

    function getContestResults() public view returns (uint256 winnerMemeId, address winnerCreator, uint256 maxVotes) {
        require(block.timestamp >= contestEndTime, "Contest is still ongoing.");

        maxVotes = 0;
        winnerMemeId = 0;   
        winnerCreator = address(0);

        
        for (uint256 i = 0; i < _memeIds.current(); i++) {
            if (memes[i].exists && memes[i].votes > maxVotes) {
                maxVotes = memes[i].votes;
                winnerMemeId = memes[i].id;
                winnerCreator = memes[i].creator;
            }
        }

        return (winnerMemeId, winnerCreator, maxVotes);
    }

    function distributeRewards() public onlyOwner {
        require(block.timestamp >= contestEndTime, "Contest is still ongoing.");
        
        (uint256 winnerMemeId, address winnerCreator, uint256 maxVotes) = getContestResults();
        require(winnerMemeId != 0, "No memes submitted.");

        // Transfer creator reward
        if (creatorRewardAmount > 0) {
            require(PearlToken.transfer(winnerCreator, creatorRewardAmount), "Failed to transfer creator reward.");
            emit RewardsDistributed(winnerCreator, creatorRewardAmount);
        }

        // Transfer voter rewards
        for (uint256 i = 0; i < _memeIds.current(); i++) {
            if (hasVoted[msg.sender][i]) {
                require(PearlToken.transfer(msg.sender, voterRewardAmount), "Failed to transfer voter reward.");
                emit RewardsDistributed(msg.sender, voterRewardAmount);
            }
        }

        emit ContestEnded(winnerMemeId, winnerCreator);
    }

    function withdrawUnclaimedTokens() public onlyOwner {
        uint256 balance = PearlToken.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw.");
        require(PearlToken.transfer(msg.sender, balance), "Withdrawal failed.");
    }

}