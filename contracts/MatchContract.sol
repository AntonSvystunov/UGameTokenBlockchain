pragma solidity ^0.5.0;

import './Ownable.sol';
import './Oracle.sol';

contract MatchContract is Ownable {
    mapping(address => bytes32[]) private userToBets;
    mapping(bytes32 => Bet[]) private matchToBets;

    struct Bet {
        address user;
        bytes32 matchId;
        uint amount; 
        uint8 side; 
    }
    
    function getMatch(bytes32 _matchId) public view returns (
        bytes32 id,
        string memory name, 
        address[] memory participants,
        uint8 participantCount,
        uint date, 
        Oracle.MatchOutcome outcome, 
        int8 winner) { 

        return Oracle.getMatch(_matchId); 
    }

    function placeBet(bytes32 _matchId, uint8 _chosenWinner) public payable {
 
    }

}