pragma solidity >=0.4.22 <0.8.0;

import './UGameToken.sol';

contract UGameTokenSale {
    address payable admin;
    UGameToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);
    event EndSale(uint256 _totalAmountSold);

    constructor(UGameToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y != 0);
        return x * y;
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == multiply(_numberOfTokens, tokenPrice), 'msg.value must equal number of tokens in wei');
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens, 'cannot purchase more tokens than available');
        require(tokenContract.transfer(msg.sender, _numberOfTokens), 'Unable to send tokens');

        tokensSold += _numberOfTokens;

        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin);
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));

        admin.transfer(address(this).balance);
        emit EndSale(tokensSold);
    }

}