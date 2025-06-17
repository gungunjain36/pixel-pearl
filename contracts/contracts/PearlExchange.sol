// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PearlExchange is Ownable {
    IERC20 public pearlToken;

    // Exchange rate: How many Pearl tokens per 1 ETH
    uint256 public pearlPerEthRate;

    event EthToPearlExchanged(address indexed user, uint256 ethAmount, uint256 pearlAmount);
    event PearlToEthExchanged(address indexed user, uint256 pearlAmount, uint256 ethAmount);
    event ExchangeRateUpdated(uint256 newRate);

    constructor(address _pearlTokenAddress, uint256 _initialPearlPerEthRate) Ownable(msg.sender) {
        pearlToken = IERC20(_pearlTokenAddress);
        pearlPerEthRate = _initialPearlPerEthRate; // e.g., 1000 for 1000 PEARL per 1 ETH
    }

    // Set the exchange rate (only owner)
    function setExchangeRate(uint256 _newRate) public onlyOwner {
        require(_newRate > 0, "Rate must be greater than zero.");
        pearlPerEthRate = _newRate;
        emit ExchangeRateUpdated(_newRate);
    }

    // Exchange ETH for Pearl tokens
    function exchangeEthForPearl() public payable {
        require(msg.value > 0, "Must send ETH to exchange.");
        uint256 pearlAmount = (msg.value * pearlPerEthRate) / 1 ether; // Convert ETH (wei) to Pearl amount

        require(pearlToken.balanceOf(address(this)) >= pearlAmount, "Not enough Pearl tokens in contract for exchange.");
        require(pearlToken.transfer(msg.sender, pearlAmount), "Failed to transfer Pearl tokens.");

        emit EthToPearlExchanged(msg.sender, msg.value, pearlAmount);
    }

    // Exchange Pearl tokens for ETH
    function exchangePearlForEth(uint256 _pearlAmount) public {
        require(_pearlAmount > 0, "Must send Pearl tokens to exchange.");

        uint256 ethAmount = (_pearlAmount * 1 ether) / pearlPerEthRate; // Convert Pearl to ETH (wei)

        require(address(this).balance >= ethAmount, "Not enough ETH in contract for exchange.");
        require(pearlToken.transferFrom(msg.sender, address(this), _pearlAmount), "Pearl token transfer failed. Check allowance.");

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "Failed to send ETH.");

        emit PearlToEthExchanged(msg.sender, _pearlAmount, ethAmount);
    }

    // Owner can deposit ETH into the contract for exchanges
    function depositEth() public payable onlyOwner {
        // Just receives ETH, no special logic needed beyond this
    }

    // Owner can withdraw ETH from the contract
    function withdrawEth(uint256 _amount) public onlyOwner {
        require(address(this).balance >= _amount, "Insufficient ETH balance in contract.");
        (bool success, ) = payable(msg.sender).call{value: _amount}("");
        require(success, "Failed to withdraw ETH.");
    }

    // Owner can withdraw Pearl tokens sent directly to the contract (if any, e.g., by mistake)
    function withdrawPearlTokens(uint256 _amount) public onlyOwner {
        require(pearlToken.balanceOf(address(this)) >= _amount, "Insufficient Pearl token balance in contract.");
        require(pearlToken.transfer(msg.sender, _amount), "Failed to withdraw Pearl tokens.");
    }
}
    