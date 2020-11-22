pragma solidity >=0.4.22 <0.8.0;

import './Ownable.sol';
import './Oracle.sol';
import './UGameToken.sol';

contract MatchContract is Ownable {
    mapping(address => bytes32[]) private userToBets;
    mapping(bytes32 => Bet[]) private matchToBets;

    struct Bet {
        address user;
        bytes32 matchId;
        uint amount; 
        uint8 side; 
    }

    Oracle internal oracle;    
    address payable internal admin;

    constructor(Oracle _oracle) public {
        oracle = _oracle;
        admin = msg.sender;
    }
    
    // function getMatch(bytes32 _matchId) public view returns (
    //     bytes32 id,
    //     string memory name, 
    //     address[] memory participants,
    //     uint8 participantCount,
    //     uint date, 
    //     Oracle.MatchOutcome outcome, 
    //     int8 winner) { 

    //     return oracle.getMatch(_matchId); 
    // }

    function placeBet(bytes32 _matchId) public payable {
        oracle.payForBet(_matchId);
    }

}