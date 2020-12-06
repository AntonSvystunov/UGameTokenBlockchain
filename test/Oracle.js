const UGameToken = artifacts.require('./UGameToken.sol');
const Oracle = artifacts.require('./Oracle.sol');

contract('Oracle', accounts => {
    let tokenInstance;
    let oracle;
    
    it('oracle match created', () => {
        return Oracle.deployed()
            .then(instance => {
                oracle = instance;
                console.log(oracle.addMatchByid);
                return oracle.addMatchByid('123', accounts[0], accounts[1], 100);
            })
            .then(() => {
                return oracle.getMatches();
            })
            .then((matchesArray) => {
                assert.equal(matchesArray.length, 1, 'Matches length = 1');
                return oracle.updateOracle('123', accounts[1]);
            });
    });
});