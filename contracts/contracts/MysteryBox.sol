// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract UrashmaTaroMysteryBox is ERC721, Ownable {
    uint256 private _tokenIds;
    
    IERC20 public pearlToken;
    
    struct MysteryBox {
        uint256 id;
        address creator;
        string contentType; // "story", "image", "audio", etc.
        string ipfsHash; // Content stored on IPFS
        string storyProtocolIPId; // Story Protocol IP registration
        uint256 mintPrice; // Price in Pearl tokens
        bool isRevealed;
        bool canBeCoined; // Can be converted to CoinV4 token
        uint256 coinedTokenAddress; // Address of created CoinV4 token (if any)
    }
    
    mapping(uint256 => MysteryBox) public mysteryBoxes;
    mapping(address => uint256[]) public creatorBoxes;
    
    uint256 public constant CREATION_FEE = 100 * 10**18; // 100 PEARL tokens
    
    event MysteryBoxCreated(
        uint256 indexed tokenId, 
        address indexed creator, 
        string contentType, 
        uint256 mintPrice
    );
    
    event MysteryBoxRevealed(uint256 indexed tokenId, string ipfsHash);
    event MysteryBoxCoined(uint256 indexed tokenId, address coinAddress);
    
    constructor(address _pearlTokenAddress) 
        ERC721("Urashima Taro Mystery Box", "UTMB") 
        Ownable(msg.sender) 
    {
        pearlToken = IERC20(_pearlTokenAddress);
    }
    
    function createMysteryBox(
        string memory _contentType,
        string memory _ipfsHash,
        string memory _storyProtocolIPId,
        uint256 _mintPrice
    ) public returns (uint256) {
        require(_mintPrice > 0, "Mint price must be greater than 0");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");
        
        // Creator pays creation fee
        require(
            pearlToken.transferFrom(msg.sender, address(this), CREATION_FEE),
            "Failed to pay creation fee"
        );
        
        uint256 newTokenId = _tokenIds;
        _tokenIds++;
        
        mysteryBoxes[newTokenId] = MysteryBox({
            id: newTokenId,
            creator: msg.sender,
            contentType: _contentType,
            ipfsHash: _ipfsHash,
            storyProtocolIPId: _storyProtocolIPId,
            mintPrice: _mintPrice,
            isRevealed: false,
            canBeCoined: true,
            coinedTokenAddress: 0
        });
        
        creatorBoxes[msg.sender].push(newTokenId);
        _mint(msg.sender, newTokenId);
        
        emit MysteryBoxCreated(newTokenId, msg.sender, _contentType, _mintPrice);
        
        return newTokenId;
    }
    
    function purchaseMysteryBox(uint256 _tokenId) public {
        require(_ownerOf(_tokenId) != address(0), "Mystery box does not exist");
        MysteryBox storage box = mysteryBoxes[_tokenId];
        require(box.creator != msg.sender, "Cannot purchase own mystery box");
        
        // Transfer Pearl tokens from buyer to creator
        require(
            pearlToken.transferFrom(msg.sender, box.creator, box.mintPrice),
            "Failed to transfer payment"
        );
        
        // Transfer NFT to buyer
        address currentOwner = ownerOf(_tokenId);
        _transfer(currentOwner, msg.sender, _tokenId);
        
        // Reveal the mystery box
        box.isRevealed = true;
        emit MysteryBoxRevealed(_tokenId, box.ipfsHash);
    }
    
    function convertToCoinV4(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not the owner");
        MysteryBox storage box = mysteryBoxes[_tokenId];
        require(box.canBeCoined, "Cannot be converted to coin");
        require(box.coinedTokenAddress == 0, "Already converted to coin");
        
        // This would integrate with Zora's CoinV4 creation
        // For now, we'll emit an event and store a placeholder
        box.canBeCoined = false;
        box.coinedTokenAddress = 1; // Placeholder until actual integration
        
        emit MysteryBoxCoined(_tokenId, address(uint160(box.coinedTokenAddress)));
    }
    
    function getMysteryBox(uint256 _tokenId) public view returns (MysteryBox memory) {
        require(_ownerOf(_tokenId) != address(0), "Mystery box does not exist");
        return mysteryBoxes[_tokenId];
    }
    
    function getCreatorBoxes(address _creator) public view returns (uint256[] memory) {
        return creatorBoxes[_creator];
    }
    
    function withdrawPearlTokens(uint256 _amount) public onlyOwner {
        require(pearlToken.transfer(msg.sender, _amount), "Transfer failed");
    }
    
    // Override tokenURI to return mystery box metadata
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "URI query for nonexistent token");
        
        MysteryBox memory box = mysteryBoxes[tokenId];
        
        if (box.isRevealed) {
            return string(abi.encodePacked("https://ipfs.io/ipfs/", box.ipfsHash));
        } else {
            return "https://ipfs.io/ipfs/QmYourMysteryBoxPlaceholderHash"; // Placeholder for unrevealed boxes
        }
    }
} 