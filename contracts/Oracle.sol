pragma solidity >=0.4.22 <0.8.0;

import './Ownable.sol';
import "@chainlink/contracts/src/v0.5/ChainlinkClient.sol";
import './UGameToken.sol';

contract Oracle is Ownable, ChainlinkClient {
    Match[] matches;
    mapping(bytes32 => uint) matchIdToIndex; 
    UGameToken public tokenCotract;

    enum MatchOutcome {
        Planned,
        Finished
    }

    struct Match {
        bytes32 id;
        address player1;
        address player2;
        MatchOutcome outcome;
        uint256 matchValue;
        address winner;
    }

    constructor(UGameToken _tokenContract) public {
        tokenCotract = _tokenContract;
    }

    // function getMatch(bytes32 _id) public returns (bytes32 id,
    //     address player1,
    //     address player2,
    //     MatchOutcome outcome,
    //     bytes32 externalId);

    // function getMatches() public returns (bytes32[] memory ids);
    
    function _getMatchIndex(bytes32 _matchId) private view returns (uint) {
        return matchIdToIndex[_matchId]-1; 
    }

    function matchExists(bytes32 _matchId) public view returns (bool) {
        if (matches.length == 0)
            return false;
        uint index = matchIdToIndex[_matchId]; 
        return (index > 0); 
    }

    function addMatch(bytes32 _id, address _player1, address _player2, uint256 _matchValue) public {
        require(tokenCotract.balanceOf(_player1) >= _matchValue);
        require(tokenCotract.balanceOf(_player2) >= _matchValue);
        require(msg.sender == _player1 || msg.sender == _player2);
        require(!matchExists(_id));

        uint newIndex = matches.push(Match(_id, _player1, _player2, MatchOutcome.Planned, _matchValue, address(0x0))) - 1; 
        matchIdToIndex[_id] = newIndex + 1;
    }
}