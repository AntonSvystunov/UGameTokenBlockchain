pragma solidity >=0.4.22 <0.8.0;

import './Ownable.sol';
import "@chainlink/contracts/src/v0.5/ChainlinkClient.sol";
import './UGameToken.sol';

contract Oracle is Ownable, ChainlinkClient {
    Match[] matches;
    mapping(bytes32 => uint) matchIdToIndex; 

    event MatchAdded (
        address indexed _by,
        address _player1,
        address _player2,
        bytes32 indexed _matchId,
        uint256 _matchValue
    );

    event MatchFinished(
        address indexed _by,
        bytes32 indexed _matchId,
        address _winner
    );

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
        bool player1Payed;
        bool player2Payed;
    }

    UGameToken public tokenCotract;
    address payable internal admin;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    constructor(UGameToken _tokenContract) public {
        tokenCotract = _tokenContract;
        admin = msg.sender;
        // setPublicChainlinkToken();

        // // Change in future!
        // oracle = 0x2f90A6D021db21e1B2A077c5a37B3C7E75D15b7e;
        // jobId = "29fa9aa13bf1468788b7cc4a500a45b8";
        // fee = 0.1 * 10 ** 18; 
    }

    function getMatch(bytes32 _matchId) public view returns (bytes32 id,
        address player1,
        address player2,
        MatchOutcome outcome,
        uint256 matchValue,
        address winner,
        bool player1Payed,
        bool player2Payed)
    {
        if (matchExists(_matchId)) {
            Match storage matchFound = matches[_getMatchIndex(_matchId)];
            return (matchFound.id, 
                    matchFound.player1, 
                    matchFound.player2, 
                    matchFound.outcome, 
                    matchFound.matchValue, 
                    matchFound.winner,
                    matchFound.player1Payed,
                    matchFound.player2Payed); 
        }
        else {
            revert('Match not found by id'); 
        }
    }
    
    function getMatches() public view returns (bytes32[] memory ids)
    {
        ids = new bytes32[](matches.length); 

        if (matches.length > 0) {
            uint index = 0;
            for (uint n = matches.length; n > 0; n--) {
                ids[index++] = matches[n-1].id;
            }
        }
        
        return ids; 
    }

    function _updateMatches() private {
        // Update
    }
    
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
        require(!matchExists(_id));
        
        uint newIndex = matches.push(Match(_id, _player1, _player2, MatchOutcome.Planned, _matchValue, address(0x0), false, false)) - 1; 
        matchIdToIndex[_id] = newIndex + 1;
        emit MatchAdded(msg.sender, _player1, _player2, _id, _matchValue);
    }

    function addMatchByid(string memory _id, address _player1, address _player2, uint256 _matchValue) public {
        //require(msg.sender == _player1 || msg.sender == _player2);
        bytes32 genId = keccak256(abi.encodePacked(_id));
        addMatch(genId, _player1, _player2, _matchValue);
    }

    function playerInMatchAndNotPayed(bytes32 _matchId, address _player) public view returns (bool) {
        if (matches.length == 0)
            return false;
        uint index = matchIdToIndex[_matchId]; 

        return (matches[index].player1 == _player && !matches[index].player1Payed) || (matches[index].player2 == _player && !matches[index].player2Payed);
    }

    function payForBet(bytes32 _matchId) public payable {
        require(matchExists(_matchId));
        require(playerInMatchAndNotPayed(_matchId, msg.sender));

        uint index = matchIdToIndex[_matchId]; 

        tokenCotract.transferFrom(msg.sender, admin, matches[index].matchValue);
        if (msg.sender == matches[index].player1) {
            matches[index].player1Payed = true;
        } else {
            matches[index].player2Payed = true;
        }
    }
    // For test only
    function updateOracle(string memory _matchId, address _winner) public {
        bytes32 genId = keccak256(abi.encodePacked(_matchId));
        require(matchExists(genId));
        uint index = matchIdToIndex[genId];
        require(matches[index].outcome == MatchOutcome.Planned); 

        if (_winner == matches[index].player1 || _winner == matches[index].player2) {
            matches[index].winner = _winner;
            matches[index].outcome = MatchOutcome.Planned;

            if (_winner == matches[index].player1) {
                tokenCotract.transferFrom(matches[index].player1, matches[index].player2, matches[index].matchValue);
            } else {
                tokenCotract.transferFrom(matches[index].player2, matches[index].player1, matches[index].matchValue);
            }
        } else {
            revert('Winner not participant');
        }
    }
}