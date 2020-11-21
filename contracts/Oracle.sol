pragma solidity ^0.5.0;

import './Ownable.sol';

contract Oracle is Ownable {
    enum MatchOutcome {
        Planned,
        InProgress,
        Cancelled,
        Finished
    }
}